import sharp from "sharp";
import fs from "fs";
import path from "path";
import mime from "mime";

export async function compressImage(inputPath, mimeType, originalFilename, quality = 100) {
  const outputDir = "optimized";
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  
  const ext = mime.getExtension(mimeType);
  const baseName = path.parse(originalFilename).name;
  const fileName = `${baseName}-compressed.${ext}`;
  const outputPath = path.join(outputDir, fileName);

  let converted = sharp(inputPath).resize({ width: 1080, withoutEnlargement: true });
  
  switch (mimeType) {
    case "image/jpeg":
    case "image/jpg":
      converted = converted.jpeg({ quality });
      break;
    case "image/png":
      converted = converted.png({ quality });
      break;
    case "image/webp":
      converted = converted.webp({ quality });
      break;
    case "image/gif":
      converted = converted.gif();
      break;
    default:
      converted = converted.webp({ quality });
  }

  await converted.toFile(outputPath);
  return outputPath;
}
