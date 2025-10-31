import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import mime from "mime";
import axios from "axios";
import { compressImage } from "../utils/compression.js";
import { addFileToIPFS } from "../utils/ipfs.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// POST /compress - Compress image with quality control
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype || mime.getType(req.file.originalname);
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    
    if (!mimeType || !validImageTypes.includes(mimeType)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Invalid file type. Only images (JPEG, PNG, WebP, GIF) are allowed." });
    }

    const quality = parseInt(req.body.quality) || 80;
    const optimizedPath = await compressImage(filePath, mimeType, req.file.originalname, quality);

    const originalSize = fs.statSync(filePath).size;
    const optimizedSize = fs.statSync(optimizedPath).size;
    const sizeReduction = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(2);
    
    fs.unlinkSync(filePath);

    const fileBuffer = fs.readFileSync(optimizedPath);
    const cid = await addFileToIPFS(fileBuffer)

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const optimizedUrl = `${baseUrl}/optimized/${path.basename(optimizedPath)}`;

    res.json({
      optimized_url: optimizedUrl,
      ipfs_cid: cid.toString(),
      size_reduction: `${sizeReduction}%`,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image compression failed" });
  }
});

// POST /compress/url - Compress image from URL
router.post("/url", async (req, res) => {
  try {
    const { imageUrl, quality = 100 } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: "No image URL provided" });
    }

    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    
    // Get mime type from response headers
    const mimeType = response.headers['content-type']?.split(';')[0]?.trim();
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    
    if (!mimeType || !validImageTypes.includes(mimeType)) {
      return res.status(400).json({ error: "Invalid file type. Only images (JPEG, PNG, WebP, GIF) are allowed." });
    }
    
    const ext = mime.getExtension(mimeType) || "jpg";
    const tempPath = `uploads/${Date.now()}.${ext}`;
    fs.writeFileSync(tempPath, response.data);
    
    // Extract filename from URL or generate random name
    let filename;
    try {
      const urlPath = new URL(imageUrl).pathname;
      const urlFilename = path.basename(urlPath);
      if (urlFilename && urlFilename.includes('.')) {
        filename = urlFilename;
      } else {
        filename = `image-${Date.now()}.${ext}`;
      }
    } catch (error) {
      filename = `image-${Date.now()}.${ext}`;
    }
    
    const originalSize = fs.statSync(tempPath).size;
    const optimizedPath = await compressImage(tempPath, mimeType, filename, parseInt(quality));
    const optimizedSize = fs.statSync(optimizedPath).size;
    const sizeReduction = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(2) + "%";

    
    // Clean up the temporary downloaded file
    fs.unlinkSync(tempPath);

    const cid = await addFileToIPFS(optimizedPath);

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const optimizedUrl = `${baseUrl}/optimized/${path.basename(optimizedPath)}`;
    
    // Return the static URL
    res.json({
      optimized_url: optimizedUrl,
      ipfs_cid: cid.toString(),
      size_reduction: sizeReduction,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image compression from URL failed" });
  }
});

export default router;
