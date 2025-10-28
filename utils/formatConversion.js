import sharp from "sharp";
import fs from "fs";
import path from "path";

export async function convertToWebP(inputPath, originalFilename, quality = 80) {
  const outputDir = "optimized";
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  
  const baseName = path.parse(originalFilename).name;
  const fileName = `${baseName}-webp.webp`;
  const outputPath = path.join(outputDir, fileName);

  await sharp(inputPath)
    .resize({ width: 1080, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputPath);

  return outputPath;
}

export async function convertToAVIF(inputPath, originalFilename, quality = 80) {
  const outputDir = "optimized";
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  
  const baseName = path.parse(originalFilename).name;
  const fileName = `${baseName}-avif.avif`;
  const outputPath = path.join(outputDir, fileName);

  await sharp(inputPath)
    .resize({ width: 1080, withoutEnlargement: true })
    .avif({ quality })
    .toFile(outputPath);

  return outputPath;
}
