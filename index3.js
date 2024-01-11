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

const downloadDirectory = async (remoteDir, localDir, itemLimit = 10) => {
  const client = new ftp.Client();
  let itemsDownloaded = 0;

  try {
    await client.access(config);
    await client.cd(remoteDir);

    const items = await client.list();

    for (const item of items) {
      if (itemsDownloaded >= itemLimit) {
        break; // Exit the loop if the item limit is reached
      }

      const remotePath = path.join(remoteDir, item.name);
      const localPath = path.join(localDir, item.name);

      if (item.isDirectory) {
        // Recursively download subdirectories
        await fs.mkdir(localPath, { recursive: true });
        await downloadDirectory(remotePath, localPath, itemLimit - itemsDownloaded);
      } else {
        try {
          await fs.access(localPath);
          console.log(`File already exists: ${localPath}`);
        } catch (err) {
          await client.downloadTo(localPath, remotePath);
          console.log(`Downloaded: ${remotePath}`);
          itemsDownloaded++;

          if (itemsDownloaded >= itemLimit) {
            break; // Exit the loop if the item limit is reached
          }
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
