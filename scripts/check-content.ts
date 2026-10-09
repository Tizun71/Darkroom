// Validates everything in /content. Runs in CI on every pull request:
//   npm run check
// Exits with code 1 and a list of problems when something needs fixing.
import fs from "node:fs";
import path from "node:path";
import { IMAGE_EXT, list, parseAuthor, readContent } from "../plugins/gallery.ts";

const dir = path.resolve(import.meta.dirname, "..", "content");
const MAX_BYTES = 1.5 * 1024 * 1024;
const SOFT_BYTES = 500 * 1024;
const MIN_EDGE = 512;
const MAX_EDGE = 2560;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const { entries, problems, files } = readContent(dir);
const errors = [...problems];
const warnings: string[] = [];

for (const e of entries) {
  const where = `content/${e.file}`;
  if (!SLUG.test(e.id)) errors.push(`${where}: file name must be lowercase words joined by hyphens, like "harbor-at-dawn.md".`);
  if (!e.meta.title) errors.push(`${where}: add a "title:" line.`);
  if (!e.meta.model) errors.push(`${where}: add a "model:" line, for example "model: Midjourney v7".`);
  if (!e.meta.date || !DATE.test(e.meta.date) || Number.isNaN(Date.parse(e.meta.date))) {
    errors.push(`${where}: add "date:" in YYYY-MM-DD format, for example "date: 2026-09-25".`);
  }
  if (list(e.meta.tags).length === 0) errors.push(`${where}: add at least one tag, for example "tags: portrait, film".`);
  if (e.prompt.length < 20) errors.push(`${where}: the prompt looks too short. Paste the full prompt you used.`);
  if (e.meta.author && !parseAuthor(e.meta.author)) {
    errors.push(`${where}: "author:" must be your X profile link (https://x.com/you), your GitHub profile link, or your GitHub username.`);
  }
  if (e.imageUrl) errors.push(`${where}: upload the image file instead of linking to a URL, so it cannot disappear later.`);
  if (e.imageFile) {
    if (e.bytes !== null && e.bytes > MAX_BYTES) {
      errors.push(`content/${e.imageFile}: ${(e.bytes / 1024 / 1024).toFixed(1)} MB is too large. Run: npm run compress -- content/${e.imageFile}`);
    } else if (e.bytes !== null && e.bytes > SOFT_BYTES) {
      warnings.push(`content/${e.imageFile}: ${Math.round(e.bytes / 1024)} KB. Smaller loads faster: npm run compress -- content/${e.imageFile}`);
    }
    if (e.width && e.height) {
      const long = Math.max(e.width, e.height);
      if (long > MAX_EDGE) errors.push(`content/${e.imageFile}: ${e.width}x${e.height} is too big. Resize so the long edge is at most ${MAX_EDGE}px.`);
      if (long < MIN_EDGE) errors.push(`content/${e.imageFile}: ${e.width}x${e.height} is too small. The long edge should be at least ${MIN_EDGE}px.`);
    }
  }
}

// Images that no prompt file points to
const used = new Set(entries.map((e) => e.imageFile).filter(Boolean));
for (const f of files) {
  if (IMAGE_EXT.includes(path.extname(f).toLowerCase()) && !used.has(f)) {
    errors.push(`content/${f}: this image has no matching .md file. Add ${path.basename(f, path.extname(f))}.md with its prompt.`);
  }
}
for (const f of files) {
  const ext = path.extname(f).toLowerCase();
  if (ext !== ".md" && !IMAGE_EXT.includes(ext) && fs.statSync(path.join(dir, f)).isFile()) {
    errors.push(`content/${f}: unexpected file type. Only images and .md files belong in content.`);
  }
}

if (warnings.length) {
  console.warn(`Suggestions:
`);
  warnings.forEach((w) => console.warn(`  - ${w}`));
  console.warn("");
}

if (errors.length) {
  console.error(`Found ${errors.length} problem${errors.length === 1 ? "" : "s"} in content:\n`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log(`content is valid: ${entries.length} ${entries.length === 1 ? "prompt" : "prompts"} checked.`);
