// Usage: npm run media
// Reads content/media.json, processes each source image from ../assets into
// public/media/<id>.jpg, and writes content/media.generated.json with the
// dimensions, a tiny blur placeholder and the dominant colour for every image.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "assets");
const outDir = join(root, "public", "media");
mkdirSync(outDir, { recursive: true });

/**
 * Accent colour: average of pixels weighted by saturation × brightness, so a
 * dark poster with a green glow yields green rather than black.
 */
async function accent(img) {
  const { data } = await img.resize(48, 48, { fit: "cover" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let r = 0, g = 0, b = 0, w = 0;
  for (let i = 0; i < data.length; i += 3) {
    const R = data[i], G = data[i + 1], B = data[i + 2];
    const max = Math.max(R, G, B), min = Math.min(R, G, B);
    const sat = max === 0 ? 0 : (max - min) / max;
    const weight = Math.pow(sat, 2) * (max / 255) + 1e-4;
    r += R * weight; g += G * weight; b += B * weight; w += weight;
  }
  // normalise brightness so the accent reads on a dark page
  let [R, G, B] = [r / w, g / w, b / w];
  const peak = Math.max(R, G, B) || 1;
  const k = Math.min(2.2, 230 / peak);
  return "#" + [R, G, B].map((v) => Math.round(Math.min(255, v * k)).toString(16).padStart(2, "0")).join("");
}

const MAX = 2400;
/** The share card (link previews) is cut from this image. */
const OG_SOURCE = "doomsday-title";

async function writeOgImage(src) {
  const appDir = join(root, "src", "app");
  await sharp(src).resize(1200, 630, { fit: "cover", position: "centre" }).flatten({ background: "#050807" }).jpeg({ quality: 85, mozjpeg: true }).toFile(join(appDir, "opengraph-image.jpg"));
  writeFileSync(join(appDir, "opengraph-image.alt.txt"), "Avengers: Doomsday title card. The Road to Doomsday, an evidence-labelled MCU guide.");
  console.log("✓ opengraph-image.jpg");
}

const list = JSON.parse(readFileSync(join(root, "content", "media.json"), "utf8"));
const out = {};

for (const m of list) {
  const src = join(srcDir, m.file);
  if (!existsSync(src)) {
    console.error(`✗ missing source for ${m.id}: ${m.file}`);
    process.exitCode = 1;
    continue;
  }
  // honour EXIF orientation, cap the long edge, flatten transparency onto the page colour
  const img = sharp(src).rotate().resize(MAX, MAX, { fit: "inside", withoutEnlargement: true }).flatten({ background: "#050807" });
  const { data: jpg, info } = await img.clone().jpeg({ quality: 86, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  writeFileSync(join(outDir, `${m.id}.jpg`), jpg);
  const { width, height } = info; // post-rotation, post-resize dimensions
  if (m.id === OG_SOURCE) await writeOgImage(src);
  const blur = await img.clone().resize(16).blur().jpeg({ quality: 50 }).toBuffer();
  const hex = await accent(img.clone());
  out[m.id] = {
    src: `/media/${m.id}.jpg`,
    width,
    height,
    blur: `data:image/jpeg;base64,${blur.toString("base64")}`,
    color: hex,
  };
  console.log(`✓ ${m.id.padEnd(22)} ${width}x${height} ${hex}`);
}

writeFileSync(join(root, "content", "media.generated.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${Object.keys(out).length} images.`);
