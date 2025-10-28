import sharp from "sharp";
import fs from "fs";
import path from "path";
import mime from "mime";

export async function addTextWatermark(inputPath, mimeType, originalFilename, text, options = {}) {
  const outputDir = "optimized";
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  
  const ext = mime.getExtension(mimeType);
  const baseName = path.parse(originalFilename).name;
  const fileName = `${baseName}-watermark.${ext}`;
  const outputPath = path.join(outputDir, fileName);

  const {
    fontSize = 24,
    color = 'white',
    opacity = 0.7,
    position = 'bottom-right',
    margin = 20
  } = options;

  // Create text watermark
  const textSvg = `
    <svg width="200" height="50">
      <text x="10" y="30" font-family="Arial" font-size="${fontSize}" fill="${color}" opacity="${opacity}">
        ${text}
      </text>
    </svg>
  `;

  let converted = sharp(inputPath);
  
  // Position watermark based on position parameter
  let compositeOptions;
  switch (position) {
    case 'top-left':
      compositeOptions = { input: Buffer.from(textSvg), top: margin, left: margin };
      break;
    case 'top-right':
      compositeOptions = { input: Buffer.from(textSvg), top: margin, right: margin };
      break;
    case 'bottom-left':
      compositeOptions = { input: Buffer.from(textSvg), bottom: margin, left: margin };
      break;
    case 'bottom-right':
    default:
      compositeOptions = { input: Buffer.from(textSvg), bottom: margin, right: margin };
      break;
    case 'center':
      compositeOptions = { input: Buffer.from(textSvg), top: '50%', left: '50%' };
      break;
  }

  converted = converted.composite([compositeOptions]);
  
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

export async function addImageWatermark(inputPath, mimeType, originalFilename, watermarkPath, options = {}) {
  const outputDir = "optimized";
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  
  const ext = mime.getExtension(mimeType);
  const baseName = path.parse(originalFilename).name;
  const fileName = `${baseName}-watermark.${ext}`;
  const outputPath = path.join(outputDir, fileName);

  const {
    opacity = 0.7,
    position = 'bottom-right',
    margin = 20,
    scale = 0.2
  } = options;

  // Resize watermark
  const watermarkBuffer = await sharp(watermarkPath)
    .resize(Math.round(1080 * scale))
    .png({ quality: 100 })
    .toBuffer();

  let converted = sharp(inputPath);
  
  // Position watermark
  let compositeOptions;
  switch (position) {
    case 'top-left':
      compositeOptions = { input: watermarkBuffer, top: margin, left: margin };
      break;
    case 'top-right':
      compositeOptions = { input: watermarkBuffer, top: margin, right: margin };
      break;
    case 'bottom-left':
      compositeOptions = { input: watermarkBuffer, bottom: margin, left: margin };
      break;
    case 'bottom-right':
    default:
      compositeOptions = { input: watermarkBuffer, bottom: margin, right: margin };
      break;
    case 'center':
      compositeOptions = { input: watermarkBuffer, top: '50%', left: '50%' };
      break;
  }

  converted = converted.composite([compositeOptions]);
  
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
