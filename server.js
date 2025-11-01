import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";


// Import routes
import compressRoutes from "./routes/compress.js";
import convertRoutes from "./routes/convert.js";
import resizeRoutes from "./routes/resize.js";
import watermarkRoutes from "./routes/watermark.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// Respect X-Forwarded-* headers when behind a proxy/ingress
app.set("trust proxy", true);

app.use(express.static("public"));
app.use("/optimized", express.static("optimized"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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

app.get("/", (req, res) => res.render("index"));
app.post("/result", (req, res) => res.render("result", { data: req.body }));


app.listen(8000, () => console.log("Image Optimization Node running on port 8000"));
