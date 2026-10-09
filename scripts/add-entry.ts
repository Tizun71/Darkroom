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
import sharp from "sharp";
import { IMAGE_EXT, PROMPT_FILE } from "../plugins/gallery.ts";

const MAX_EDGE = 1440;
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

const slug = (nameArg ?? path.basename(input, path.extname(input)))
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
const folder = path.resolve(import.meta.dirname, "..", "content", slug);
const ext = webp ? ".webp" : ".avif";
const output = path.join(folder, "image" + ext);

const before = fs.statSync(input).size;
const pipeline = sharp(input)
  .rotate() // apply EXIF orientation before metadata is dropped
  .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
const buffer = await (webp ? pipeline.webp({ quality: 75, effort: 6 }) : pipeline.avif({ quality: 45, effort: 9, chromaSubsampling: "4:2:0" })).toBuffer();
fs.mkdirSync(folder, { recursive: true });
fs.writeFileSync(output, buffer);

// Remove other images in the folder, so each prompt has exactly one image
for (const other of IMAGE_EXT) {
  const candidate = path.join(folder, "image" + other);
  if (other !== ext && fs.existsSync(candidate) && path.resolve(candidate) !== path.resolve(input)) {
    fs.unlinkSync(candidate);
    console.log(`Removed content/${slug}/image${other}`);
  }
}

const { width, height } = await sharp(buffer).metadata();
const kb = (n: number) => `${Math.round(n / 1024)} KB`;
console.log(`Saved content/${slug}/image${ext}: ${width}x${height}, ${kb(before)} -> ${kb(buffer.length)}`);

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
