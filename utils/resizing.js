import sharp from "sharp";
import fs from "fs";
import path from "path";
import mime from "mime";

export async function resizeImage(inputPath, mimeType, originalFilename, width, height = null, fit = 'cover') {
  const outputDir = "optimized";
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  
  const ext = mime.getExtension(mimeType);
  const baseName = path.parse(originalFilename).name;
  const fileName = `${baseName}-resized.${ext}`;
  const outputPath = path.join(outputDir, fileName);

  let converted = sharp(inputPath);
  
  // Resize options
  const resizeOptions = { width };
  if (height) resizeOptions.height = height;
  resizeOptions.fit = fit; // cover, contain, fill, inside, outside
  
  converted = converted.resize(resizeOptions);
  
  switch (mimeType) {
    case "image/jpeg":
    case "image/jpg":
      converted = converted.jpeg({ quality: 85 });
      break;
    case "image/png":
      converted = converted.png({ quality: 85 });
      break;
    case "image/webp":
      converted = converted.webp({ quality: 85 });
      break;
    case "image/gif":
      converted = converted.gif();
      break;
    default:
      converted = converted.webp({ quality: 85 });
  }

  await converted.toFile(outputPath);
  return outputPath;
}

export async function generateThumbnail(inputPath, mimeType, originalFilename, size = 150) {
  const outputDir = "optimized";
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  
  const ext = mime.getExtension(mimeType);
  const baseName = path.parse(originalFilename).name;
  const fileName = `${baseName}-thumbnail.${ext}`;
  const outputPath = path.join(outputDir, fileName);

  await sharp(inputPath)
    .resize(size, size, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toFile(outputPath);

  return outputPath;
}
