import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import mime from "mime";
import axios from "axios";
import { addTextWatermark, addImageWatermark } from "../utils/watermarking.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// POST /watermark/text - Add text watermark
router.post("/text", upload.single("image"), async (req, res) => {
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

    const text = req.body.text;
    if (!text) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Text is required" });
    }

    const options = {
      fontSize: parseInt(req.body.fontSize) || 24,
      color: req.body.color || 'white',
      opacity: parseFloat(req.body.opacity) || 0.7,
      position: req.body.position || 'bottom-right',
      margin: parseInt(req.body.margin) || 20
    };

    const optimizedPath = await addTextWatermark(filePath, mimeType, req.file.originalname, text, options);
    
    fs.unlinkSync(filePath);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ 
      url: `/optimized/${path.basename(optimizedPath)}`,
      fullUrl: `${baseUrl}/optimized/${path.basename(optimizedPath)}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Text watermarking failed" });
  }
});

// POST /watermark/image - Add image watermark
router.post("/image", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'watermark', maxCount: 1 }]), async (req, res) => {
  try {
    if (!req.files.image || !req.files.watermark) {
      return res.status(400).json({ error: "Both image and watermark files are required" });
    }

    const filePath = req.files.image[0].path;
    const watermarkPath = req.files.watermark[0].path;
    const mimeType = req.files.image[0].mimetype || mime.getType(req.files.image[0].originalname);
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    
    if (!mimeType || !validImageTypes.includes(mimeType)) {
      fs.unlinkSync(filePath);
      fs.unlinkSync(watermarkPath);
      return res.status(400).json({ error: "Invalid file type. Only images (JPEG, PNG, WebP, GIF) are allowed." });
    }

    const options = {
      opacity: parseFloat(req.body.opacity) || 0.7,
      position: req.body.position || 'bottom-right',
      margin: parseInt(req.body.margin) || 20,
      scale: parseFloat(req.body.scale) || 0.2
    };

    const optimizedPath = await addImageWatermark(filePath, mimeType, req.files.image[0].originalname, watermarkPath, options);
    
    fs.unlinkSync(filePath);
    fs.unlinkSync(watermarkPath);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ 
      url: `/optimized/${path.basename(optimizedPath)}`,
      fullUrl: `${baseUrl}/optimized/${path.basename(optimizedPath)}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image watermarking failed" });
  }
});

// POST /watermark/text/url - Add text watermark from URL
router.post("/text/url", async (req, res) => {
  try {
    const { imageUrl, text, fontSize = 24, color = 'white', opacity = 0.7, position = 'bottom-right', margin = 20 } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: "No image URL provided" });
    }

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
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
    
    const options = {
      fontSize: parseInt(fontSize),
      color,
      opacity: parseFloat(opacity),
      position,
      margin: parseInt(margin)
    };
    
    const optimizedPath = await addTextWatermark(tempPath, mimeType, filename, text, options);
    
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
    res.status(500).json({ error: "Text watermarking from URL failed" });
  }
});

// POST /watermark/image/url - Add image watermark from URL
router.post("/image/url", async (req, res) => {
  try {
    const { imageUrl, watermarkUrl, opacity = 0.7, position = 'bottom-right', margin = 20, scale = 0.2 } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: "No image URL provided" });
    }

    if (!watermarkUrl) {
      return res.status(400).json({ error: "No watermark URL provided" });
    }

    // Download both images
    const [imageResponse, watermarkResponse] = await Promise.all([
      axios.get(imageUrl, { responseType: "arraybuffer" }),
      axios.get(watermarkUrl, { responseType: "arraybuffer" })
    ]);
    
    // Get mime type from response headers
    const mimeType = imageResponse.headers['content-type']?.split(';')[0]?.trim();
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    
    if (!mimeType || !validImageTypes.includes(mimeType)) {
      return res.status(400).json({ error: "Invalid file type. Only images (JPEG, PNG, WebP, GIF) are allowed." });
    }
    
    const ext = mime.getExtension(mimeType) || "jpg";
    const tempPath = `uploads/${Date.now()}.${ext}`;
    const watermarkPath = `uploads/watermark-${Date.now()}.png`;
    
    fs.writeFileSync(tempPath, imageResponse.data);
    fs.writeFileSync(watermarkPath, watermarkResponse.data);
    
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
    
    const options = {
      opacity: parseFloat(opacity),
      position,
      margin: parseInt(margin),
      scale: parseFloat(scale)
    };
    
    const optimizedPath = await addImageWatermark(tempPath, mimeType, filename, watermarkPath, options);
    
    // Clean up the temporary downloaded files
    fs.unlinkSync(tempPath);
    fs.unlinkSync(watermarkPath);
    
    // Get full URL including base
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Return the static URL
    res.json({ 
      url: `/optimized/${path.basename(optimizedPath)}`,
      fullUrl: `${baseUrl}/optimized/${path.basename(optimizedPath)}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image watermarking from URL failed" });
  }
});

export default router;
