import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Import routes
import compressRoutes from "./routes/compress.js";
import convertRoutes from "./routes/convert.js";
import resizeRoutes from "./routes/resize.js";
import watermarkRoutes from "./routes/watermark.js";

const app = express();

app.use(express.json());

app.use("/optimized", express.static("optimized"));

// Use routes
app.use("/compress", compressRoutes);
app.use("/convert", convertRoutes);
app.use("/resize", resizeRoutes);
app.use("/watermark", watermarkRoutes);

// Documentation endpoint
app.get("/docs", (req, res) => {
  const docsPath = path.join(process.cwd(), "docs.html");
  res.sendFile(docsPath);
});

app.listen(8080, () => console.log("Image Optimization Node running on port 8080"));
