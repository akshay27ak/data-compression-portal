# Data Compression & Decompression Portal

A comprehensive web application for file compression and decompression using various algorithms including Huffman Coding, LZ77, Run-Length Encoding (RLE), and JPEG compression.

## Live Application

- **Frontend (Vercel)**: https://data-compression-portal-tawny.vercel.app
- **Backend API (Railway)**: https://data-compression-portal-production.up.railway.app

## Demo Video

[View the deployed application here](https://drive.google.com/drive/u/0/folders/10KxajoXuBNVrQwWgkD7KwPZV9Ize2TcP)


## Features

### Compression Algorithms
- **Huffman Coding**: Optimal for text files with frequency-based compression
- **LZ77**: Sliding window compression ideal for binary files and general data
- **Run-Length Encoding (RLE)**: Perfect for files with repetitive data patterns
- **JPEG Compression**: Specialized lossy compression for image files

### Supported File Types
- **Text Files**: `.txt` - Compressed using Huffman Coding
- **Binary Files**: `.bin` - Compressed using LZ77 algorithm
- **Image Files**: `.jpg`, `.jpeg`, `.png` - Compressed using JPEG algorithm
- **Unsupported Files**: All other file types will show an error message

### Core Functionality
- **File Upload**: Drag-and-drop or click to upload files
- **Automatic Detection**: Smart detection of compressed files for decompression
- **Real-time Processing**: Live compression/decompression with progress indicators
- **File Download**: Download processed files with correct extensions restored

### Analytics & Insights
- **Algorithm Comparison**: Compare efficiency across different algorithms
- **Performance Metrics**: Processing time and compression ratio analysis
- **Educational Content**: Learn about compression algorithms and their use cases

### Error Handling
- **File Size Validation**: Maximum 100MB file size limit
- **File Type Validation**: Proper feedback for unsupported file extensions
- **Compression Errors**: Clear error messages for failed operations
- **Network Error Handling**: Graceful handling of API failures

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Interactive UI**: Smooth animations and real-time feedback
- **Progress Tracking**: Visual indicators for upload and processing status

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: Modern React with hooks and concurrent features
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **Lucide React**: Beautiful icon library

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Multer**: File upload middleware
- **Custom Algorithms**: Hand-implemented compression algorithms

## Getting Started to run locally

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd data-compression-portal
   \`\`\`

2. **Install Backend Dependencies**
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

3. **Install Frontend Dependencies**
   \`\`\`bash
   cd ../frontend
   npm install
   \`\`\`

4. **Start the Backend Server**
   \`\`\`bash
   cd ../backend
   npm start
   \`\`\`
   Backend will run on `http://localhost:5000`

5. **Start the Frontend Development Server**
   \`\`\`bash
   cd ../frontend
   npm run dev
   \`\`\`
   Frontend will run on `http://localhost:3000`

### Environment Variables

Create a `.env.local` file in the frontend directory:
\`\`\`env
NEXT_PUBLIC_API_URL=`http://localhost:5000`
\`\`\`

## Usage Guide

### Compressing Files

1. **Upload a File**: 
   - Drag and drop a file or click to browse
   - Supported formats: `.txt`, `.bin`, `.jpg`, `.jpeg`, `.png`
   - Maximum file size: 100MB

2. **Select Algorithm** (Auto-selected based on file type):
   - Text files → Huffman Coding
   - Binary files → LZ77
   - Image files → JPEG

3. **Process**: Click "Compress File" and wait for processing

4. **Download**: Download the compressed file with `.bin` extension

### Decompressing Files

1. **Upload Compressed File**: Upload a previously compressed `.bin` file

2. **Auto-Detection**: System automatically detects the compression algorithm

3. **Process**: Click "Decompress File"

4. **Download**: Download the restored file with original extension

### File Type Support

| File Extension | Algorithm | Status |
|---------------|-----------|---------|
| `.txt` | Huffman Coding | ✅ Supported |
| `.bin` | LZ77 | ✅ Supported |
| `.jpg`, `.jpeg`, `.png` | JPEG | ✅ Supported |
| Other extensions | - | ❌ Not Supported |



