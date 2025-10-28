import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import mime from "mime";
import axios from "axios";
import { resizeImage, generateThumbnail } from "../utils/resizing.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// POST /resize - Resize image
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

    const width = parseInt(req.body.width);
    const height = req.body.height ? parseInt(req.body.height) : null;
    const fit = req.body.fit || 'cover';

    if (!width) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Width is required" });
    }

    const optimizedPath = await resizeImage(filePath, mimeType, req.file.originalname, width, height, fit);
    
    fs.unlinkSync(filePath);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ 
      url: `/optimized/${path.basename(optimizedPath)}`,
      fullUrl: `${baseUrl}/optimized/${path.basename(optimizedPath)}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image resizing failed" });
  }
});

// POST /resize/thumbnail - Generate thumbnail
router.post("/thumbnail", upload.single("image"), async (req, res) => {
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

    const size = parseInt(req.body.size) || 150;
    const optimizedPath = await generateThumbnail(filePath, mimeType, req.file.originalname, size);
    
    fs.unlinkSync(filePath);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ 
      url: `/optimized/${path.basename(optimizedPath)}`,
      fullUrl: `${baseUrl}/optimized/${path.basename(optimizedPath)}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Thumbnail generation failed" });
  }
});

// POST /resize/url - Resize image from URL
router.post("/url", async (req, res) => {
  try {
    const { imageUrl, width, height, fit = 'cover' } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: "No image URL provided" });
    }

    if (!width) {
      return res.status(400).json({ error: "Width is required" });
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
    
    const optimizedPath = await resizeImage(tempPath, mimeType, filename, parseInt(width), height ? parseInt(height) : null, fit);
    
    // Clean up the temporary downloaded file
    fs.unlinkSync(tempPath);
    
    // Get full URL including base
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Return the static URL
    res.json({ 
      url: `/optimized/${path.basename(optimizedPath)}`,
      fullUrl: `${baseUrl}/optimized/${path.basename(optimizedPath)}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image resizing from URL failed" });
  }
});

// POST /resize/thumbnail/url - Generate thumbnail from URL
router.post("/thumbnail/url", async (req, res) => {
  try {
    const { imageUrl, size = 150 } = req.body;
    
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
    
    const optimizedPath = await generateThumbnail(tempPath, mimeType, filename, parseInt(size));
    
    // Clean up the temporary downloaded file
    fs.unlinkSync(tempPath);
    
    // Get full URL including base
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Return the static URL
    res.json({ 
      url: `/optimized/${path.basename(optimizedPath)}`,
      fullUrl: `${baseUrl}/optimized/${path.basename(optimizedPath)}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Thumbnail generation from URL failed" });
  }
});

export default router;
