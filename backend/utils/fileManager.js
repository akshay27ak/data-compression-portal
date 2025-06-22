const fs = require('fs');
const path = require('path');

function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

function readFile(filePath) {
  return fs.readFileSync(filePath);
}

function writeFile(filePath, data) {
  fs.writeFileSync(filePath, data);
}

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

module.exports = {
  ensureDirExists,
  readFile,
  writeFile,
  getFileSize
};
