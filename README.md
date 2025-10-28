# Image Optimization API

A comprehensive image processing API built with Node.js and Sharp that provides powerful image optimization features including compression, format conversion, resizing, and watermarking capabilities.

## Project Description

This API offers a complete suite of image processing tools designed for modern web applications. It supports both file upload and URL-based processing, making it flexible for various use cases. The API is built with performance in mind, using Sharp for high-quality image processing and Express.js for a clean RESTful interface.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sharp** - High-performance image processing
- **Multer** - File upload handling
- **Axios** - HTTP client for URL processing
- **MIME** - File type detection

## API Endpoints

### Compression
- `POST /compress` - Compress image with quality control
- `POST /compress/url` - Compress image from URL

### Format Conversion
- `POST /convert/webp` - Convert image to WebP format
- `POST /convert/webp/url` - Convert image to WebP from URL
- `POST /convert/avif` - Convert image to AVIF format
- `POST /convert/avif/url` - Convert image to AVIF from URL

### Resizing
- `POST /resize` - Resize image with custom dimensions
- `POST /resize/url` - Resize image from URL
- `POST /resize/thumbnail` - Generate square thumbnail
- `POST /resize/thumbnail/url` - Generate thumbnail from URL

### Watermarking
- `POST /watermark/text` - Add text watermark
- `POST /watermark/text/url` - Add text watermark from URL
- `POST /watermark/image` - Add image watermark
- `POST /watermark/image/url` - Add image watermark from URL

### Legacy Endpoints
- `POST /optimize` - Basic image optimization
- `POST /optimize-url` - Optimize image from URL

### Documentation
- `GET /docs` - Interactive API documentation

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

## Documentation

Visit `http://localhost:8080/docs` for interactive API documentation with examples and detailed parameter descriptions.
