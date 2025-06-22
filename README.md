# File Compression & Decompression Backend API

A high-performance Node.js backend API for file compression and decompression using multiple algorithms.

## 🚀 Quick Start

1. **Install Dependencies**:
\`\`\`bash
npm install
\`\`\`

2. **Start Development Server**:
\`\`\`bash
npm run dev
\`\`\`

3. **Test API**:
\`\`\`bash
curl http://localhost:5000/health
\`\`\`

## 📋 API Endpoints

- `POST /upload` - Upload files
- `POST /compress` - Compress files  
- `POST /decompress` - Decompress files (not available for JPEG)
- `GET /download/:fileId` - Download processed files
- `GET /health` - Health check

## 🔧 Algorithms

- **Huffman Coding** - Optimal for text files (lossless)
- **Run-Length Encoding** - Great for images with uniform areas (lossless)
- **LZ77** - General-purpose compression (lossless)
- **JPEG Compression** - Optimized for photographic images (lossy)

## 🛠️ Configuration

Edit `.env` file:
\`\`\`
PORT=5000
NODE_ENV=development
MAX_FILE_SIZE=104857600
\`\`\`

## 📁 File Structure

\`\`\`
backend/
├── server.js           # Main server
├── routes/            # API endpoints
├── algorithms/        # Compression algorithms
├── utils/            # Utilities
└── uploads/          # File storage
\`\`\`

## 🎯 Algorithm Details

### JPEG Compression
- **Type**: Lossy compression
- **Best for**: Photographic images, complex images with gradients
- **Output**: Creates .jpg files
- **Compression**: 80-95% size reduction
- **Note**: Decompression not available (converts to raw data)

### Huffman Coding
- **Type**: Lossless compression
- **Best for**: Text files, source code
- **Method**: Variable-length encoding based on frequency
- **Compression**: 40-60% typical

### Run-Length Encoding
- **Type**: Lossless compression
- **Best for**: Images with uniform areas
- **Method**: Replace consecutive identical values
- **Compression**: 30-70% depending on data

### LZ77
- **Type**: Lossless compression
- **Best for**: General-purpose files
- **Method**: Dictionary-based sliding window
- **Compression**: 50-70% typical

## 🚀 Features

- **4 Compression Algorithms**: Huffman, RLE, LZ77, JPEG
- **RESTful API**: Clean and intuitive endpoints
- **File Upload/Download**: Secure file handling
- **Performance Metrics**: Processing time and compression ratio tracking
- **Auto Cleanup**: Automatic cleanup of old files
- **CORS Support**: Cross-origin requests enabled
- **Error Handling**: Comprehensive error handling and logging
- **JPEG Support**: Creates industry-standard .jpg files

## 📸 JPEG Features

- **Lossy Compression**: Optimized for human visual perception
- **High Compression**: 80-95% size reduction for images
- **Industry Standard**: Creates .jpg files
- **Quality Control**: Adjustable compression levels
- **Image Detection**: Automatically detects image vs non-image data

## 🧪 Testing

Test the API endpoints:

\`\`\`bash
# Health check
curl http://localhost:5000/health

# Upload file
curl -X POST -F "file=@example.jpg" http://localhost:5000/upload

# Compress with JPEG
curl -X POST -H "Content-Type: application/json" \
  -d '{"fileId":"your-file-id","algorithm":"jpeg"}' \
  http://localhost:5000/compress
\`\`\`

Server runs on `http://localhost:5000` 🎉

## 📝 License

MIT License - see LICENSE file for details.
