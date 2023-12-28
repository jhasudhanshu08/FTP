const express = require('express');
const app = express();
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

const config = {
  host: 'ftp.prescinto.com',
  user: 'Radiance',
  password: 'Welcome@123',
};

const downloadDirectory = async (remoteDir, localDir) => {
  const client = new ftp.Client({ maxConcurrent: 5 }); // Adjust the value as needed

  try {
    await client.access(config);
    await client.cd(remoteDir);

    const files = await client.list();

    for (const file of files) {
      const remotePath = path.join(remoteDir, file.name);
      const localPath = path.join(localDir, file.name);

      try {
        if (file.isDirectory) {
          // Recursively download subdirectories
          await fs.promises.mkdir(localPath, { recursive: true });
          await downloadDirectory(remotePath, localPath);
        } else {
          // Download files using streaming
          const writeStream = fs.createWriteStream(localPath);
          await client.downloadTo(writeStream, remotePath);
          console.log(`Downloaded: ${remotePath}`);
        }
      } catch (downloadError) {
        console.error(`Error downloading ${remotePath}: ${downloadError.message}`);
      }
    }
  } catch (accessError) {
    console.error(`Error accessing FTP server: ${accessError.message}`);
  } finally {
    try {
      // Close the client with an optional delay
      await client.close(500);
    } catch (closeError) {
      console.error(`Error closing FTP client: ${closeError.message}`);
    }
  }
};

// Example usage
const remoteDirectory = '/DJB/Haidarpur/chemical_house/Backup';
const localDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2';

downloadDirectory(remoteDirectory, localDirectory);

app.listen(7003, () => {
  console.log('Server running on port 7003');
});
