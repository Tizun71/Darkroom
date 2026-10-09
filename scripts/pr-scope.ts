// Decides whether a pull request can be reviewed and merged automatically.
//
//   gh api repos/<owner>/<repo>/pulls/<n>/files --paginate > files.json
//   node scripts/pr-scope.ts files.json
//
// Automatic only when every file is newly added as content/<slug>/prompt.md or
// content/<slug>/image.<ext>, and <slug> does not exist yet. Anything else (code,
// workflows, edits or deletions of existing entries) needs a human.
//
// Prints `scope=auto` and `slugs=a b c`, or `scope=human` and `reason=...`, to stdout
// and GITHUB_OUTPUT.
import fs from "node:fs";
import path from "node:path";
import { IMAGE_EXT, PROMPT_FILE } from "../plugins/content.ts";

type PrFile = { filename: string; status: string };

const contentDir = path.resolve(import.meta.dirname, "..", "content");
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function scope(files: PrFile[], exists: (slug: string) => boolean): { auto: true; slugs: string[] } | { auto: false; reason: string } {
  if (!files.length) return { auto: false, reason: "The pull request changes no files." };
  const slugs = new Set<string>();
  for (const f of files) {
    const parts = f.filename.split("/");
    if (parts.length !== 3 || parts[0] !== "content") return { auto: false, reason: `${f.filename} is outside a content/<name>/ folder.` };
    const [, slug, name] = parts;
    const ext = path.extname(name).toLowerCase();
    if (name !== PROMPT_FILE && !(name.startsWith("image.") && IMAGE_EXT.includes(ext))) {
      return { auto: false, reason: `${f.filename}: only ${PROMPT_FILE} and image.* belong in an entry folder.` };
    }
    if (f.status !== "added") return { auto: false, reason: `${f.filename} is ${f.status}. Only new entries are merged automatically.` };
    if (!SLUG.test(slug)) return { auto: false, reason: `content/${slug}/: folder name must be lowercase words joined by hyphens.` };
    if (exists(slug)) return { auto: false, reason: `content/${slug}/ already exists.` };
    slugs.add(slug);
  }
  return { auto: true, slugs: [...slugs] };
}

if (import.meta.filename === path.resolve(process.argv[1] ?? "")) {
  const files = JSON.parse(fs.readFileSync(process.argv[2], "utf8")) as PrFile[];
  const result = scope(files.flat(), (slug) => fs.existsSync(path.join(contentDir, slug)));
  const lines = result.auto ? ["scope=auto", `slugs=${result.slugs.join(" ")}`] : ["scope=human", `reason=${result.reason}`];
  console.log(lines.join("\n"));
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, lines.join("\n") + "\n");
}
