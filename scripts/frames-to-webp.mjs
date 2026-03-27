/**
 * Batch-convert PNG/JPEG in public/terminal to WebP (smaller + faster decode for scroll sequences).
 * Usage: npm run optimize:frames
 * Then remove the originals if you only want WebP, and refresh the page (manifest picks up new files).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dir = path.join(root, "public", "terminal");

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error(
    "Install sharp first: npm install sharp --save-dev"
  );
  process.exit(1);
}

if (!fs.existsSync(dir)) {
  console.error("Missing folder:", dir);
  process.exit(1);
}

const files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f));
if (files.length === 0) {
  console.log("No PNG/JPEG files in public/terminal.");
  process.exit(0);
}

for (const file of files) {
  const input = path.join(dir, file);
  const base = file.replace(/\.(png|jpe?g)$/i, "");
  const output = path.join(dir, `${base}.webp`);
  await sharp(input)
    .webp({ quality: 85, effort: 4 })
    .toFile(output);
  console.log("Wrote", path.relative(root, output));
}

console.log("\nDone. Delete old PNG/JPEG files if you only want WebP in the sequence.");
