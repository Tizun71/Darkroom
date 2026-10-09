// Adds an image to the gallery: shrinks it and saves it as content/<name>/image.avif.
// Also creates content/<name>/prompt.md from a template when it does not exist yet.
//
//   npm run add -- <image> [name] [--webp]
//
//   npm run add -- ~/Downloads/poster.png harbor-at-dawn
//     -> content/harbor-at-dawn/image.avif
//     -> content/harbor-at-dawn/prompt.md  (fill in the fields and paste the prompt)
//
// Defaults: long edge at most 1440 px, AVIF quality 45, metadata removed.
// Running it on an image already in content/ recompresses it in place.
// --webp writes WebP quality 75 instead, for tools that cannot open AVIF.
// `npm run compress` is the same command.
import fs from "node:fs";
import path from "node:path";
import { PROMPT_FILE } from "../plugins/content.ts";
import { compressTo, slugify } from "./lib/image.ts";

const args = process.argv.slice(2);
const webp = args.includes("--webp");
const [input, nameArg] = args.filter((a) => !a.startsWith("--"));

if (!input) {
  console.error("Usage: npm run add -- <image> [name] [--webp]");
  process.exit(1);
}
if (!fs.existsSync(input)) {
  console.error(`File not found: ${input}`);
  process.exit(1);
}

const slug = slugify(nameArg ?? path.basename(input, path.extname(input)));
const folder = path.resolve(import.meta.dirname, "..", "content", slug);

const result = await compressTo(input, folder, webp);
result.removed.forEach((f) => console.log(`Removed content/${slug}/${f}`));
const kb = (n: number) => `${Math.round(n / 1024)} KB`;
console.log(`Saved content/${slug}/${result.file}: ${result.width}x${result.height}, ${kb(result.before)} -> ${kb(result.after)}`);

const promptPath = path.join(folder, PROMPT_FILE);
if (!fs.existsSync(promptPath)) {
  const title = slug.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(
    promptPath,
    `---\ntitle: ${title}\nmodel: GPT Image\ndate: ${today}\ntags: poster\nauthor:\n---\nPaste the full prompt here.\n`
  );
  console.log(`Created content/${slug}/${PROMPT_FILE}. Fill in the fields and paste the prompt, then run: npm run check`);
}
