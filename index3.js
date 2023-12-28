const express = require('express');
const app = express();
const ftp = require("basic-ftp");
const fs = require("fs");
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

    for (const file of files) {
      const remotePath = path.join(remoteDir, file.name);
      const localPath = path.join(localDir, file.name);

      if (file.isDirectory) {
        // Recursively download subdirectories
        await fs.promises.mkdir(localPath, { recursive: true });
        await downloadDirectory(remotePath, localPath);
      } else {
        // Download files
        await client.downloadTo(localPath, remotePath);
        console.log(`Downloaded: ${remotePath}`);
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  } finally {
    client.close();
  }
};

// Example usage
const remoteDirectory = '/DJB/Haidarpur/chemical_house/Backup';
const localDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2';

downloadDirectory(remoteDirectory, localDirectory);

app.listen(7003, () => {
    console.log('server running on port 7003');
  });
  
