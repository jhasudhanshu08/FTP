const express = require('express');
const app = express();
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const inputDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2/300000000'; // Replace with your input directory
const outputDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2/unzip'; // Replace with your output directory

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

// Get a list of files in the input directory
const files = fs.readdirSync(inputDirectory);

// Process each file in the input directory
files.forEach((file) => {
  const inputFile = path.join(inputDirectory, file);
  const outputFile = path.join(outputDirectory, path.basename(file, '.gz'));

  // Create a readable stream from the gzipped file
  const readStream = fs.createReadStream(inputFile);
  const gunzipStream = zlib.createGunzip();

  // Create a writable stream for the output file
  const writeStream = fs.createWriteStream(outputFile);

  // Pipe the read stream through the gunzip stream and then into the write stream
  readStream.pipe(gunzipStream).pipe(writeStream);

  // Listen for errors during the process
  readStream.on('error', (err) => {
    console.error(`Error reading the input file "${file}":`, err);
  });

  gunzipStream.on('error', (err) => {
    console.error(`Error decompressing the input file "${file}":`, err);
  });

  writeStream.on('error', (err) => {
    console.error(`Error writing the output file "${outputFile}":`, err);
  });

  // Listen for the 'close' event to know when the process is complete
  writeStream.on('close', () => {
    console.log(`File "${file}" has been successfully unzipped and saved to "${outputFile}".`);
  });
});


app.listen(7003, () => {
    console.log('Server running on port unzip 7000');
  });
  
