const fs = require("fs");

function createBackup(filePath) {
  const backupPath = filePath + ".bak";
  fs.copyFileSync(filePath, backupPath);
  console.log("🗂 Backup created:", backupPath);
}

function rollback(filePath) {
  const backupPath = filePath + ".bak";

  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, filePath);
    console.log("🔄 Rolled back:", filePath);
  } else {
    console.log("⚠️ No backup found for rollback");
  }
}

module.exports = { createBackup, rollback };
