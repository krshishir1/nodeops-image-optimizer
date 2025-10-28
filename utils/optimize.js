import sharp from "sharp";
import fs from "fs";
import path from "path";
import mime from "mime";

export async function optimizeImage(inputPath, mimeType = null, originalFilename = null) {
  const outputDir = "optimized";
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  
  // Get image type from input file
  if (!mimeType) {
    mimeType = mime.getType(inputPath);
  }
  
  const ext = mime.getExtension(mimeType);
  
  // Use original filename if provided, otherwise generate one
  let fileName;
  if (originalFilename) {
    // Get base name without extension
    const baseName = path.parse(originalFilename).name;
    fileName = `${baseName}.${ext}`;
  } else {
    fileName = `${Date.now()}-optimized.${ext}`;
  }
  
  const outputPath = path.join(outputDir, fileName);

  // Convert based on the detected image type
  let converted = sharp(inputPath).resize({ width: 1080, withoutEnlargement: true });
  
  switch (mimeType) {
    case "image/jpeg":
    case "image/jpg":
      converted = converted.jpeg({ quality: 100 });
      break;
    case "image/png":
      converted = converted.png({ quality: 100 });
      break;
    case "image/webp":
      converted = converted.webp({ quality: 100 });
      break;
    case "image/gif":
      converted = converted.gif();
      break;
    default:
      // Default to webp for unsupported formats
      converted = converted.webp({ quality: 100 });
  }

  await converted.toFile(outputPath);

  return outputPath;
}
