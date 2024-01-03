const fs = require('fs');
const path = require('path');
const csvtojson = require('csvtojson');

const sourceDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2/unzip';
const destinationDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2/JSON';

// Read all CSV files in the source directory
fs.readdir(sourceDirectory, (err, files) => {
  if (err) {
    console.error('Error reading source directory:', err);
    return;
  }

  // Process each CSV file
  files.forEach((file) => {
    if (path.extname(file) === '.csv') {
      const csvFilePath = path.join(sourceDirectory, file);

      // Read only the first line of the CSV file
      fs.readFile(csvFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`Error reading CSV file ${file}:`, err);
          return;
        }

        console.log("data", data)
        // Split the CSV data by lines and take the first line
        const firstLine = data.split('\n');
        firstLine.forEach(res => {
          console.log("response", res.split(';'))
        })
        // const fileData = firstLine.split(';');

        // Log the first line
        console.log(`First line of ${file}:`, firstLine);
      });
    }
  });
});
