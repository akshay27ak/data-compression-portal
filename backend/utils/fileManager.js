const fs = require("fs");
const path = require("path");

module.exports = {
  readFile(filePath) {
    return fs.readFileSync(filePath);
  },
  writeFile(filePath, data) {
    fs.writeFileSync(filePath, data);
  },
  getFileSize(filePath) {
    return fs.statSync(filePath).size;
  },
  ensureDirExists(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  }
};
