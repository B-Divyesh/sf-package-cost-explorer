import sharp from "sharp";

const source = "assets/src/package-ledger.png";
const outputs = [
  ["public/assets/package-ledger.webp", 1536, "webp", 72],
  ["public/assets/package-ledger-800.webp", 800, "webp", 70],
  ["public/assets/package-ledger.avif", 1536, "avif", 48],
  ["public/assets/package-ledger-800.avif", 800, "avif", 45],
];

await Promise.all(
  outputs.map(async ([path, width, format, quality]) => {
    const image = sharp(source).resize({ width: Number(width), withoutEnlargement: true });
    if (format === "avif") await image.avif({ quality: Number(quality), effort: 7 }).toFile(String(path));
    else await image.webp({ quality: Number(quality), effort: 6 }).toFile(String(path));
  }),
);

await sharp(source)
  .resize({ width: 1200, height: 630, fit: "cover", position: "centre" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("public/assets/social-card.jpg");

await sharp("public/favicon.svg")
  .resize(180, 180)
  .png({ compressionLevel: 9 })
  .toFile("public/apple-touch-icon.png");
