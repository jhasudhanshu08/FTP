const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

const sourceDir = 'C:/Users/jhasu/OneDrive/Desktop/Radiance Data/300000000'; // Replace with the source directory path
const targetDir = 'C:/Users/jhasu/OneDrive/Desktop/Radiance/Data'; // Replace with the target directory path
const interval = 5 * 60 * 1000; // 5 minutes in milliseconds

// Function to copy files from source to target directory sorted by timestamp
function copyFiles() {
  const files = fs.readdirSync(sourceDir);
  
  // Sort files by timestamp
  files.sort((a, b) => {
    const statA = fs.statSync(path.join(sourceDir, a));
    const statB = fs.statSync(path.join(sourceDir, b));
    return statA.mtime.getTime() - statB.mtime.getTime();
  });

  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }

  // Copy files to target directory
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`File ${file} copied to target directory`);
  });
}

// Function to get new files added since the last check
function getNewFiles() {
  const lastCheckedTime = new Date().getTime() - interval;

  return fs.readdirSync(targetDir)
    .filter(file => {
      const filePath = path.join(targetDir, file);
      const stat = fs.statSync(filePath);
      return stat.mtime.getTime() > lastCheckedTime;
    });
}

// Initial copy
copyFiles();

// Set interval to run every 5 minutes
setInterval(() => {
  copyFiles();
}, interval);

app.listen(7000, () => {
    console.log("server running on port 7000")
  })