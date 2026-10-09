// Shrinks an image for the gallery and saves it into /content.
//
//   npm run compress -- <image> [name] [--webp]
//
//   npm run compress -- ~/Downloads/poster.png harbor-at-dawn
//     -> content/harbor-at-dawn.avif
//
// Defaults: long edge at most 1600 px, AVIF quality 50, metadata removed.
// --webp writes WebP quality 75 instead, for tools that cannot open AVIF.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { IMAGE_EXT } from "../plugins/gallery.ts";

const MAX_EDGE = 1600;
const args = process.argv.slice(2);
const webp = args.includes("--webp");
const [input, nameArg] = args.filter((a) => !a.startsWith("--"));

if (!input) {
  console.error("Usage: npm run compress -- <image> [name] [--webp]");
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
const contentDir = path.resolve(import.meta.dirname, "..", "content");
const ext = webp ? ".webp" : ".avif";
const output = path.join(contentDir, slug + ext);

const before = fs.statSync(input).size;
const pipeline = sharp(input)
  .rotate() // apply EXIF orientation before metadata is dropped
  .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
const buffer = await (webp ? pipeline.webp({ quality: 75, effort: 6 }) : pipeline.avif({ quality: 50, effort: 6 })).toBuffer();
fs.mkdirSync(contentDir, { recursive: true });
fs.writeFileSync(output, buffer);

// Remove other images with the same name in /content, so each prompt has exactly one image
for (const other of IMAGE_EXT) {
  const candidate = path.join(contentDir, slug + other);
  if (other !== ext && fs.existsSync(candidate)) {
    fs.unlinkSync(candidate);
    console.log(`Removed content/${slug}${other}`);
  }
}

const { width, height } = await sharp(buffer).metadata();
const kb = (n: number) => `${Math.round(n / 1024)} KB`;
console.log(`Saved content/${slug}${ext}: ${width}x${height}, ${kb(before)} -> ${kb(buffer.length)}`);
if (!fs.existsSync(path.join(contentDir, `${slug}.md`))) {
  console.log(`Next: create content/${slug}.md with the prompt.`);
}
