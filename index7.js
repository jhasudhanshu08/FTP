const express = require('express');
const app = express();
const ftp = require("basic-ftp");
const fs = require("fs");
const path = require("path");
const zlib = require('zlib');
const csv = require('csv-parser');

const config = {
  host: 'ftp.prescinto.com',
  user: 'Radiance',
  password: 'Welcome@123',
};

const downloadAndProcessDirectory = async (remoteDir, localDownloadDir, localUnzipDir) => {
  const client = new ftp.Client();

  try {
    await client.access(config);
    await client.cd(remoteDir);

    const files = await client.list();

    for (const file of files) {
      const remotePath = path.join(remoteDir, file.name);
      const localDownloadPath = path.join(localDownloadDir, file.name);

      if (file.isDirectory) {
        await fs.mkdir(localDownloadPath, { recursive: true });
        await downloadAndProcessDirectory(remotePath, localDownloadPath, localUnzipDir);
      } else {
        try {
          await fs.access(localDownloadPath);
          console.log(`File already exists: ${localDownloadPath}`);
        } catch (err) {
          await client.downloadTo(localDownloadPath, remotePath);
          console.log(`Downloaded: ${remotePath}`);

          // Unzip the downloaded file to another directory
          await unzipFile(localDownloadPath, localUnzipDir);
        }
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  } finally {
    console.log("Client closed");
    client.close();
  }
};

const unzipFile = async (filePath, outputDir) => {
  const readStream = fs.createReadStream(filePath);
  const gunzip = zlib.createGunzip();
  const writeStream = fs.createWriteStream(path.join(outputDir, path.basename(filePath, '.gz')));

  readStream.pipe(gunzip).pipe(writeStream);

  writeStream.on('finish', () => {
    console.log(`Unzipped: ${filePath} to ${outputDir}`);
    // Now you can read and process the unzipped file if needed
    readAndProcessFile(path.join(outputDir, path.basename(filePath, '.gz')));
  });

  writeStream.on('error', (error) => {
    console.error(`Error writing unzipped file: ${error.message}`);
  });
};

const readAndProcessFile = async (filePath) => {
  const readStream = fs.createReadStream(filePath);
  const csvParser = csv();

  readStream.pipe(csvParser);

  csvParser.on('data', (data) => {
    // Process each row of CSV data
    console.log(data);
  });

  csvParser.on('end', () => {
    console.log(`Finished reading file: ${filePath}`);
  });

  csvParser.on('error', (error) => {
    console.error(`Error reading CSV: ${error.message}`);
  });
};

// Example usage
const remoteDirectory = '/DJB/Haidarpur/chemical_house/Backup';
const localDownloadDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2';
const localUnzipDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/UnzippedData';

const downloadAndSchedule = async () => {
  await downloadAndProcessDirectory(remoteDirectory, localDownloadDirectory, localUnzipDirectory);
  setInterval(async () => {
    await downloadAndProcessDirectory(remoteDirectory, localDownloadDirectory, localUnzipDirectory);
  }, 5 * 60 * 1000);
};

downloadAndSchedule();

app.listen(7003, () => {
  console.log('Server running on port 7003');
});

// const sourceDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2/unzip';
// const destinationDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2/JSON';
