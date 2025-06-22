const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const { readFile, writeFile, getFileSize, ensureDirExists } = require("./utils/fileManager");

const huffman = require("./algorithms/huffman");
const rle = require("./algorithms/rle");
const lz77 = require("./algorithms/lz77");

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

ensureDirExists("uploads");
ensureDirExists("processed");

const upload = multer({ dest: "uploads/" });

const processedFiles = {}; // In-memory store

app.post("/upload", upload.single("file"), (req, res) => {
  const id = uuidv4();
  const filePath = req.file.path;
  const originalSize = getFileSize(filePath);
  const fileName = req.file.originalname;

  processedFiles[id] = { id, filePath, fileName, originalSize };

  res.json({ fileId: id, originalSize, fileName });
});

app.post("/compress", async (req, res) => {
  try {
    const { fileId, algorithm } = req.body;
    const fileData = processedFiles[fileId];
    if (!fileData) throw new Error("File not found");

    const start = process.hrtime();

    const inputBuffer = readFile(fileData.filePath);

    const compressor = { huffman, rle, lz77 }[algorithm];
    if (!compressor) throw new Error("Invalid algorithm");

    const { buffer: compressedBuffer, explanation } = compressor.compress(inputBuffer);

    const newId = uuidv4();
    const outPath = `processed/${newId}_${fileData.fileName}`;
    writeFile(outPath, compressedBuffer);

    const elapsed = process.hrtime(start);
    const processingTime = (elapsed[0] + elapsed[1] / 1e9).toFixed(3);
    const compressedSize = compressedBuffer.length;
    const compressionRatio = Number(((1 - compressedSize / fileData.originalSize) * 100).toFixed(2));

    processedFiles[newId] = {
      id: newId,
      filePath: outPath,
      fileName: path.basename(outPath),
      originalSize: fileData.originalSize,
      compressedSize,
    };

    res.json({
      fileId: newId,
      originalSize: fileData.originalSize,
      compressedSize,
      compressionRatio,
      processingTime,
      explanation,
    });
  } catch (err) {
    res.status(500).json({ message: "Compression failed: " + err.message });
  }
});

app.post("/decompress", (req, res) => {
  try {
    const { fileId, algorithm } = req.body;
    const fileData = processedFiles[fileId];
    if (!fileData) throw new Error("File not found");

    const start = process.hrtime();

    const inputBuffer = readFile(fileData.filePath);
    const decompressor = { huffman, rle, lz77 }[algorithm];
    if (!decompressor) throw new Error("Invalid algorithm");

    const decompressedBuffer = decompressor.decompress(inputBuffer);

    const newId = uuidv4();
    const outPath = `processed/${newId}_DECOMP_${fileData.fileName}`;
    writeFile(outPath, decompressedBuffer);

    const elapsed = process.hrtime(start);
    const processingTime = (elapsed[0] + elapsed[1] / 1e9).toFixed(3);

    processedFiles[newId] = {
      id: newId,
      filePath: outPath,
      fileName: path.basename(outPath),
      decompressedSize: decompressedBuffer.length,
    };

    res.json({
      fileId: newId,
      originalSize: inputBuffer.length,
      decompressedSize: decompressedBuffer.length,
      processingTime,
      explanation: `Decompressed using ${algorithm}`,
    });
  } catch (err) {
    res.status(500).json({ message: "Decompression failed: " + err.message });
  }
});

app.get("/download/:fileId", (req, res) => {
  const fileData = processedFiles[req.params.fileId];
  if (!fileData) return res.status(404).json({ message: "File not found" });
  res.download(fileData.filePath, fileData.fileName);
});

app.listen(5000, () => {
  console.log("✅ Backend running at http://localhost:5000");
});
