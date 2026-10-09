// Shared image helpers for the content scripts.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { IMAGE_EXT } from "../../plugins/content.ts";

sharp.cache(false); // keep no file handles open, so a file can be recompressed in place on Windows

export const MAX_EDGE = 1440;

/** Turns any text into a content folder name: lowercase words joined by hyphens. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .replace(/-$/, "");
}

/**
 * Shrinks `input` and saves it as `<folder>/image.avif` (or `.webp`).
 * Other `image.*` files in the folder are removed, so each entry has one image.
 */
export async function compressTo(input: string | Buffer, folder: string, webp = false) {
  const source = typeof input === "string" ? fs.readFileSync(input) : input;
  const pipeline = sharp(source)
    .rotate() // apply EXIF orientation before metadata is dropped
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
  const buffer = await (webp ? pipeline.webp({ quality: 75, effort: 6 }) : pipeline.avif({ quality: 45, effort: 9, chromaSubsampling: "4:2:0" })).toBuffer();
  const ext = webp ? ".webp" : ".avif";
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, "image" + ext), buffer);

  const removed: string[] = [];
  for (const other of IMAGE_EXT) {
    const candidate = path.join(folder, "image" + other);
    if (other !== ext && fs.existsSync(candidate)) {
      fs.unlinkSync(candidate);
      removed.push("image" + other);
    }
  }
  const { width, height } = await sharp(buffer).metadata();
  return { file: "image" + ext, before: source.length, after: buffer.length, width, height, removed };
}

/** A small JPEG data URL of an image, for sending to a vision model. */
export async function previewDataUrl(file: string, edge = 512): Promise<string> {
  const buffer = await sharp(fs.readFileSync(file)).resize({ width: edge, height: edge, fit: "inside" }).jpeg({ quality: 80 }).toBuffer();
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}
