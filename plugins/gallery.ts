import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";
import type { Plugin, ViteDevServer } from "vite";

/**
 * Turns the /content folder into a virtual module, `virtual:gallery`.
 *
 * Every `name.md` becomes one entry. Its image is `name.jpg|png|webp|avif|gif`
 * next to it, or whatever the `image:` field points to (a file in /content or
 * an https URL). Image sizes are read at build time so the grid never jumps.
 *
 * `readContent` is shared with `scripts/check-content.ts`, which validates
 * contributions in CI.
 */

const VIRTUAL_ID = "virtual:gallery";
const RESOLVED_ID = "\0" + VIRTUAL_ID;
export const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"];

type Meta = Record<string, string>;

export type ContentEntry = {
  id: string;
  file: string;
  meta: Meta;
  prompt: string;
  /** File name inside /content, or null when the image is a URL */
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

/** Reads every entry in the content folder. Entries that cannot be shown are reported in `problems`. */
export function readContent(dir: string): { entries: ContentEntry[]; problems: string[]; files: string[] } {
  const entries: ContentEntry[] = [];
  const problems: string[] = [];
  if (!fs.existsSync(dir)) return { entries, problems, files: [] };
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (!file.toLowerCase().endsWith(".md") || file.toLowerCase() === "readme.md") continue;
    const id = path.basename(file, ".md");
    const { meta, body } = parse(fs.readFileSync(path.join(dir, file), "utf8"));
    if (!body) {
      problems.push(`content/${file}: no prompt text below the --- block.`);
      continue;
    }

    const entry: ContentEntry = { id, file, meta, prompt: body, imageFile: null, imageUrl: null, bytes: null, width: null, height: null };

    if (meta.image && /^https?:\/\//.test(meta.image)) {
      entry.imageUrl = meta.image;
    } else {
      const imgFile = meta.image || files.find((f) => IMAGE_EXT.some((ext) => f.toLowerCase() === id.toLowerCase() + ext));
      if (!imgFile || !fs.existsSync(path.join(dir, imgFile))) {
        problems.push(`content/${file}: no image found. Add ${id}.jpg (or .png, .webp) next to it.`);
        continue;
      }
      entry.imageFile = imgFile;
      const buf = fs.readFileSync(path.join(dir, imgFile));
      entry.bytes = buf.length;
      try {
        const size = imageSize(buf);
        entry.width = size.width ?? null;
        entry.height = size.height ?? null;
      } catch {
        problems.push(`content/${imgFile}: could not read the image. Is the file corrupted?`);
      }
    }
    entries.push(entry);
  }
  return { entries, problems, files };
}

function generate(dir: string, warn: (msg: string) => void): string {
  const { entries, problems } = readContent(dir);
  problems.forEach(warn);
  const imports: string[] = [];
  const items = entries.map((e, i) => {
    let src = JSON.stringify(e.imageUrl);
    if (e.imageFile) {
      imports.push(`import img${i} from ${JSON.stringify("/content/" + e.imageFile)};`);
      src = `img${i}`;
    }
    return `{
      id: ${JSON.stringify(e.id)},
      title: ${JSON.stringify(e.meta.title || e.id.replace(/[-_]+/g, " "))},
      prompt: ${JSON.stringify(e.prompt)},
      negative: ${JSON.stringify(e.meta.negative || "")},
      model: ${JSON.stringify(e.meta.model || "")},
      date: ${JSON.stringify(e.meta.date || "")},
      author: ${JSON.stringify(parseAuthor(e.meta.author))},
      tags: ${JSON.stringify(list(e.meta.tags))},
      src: ${src},
      width: ${e.width},
      height: ${e.height}
    }`;
  });
  return `${imports.join("\n")}
const entries = [${items.join(",")}];
entries.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
export default entries;`;
}

export default function gallery(contentDir = "content"): Plugin {
  let dir = "";
  let server: ViteDevServer | undefined;

  return {
    name: "darkroom-gallery",
    configResolved(config) {
      dir = path.resolve(config.root, contentDir);
    },
    configureServer(s) {
      server = s;
      s.watcher.add(dir);
      const reload = (file: string) => {
        if (!path.resolve(file).startsWith(dir)) return;
        const mod = s.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) s.moduleGraph.invalidateModule(mod);
        s.ws.send({ type: "full-reload" });
      };
      s.watcher.on("add", reload);
      s.watcher.on("unlink", reload);
      s.watcher.on("change", reload);
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id !== RESOLVED_ID) return;
      const warn = (msg: string) => (server ? server.config.logger.warn(`[gallery] ${msg}`) : this.warn(msg));
      return generate(dir, warn);
    }
  };
}
