import { createCanvas, registerFont } from "canvas";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import toIco from "to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const publicDir = join(rootDir, "public");
const fontsDir = join(__dirname, "fonts");
const fontPath = join(fontsDir, "PlayfairDisplay-Bold.ttf");

const BURGUNDY = "#33181C";
const CREAM = "#EAECE4";

async function ensureFont() {
  if (existsSync(fontPath)) {
    return;
  }

  mkdirSync(fontsDir, { recursive: true });

  const cssResponse = await fetch(
    "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap"
  );
  const css = await cssResponse.text();
  const fontUrlMatch = css.match(/src: url\(([^)]+)\)/);

  if (!fontUrlMatch) {
    throw new Error("Could not resolve Playfair Display font URL.");
  }

  const fontResponse = await fetch(fontUrlMatch[1]);
  const fontBuffer = Buffer.from(await fontResponse.arrayBuffer());
  writeFileSync(fontPath, fontBuffer);
}

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = BURGUNDY;
  ctx.fillRect(0, 0, size, size);

  const fontSize = Math.round(size * 0.42);
  ctx.font = `700 ${fontSize}px "Playfair Display"`;
  ctx.fillStyle = CREAM;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("F&C", size / 2, size / 2 + size * 0.02);

  return canvas;
}

async function main() {
  await ensureFont();
  registerFont(fontPath, { family: "Playfair Display", weight: "700" });

  const icon16 = drawIcon(16);
  const icon32 = drawIcon(32);
  const icon180 = drawIcon(180);

  const png32 = icon32.toBuffer("image/png");
  const png180 = icon180.toBuffer("image/png");
  const ico = await toIco([icon16.toBuffer("image/png"), png32]);

  writeFileSync(join(publicDir, "favicon.ico"), ico);
  writeFileSync(join(publicDir, "favicon-32x32.png"), png32);
  writeFileSync(join(publicDir, "apple-touch-icon.png"), png180);

  console.log("Generated favicon.ico, favicon-32x32.png, and apple-touch-icon.png");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
