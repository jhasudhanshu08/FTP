const express = require('express');
const app = express();
const ftp = require("basic-ftp");
const fs = require("fs").promises; // Use fs.promises for consistent promises-based API
const path = require("path");

const config = {
  host: 'ftp.prescinto.com',
  user: 'Radiance',
  password: 'Welcome@123',
};

const downloadDirectory = async (remoteDir, localDir) => {
  const client = new ftp.Client();

  try {
    await client.access(config);
    await client.cd(remoteDir);

    const files = await client.list();
    console.log("files", files)

    for (const file of files) {
      console.log("file.isDirectory", file.isDirectory);
      const remotePath = path.join(remoteDir, file.name);
      const localPath = path.join(localDir, file.name);

      if (file.isDirectory) {
        // Recursively download subdirectories
        await fs.mkdir(localPath, { recursive: true });
        await downloadDirectory(remotePath, localPath);
      } else {
        // Check if the file already exists in the local directory
        try {
          await fs.access(localPath);
          console.log(`File already exists: ${localPath}`);
        } catch (err) {
          // File doesn't exist, download it
          await client.downloadTo(localPath, remotePath);
          console.log(`Downloaded: ${remotePath}`);
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

// Example usage
const remoteDirectory = '/DJB/Haidarpur/chemical_house/Backup';
const localDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2';

// Function to download data initially and set up a timer to download every 5 minutes
const downloadAndSchedule = async () => {
  await downloadDirectory(remoteDirectory, localDirectory);
  // Set up a timer to download every 5 minutes
  setInterval(async () => {
    await downloadDirectory(remoteDirectory, localDirectory);
  }, 5 * 60 * 1000); // 5 minutes in milliseconds
};

downloadAndSchedule();

app.listen(7003, () => {
  console.log('Server running on port 7003');
});
