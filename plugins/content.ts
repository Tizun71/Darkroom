import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

/**
 * Reads the /content folder. Shared by the Vite plugin (`plugins/gallery.ts`)
 * and the content scripts (`scripts/check-content.ts`, `scripts/add-entry.ts`).
 *
 * Every entry is one folder, `content/<slug>/`, holding `prompt.md` and its
 * image `image.jpg|png|webp|avif|gif` (or whatever the `image:` field points
 * to: a file in that folder or an https URL).
 */

export const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"];

type Meta = Record<string, string>;

export type ContentEntry = {
  id: string;
  /** Path of prompt.md relative to /content, e.g. `harbor-at-dawn/prompt.md` */
  file: string;
  meta: Meta;
  prompt: string;
  /** Path relative to /content, e.g. `harbor-at-dawn/image.avif`, or null when the image is a URL */
  imageFile: string | null;
  imageUrl: string | null;
  bytes: number | null;
  width: number | null;
  height: number | null;
};

// Small frontmatter reader: `key: value` lines between --- fences.
export function parse(raw: string): { meta: Meta; body: string } {
  const text = raw.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!m) return { meta: {}, body: text.trim() };
  const meta: Meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i < 1) continue;
    const key = line.slice(0, i).trim().toLowerCase();
    const value = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (key) meta[key] = value;
  }
  return { meta, body: m[2].trim() };
}

export function list(value = ""): string[] {
  return value
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

export type Author = { name: string; url: string; avatar: string | null; platform: "x" | "github" | "web" };

const HANDLE = /^[A-Za-z0-9_-]{1,39}$/;

/**
 * `author:` accepts an X profile URL, a GitHub profile URL, or a bare GitHub username.
 * X and GitHub authors get an avatar from unavatar.io.
 */
export function parseAuthor(value = ""): Author | null {
  const v = value.trim();
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) {
    const handle = v.replace(/^@/, "");
    if (!HANDLE.test(handle)) return null;
    return { name: handle, url: `https://github.com/${handle}`, avatar: `https://unavatar.io/github/${handle}`, platform: "github" };
  }
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const handle = url.pathname.split("/").filter(Boolean)[0]?.replace(/^@/, "") ?? "";
  if ((host === "x.com" || host === "twitter.com") && HANDLE.test(handle)) {
    return { name: handle, url: `https://x.com/${handle}`, avatar: `https://unavatar.io/x/${handle}`, platform: "x" };
  }
  if (host === "github.com" && HANDLE.test(handle)) {
    return { name: handle, url: `https://github.com/${handle}`, avatar: `https://unavatar.io/github/${handle}`, platform: "github" };
  }
  return { name: host, url: url.href, avatar: null, platform: "web" };
}

export const PROMPT_FILE = "prompt.md";

/**
 * Reads every entry in the content folder. Entries that cannot be shown are reported in `problems`.
 * `files` lists every file as a path relative to /content, with forward slashes.
 */
export function readContent(dir: string): { entries: ContentEntry[]; problems: string[]; files: string[] } {
  const entries: ContentEntry[] = [];
  const problems: string[] = [];
  const files: string[] = [];
  if (!fs.existsSync(dir)) return { entries, problems, files };

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!item.isDirectory()) {
      files.push(item.name);
      continue;
    }
    const id = item.name;
    const folder = path.join(dir, id);
    const inFolder = fs.readdirSync(folder);
    inFolder.forEach((f) => files.push(`${id}/${f}`));

    const file = `${id}/${PROMPT_FILE}`;
    if (!inFolder.includes(PROMPT_FILE)) {
      problems.push(`content/${id}/: no ${PROMPT_FILE} in this folder.`);
      continue;
    }
    const { meta, body } = parse(fs.readFileSync(path.join(folder, PROMPT_FILE), "utf8"));
    if (!body) {
      problems.push(`content/${file}: no prompt text below the --- block.`);
      continue;
    }

    const entry: ContentEntry = { id, file, meta, prompt: body, imageFile: null, imageUrl: null, bytes: null, width: null, height: null };

    if (meta.image && /^https?:\/\//.test(meta.image)) {
      entry.imageUrl = meta.image;
    } else {
      const imgFile = meta.image || inFolder.find((f) => IMAGE_EXT.some((ext) => f.toLowerCase() === "image" + ext));
      if (!imgFile || !fs.existsSync(path.join(folder, imgFile))) {
        problems.push(`content/${id}/: no image found. Add image.jpg (or .png, .webp, .avif) to this folder.`);
        continue;
      }
      entry.imageFile = `${id}/${imgFile}`;
      const buf = fs.readFileSync(path.join(folder, imgFile));
      entry.bytes = buf.length;
      try {
        const size = imageSize(buf);
        entry.width = size.width ?? null;
        entry.height = size.height ?? null;
      } catch {
        problems.push(`content/${entry.imageFile}: could not read the image. Is the file corrupted?`);
      }
    }
    entries.push(entry);
  }
  return { entries, problems, files };
}
