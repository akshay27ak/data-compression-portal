# Data Compression & Decompression Portal

A high-performance web application for file compression and decompression using multiple algorithms. Built with Next.js frontend and Node.js backend API.

## 🌐 Live Application

- **Frontend (Vercel)**: https://data-compression-portal-tawny.vercel.app
- **Backend API (Railway)**: https://data-compression-portal-production.up.railway.app

## 🚀 Features

- **4 Compression Algorithms**: Huffman, RLE, LZ77, JPEG
- **Web Interface**: Modern, responsive React-based UI
- **File Upload/Download**: Secure file handling with drag & drop
- **Real-time Processing**: Live compression/decompression with progress tracking
- **Algorithm Comparison**: Performance metrics and recommendations
- **JPEG Support**: Creates industry-standard .jpg files
- **Auto-suggestion**: Smart algorithm recommendations based on file type

## 🔧 Algorithms

### JPEG Compression
- **Type**: Lossy compression
- **Best for**: Photographic images, complex images with gradients
- **Output**: Creates .jpeg files (industry standard)
- **Compression**: 80-95% size reduction
- **Decompression**: Converts to PNG format for lossless storage

### Huffman Coding
- **Type**: Lossless compression
- **Best for**: Text files, source code, structured data
- **Method**: Variable-length encoding based on character frequency
- **Compression**: 40-60% typical reduction

### Run-Length Encoding (RLE)
- **Type**: Lossless compression
- **Best for**: Images with uniform areas, simple graphics
- **Method**: Replace consecutive identical values with count-value pairs
- **Compression**: 30-70% depending on data patterns

### LZ77
- **Type**: Lossless compression
- **Best for**: General-purpose files, text documents
- **Method**: Dictionary-based sliding window compression
- **Compression**: 50-70% typical reduction

## 📋 API Endpoints

Base URL: `https://data-compression-portal-production.up.railway.app`

- `POST /upload` - Upload files for processing
- `POST /compress` - Compress uploaded files  
- `POST /decompress` - Decompress files (restores original format)
- `GET /download/:fileId` - Download processed files
- `GET /health` - API health check
- `GET /file/:fileId` - Get file information

## 🧪 Testing the API

### Health Check
\`\`\`bash
curl https://data-compression-portal-production.up.railway.app/health
\`\`\`

**Expected Response:**
\`\`\`json
{
  "status": "OK",
  "timestamp": "2024-01-XX...",
  "uptime": 123.45,
  "algorithms": ["huffman", "rle", "lz77", "jpeg"]
}
\`\`\`

### Upload and Compress Example
\`\`\`bash
# Upload a file
curl -X POST -F "file=@example.jpg" \
  https://data-compression-portal-production.up.railway.app/upload

# Compress with JPEG (for images)
curl -X POST -H "Content-Type: application/json" \
  -d '{"fileId":"your-file-id","algorithm":"jpeg"}' \
  https://data-compression-portal-production.up.railway.app/compress

# Download compressed file
curl -O https://data-compression-portal-production.up.railway.app/download/compressed-file-id
\`\`\`

## 🎯 How to Use

1. **Visit the Web App**: https://data-compression-portal-tawny.vercel.app
2. **Upload Your File**: Drag & drop or click to browse (max 100MB)
3. **Choose Algorithm**: Auto-suggest or manual selection
4. **Process File**: Click Compress or Decompress
5. **Download Result**: Get your processed file

## 📊 Algorithm Performance

The application automatically suggests the best algorithm based on your file type:

- **Text Files** → Huffman Coding (optimal for character frequency analysis)
- **Images** → JPEG Compression (industry standard with high compression ratios)
- **Binary Files** → LZ77 (excellent general-purpose compression)

## 🔄 File Processing Flow

### Compression
1. **Upload** → File stored securely on server
2. **Analysis** → File type detection and algorithm suggestion
3. **Compression** → Selected algorithm processes the file
4. **Download** → Compressed file with appropriate extension (.jpeg, .bin)

### Decompression
1. **Upload** → Compressed file from this system
2. **Detection** → Algorithm and metadata extraction
3. **Decompression** → Restore original file format
4. **Download** → Original file with correct extension restored

## 📸 JPEG Specific Features

- **Lossy Compression**: Optimized for human visual perception
- **Industry Standard**: Creates .jpeg files compatible with all image viewers
- **Quality Control**: Balanced compression (80% quality) for optimal size/quality ratio
- **Decompression**: Converts back to PNG format for lossless storage
- **Image Detection**: Automatically detects image vs non-image data

## 🛡️ Security & Limits

- **File Size Limit**: 100MB maximum
- **Secure Upload**: Files processed server-side with automatic cleanup
- **CORS Protection**: Configured for secure cross-origin requests
- **Auto Cleanup**: Old files automatically removed after 24 hours
- **Error Handling**: Comprehensive error handling and user feedback

## 🏗️ Architecture

- **Frontend**: Next.js 15 with React, deployed on Vercel
- **Backend**: Node.js with Express, deployed on Railway
- **File Storage**: Temporary server-side storage with automatic cleanup
- **Algorithms**: Custom implementations of compression algorithms
- **Image Processing**: Sharp and Jimp libraries for JPEG handling

## 📈 Performance Metrics

The application tracks and displays:
- **Compression Ratios**: Percentage of size reduction achieved
- **Processing Speed**: Time taken for compression/decompression
- **File Size Comparison**: Before and after file sizes
- **Algorithm Efficiency**: Performance ratings and explanations

## 🔗 Technology Stack

**Frontend:**
- Next.js 15 (React framework)
- Tailwind CSS (styling)
- Vercel (deployment)

**Backend:**
- Node.js with Express
- Multer (file uploads)
- Sharp & Jimp (image processing)
- Railway (deployment)

## 📞 Support

For issues or questions:
- **Frontend Issues**: Check browser console for errors
- **API Issues**: Verify network connectivity to Railway backend
- **File Processing**: Ensure files are under 100MB limit
- **Algorithm Questions**: Refer to the Algorithms page in the web app

## 🎉 Try It Now!

Visit **https://data-compression-portal-tawny.vercel.app** and start compressing your files with advanced algorithms!

---

**Built with ❤️ using modern web technologies for optimal performance and user experience.**
