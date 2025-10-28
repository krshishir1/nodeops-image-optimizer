# Image Optimization API

A comprehensive image processing API with multiple features including compression, format conversion, resizing, and watermarking.

## Features

- **Compression**: Reduce file size while preserving quality
- **Format Conversion**: Convert to WebP/AVIF formats
- **Resizing/Cropping**: Generate thumbnails and resize images
- **Watermarking**: Add text or image watermarks
- **Basic Optimization**: Original optimization functionality

## API Endpoints

### 1. Compression
**POST** `/compress`
- Compress image with quality control
- Body: `image` (file), `quality` (number, 1-100, default: 80)
- Response: `{ url: "/optimized/filename-compressed.jpg", fullUrl: "http://localhost:8080/optimized/filename-compressed.jpg" }`

### 2. Format Conversion
**POST** `/convert/webp`
- Convert image to WebP format
- Body: `image` (file), `quality` (number, 1-100, default: 80)
- Response: `{ url: "/optimized/filename-webp.webp", fullUrl: "http://localhost:8080/optimized/filename-webp.webp" }`

**POST** `/convert/avif`
- Convert image to AVIF format
- Body: `image` (file), `quality` (number, 1-100, default: 80)
- Response: `{ url: "/optimized/filename-avif.avif", fullUrl: "http://localhost:8080/optimized/filename-avif.avif" }`

### 3. Resizing
**POST** `/resize`
- Resize image with custom dimensions
- Body: `image` (file), `width` (number), `height` (number, optional), `fit` (string: cover|contain|fill|inside|outside, default: cover)
- Response: `{ url: "/optimized/filename-resized.jpg", fullUrl: "http://localhost:8080/optimized/filename-resized.jpg" }`

**POST** `/resize/thumbnail`
- Generate square thumbnail
- Body: `image` (file), `size` (number, default: 150)
- Response: `{ url: "/optimized/filename-thumbnail.jpg", fullUrl: "http://localhost:8080/optimized/filename-thumbnail.jpg" }`

### 4. Watermarking
**POST** `/watermark/text`
- Add text watermark
- Body: `image` (file), `text` (string), `fontSize` (number, default: 24), `color` (string, default: 'white'), `opacity` (number, 0-1, default: 0.7), `position` (string: top-left|top-right|bottom-left|bottom-right|center, default: 'bottom-right'), `margin` (number, default: 20)
- Response: `{ url: "/optimized/filename-watermark.jpg", fullUrl: "http://localhost:8080/optimized/filename-watermark.jpg" }`

**POST** `/watermark/image`
- Add image watermark
- Body: `image` (file), `watermark` (file), `opacity` (number, 0-1, default: 0.7), `position` (string, default: 'bottom-right'), `margin` (number, default: 20), `scale` (number, 0-1, default: 0.2)
- Response: `{ url: "/optimized/filename-watermark.jpg", fullUrl: "http://localhost:8080/optimized/filename-watermark.jpg" }`

### 5. Legacy Endpoints
**POST** `/optimize`
- Basic image optimization (legacy)
- Body: `image` (file)
- Response: `{ url: "/optimized/filename.jpg", fullUrl: "http://localhost:8080/optimized/filename.jpg" }`

**POST** `/optimize-url`
- Optimize image from URL (legacy)
- Body: `{ imageUrl: "https://example.com/image.jpg" }`
- Response: `{ url: "/optimized/filename.jpg", fullUrl: "http://localhost:8080/optimized/filename.jpg" }`

## File Naming Convention

All processed images follow the pattern: `filename-{action}.{extension}`
- `filename-compressed.jpg`
- `filename-webp.webp`
- `filename-resized.jpg`
- `filename-thumbnail.jpg`
- `filename-watermark.jpg`

## Supported Formats

- **Input**: JPEG, PNG, WebP, GIF
- **Output**: JPEG, PNG, WebP, AVIF (depending on endpoint)

## Installation

```bash
npm install
npm start
```

## Docker

```bash
docker-compose up
```

Server runs on port 8080.
