// Turns a "Submit a prompt" issue into a content folder. Runs in GitHub Actions.
//
//   node scripts/intake-issue.ts            reads the issue from GITHUB_EVENT_PATH
//   node scripts/intake-issue.ts event.json reads it from a file, for local testing
//
// Writes content/<slug>/prompt.md and image.avif, prints `slug=<slug>` to GITHUB_OUTPUT,
// and writes intake.json. On a problem with the submission it writes the reason to
// intake.json and exits with code 1.
import fs from "node:fs";
import path from "node:path";
import { PROMPT_FILE } from "../plugins/content.ts";
import { compressTo, slugify } from "./lib/image.ts";

const MAX_DOWNLOAD = 20 * 1024 * 1024;
const OUT = path.resolve(process.env.INTAKE_OUT || "intake.json");
const contentDir = path.resolve(import.meta.dirname, "..", "content");

type Issue = { number: number; body: string | null; user: { login: string } };

function fail(reason: string): never {
  fs.writeFileSync(OUT, JSON.stringify({ ok: false, reason }, null, 2));
  console.error(reason);
  process.exit(1);
}

/** Splits an issue form body into { "title": "...", "prompt": "..." } by its `### Heading` lines. */
function sections(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  const parts = body.replace(/\r\n/g, "\n").split(/^### +/m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf("\n");
    const key = (nl < 0 ? part : part.slice(0, nl)).trim().toLowerCase();
    let value = nl < 0 ? "" : part.slice(nl + 1).trim();
    if (value === "_No response_") value = "";
    out[key] = value;
  }
  return out;
}

const oneLine = (s = "", max = 120) => s.replace(/\s+/g, " ").replace(/^["'-]+/, "").trim().slice(0, max);
const unfence = (s = "") => s.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/, "").trim();

function imageUrl(text = ""): string | null {
  const m = /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/.exec(text) ?? /<img[^>]+src="(https?:\/\/[^"]+)"/i.exec(text) ?? /(https?:\/\/\S+)/.exec(text);
  return m ? m[1] : null;
}

function allowedHost(url: string): boolean {
  const host = new URL(url).hostname.toLowerCase();
  return host === "github.com" || host.endsWith(".githubusercontent.com");
}

async function download(url: string): Promise<Buffer> {
  if (!allowedHost(url)) fail("Upload the image into the issue (drag and drop it into the Image box). Links to other sites are not accepted.");
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok || !allowedHost(res.url)) fail(`Could not download the image (HTTP ${res.status}). Try uploading it again.`);
  const size = Number(res.headers.get("content-length") || 0);
  if (size > MAX_DOWNLOAD) fail("The image is larger than 20 MB.");
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_DOWNLOAD) fail("The image is larger than 20 MB.");
  return buf;
}

const eventFile = process.argv[2] || process.env.GITHUB_EVENT_PATH;
if (!eventFile) fail("No event file. Pass one as the first argument.");
const issue = (JSON.parse(fs.readFileSync(eventFile, "utf8")) as { issue: Issue }).issue;
const form = sections(issue.body ?? "");

const title = oneLine(form["title"], 80);
const model = oneLine(form["model"], 60);
const prompt = unfence(form["prompt"]);
const negative = oneLine(unfence(form["negative prompt"]), 500);
const tags = (form["tags"] ?? "")
  .split(/[,\n]/)
  .map((t) => slugify(t))
  .filter(Boolean)
  .slice(0, 8);

const missing = [!title && "Title", !model && "Model", !prompt && "Prompt", !tags.length && "Tags"].filter(Boolean);
if (missing.length) fail(`Missing: ${missing.join(", ")}. Edit the issue to add ${missing.length === 1 ? "it" : "them"}.`);
const url = imageUrl(form["image"]);
if (!url) fail("No image found. Edit the issue and drag the image into the Image box.");

const base = slugify(title) || `prompt-${issue.number}`;
let slug = base;
for (let n = 2; fs.existsSync(path.join(contentDir, slug)); n++) slug = `${base}-${n}`;
const folder = path.join(contentDir, slug);

const source = await download(url!);
let result;
try {
  result = await compressTo(source, folder);
} catch {
  fs.rmSync(folder, { recursive: true, force: true });
  fail("The file is not an image that can be read. Upload a .png, .jpg, .webp or .avif file.");
}
if (Math.max(result.width ?? 0, result.height ?? 0) < 512) {
  fs.rmSync(folder, { recursive: true, force: true });
  fail(`The image is ${result.width}x${result.height}. The long edge must be at least 512 px.`);
}

const today = new Date().toISOString().slice(0, 10);
const front = [
  "---",
  `title: ${title}`,
  `model: ${model}`,
  `date: ${today}`,
  `tags: ${tags.join(", ")}`,
  negative && `negative: ${negative}`,
  `author: ${issue.user.login}`,
  "---"
].filter(Boolean);
fs.writeFileSync(path.join(folder, PROMPT_FILE), `${front.join("\n")}\n${prompt}\n`);

fs.writeFileSync(OUT, JSON.stringify({ ok: true, slug, title }, null, 2));
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `slug=${slug}\n`);
console.log(`Created content/${slug}/ (${result.width}x${result.height}, ${Math.round(result.after / 1024)} KB)`);
