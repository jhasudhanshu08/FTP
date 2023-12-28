// const express = require('express');
// const app = express();
// const fs = require('fs');
// const path = require('path');

// const sourceDir = 'C:/Users/jhasu/OneDrive/Desktop/Radiance Data/300000000'; // Replace with the source directory path
// const targetDir = 'C:/Users/jhasu/OneDrive/Desktop/Radiance/Data'; // Replace with the target directory path
// const interval = 5 * 60 * 1000; // 5 minutes in milliseconds

// // Function to copy files from source to target directory sorted by timestamp
// function copyFiles() {
//   const files = fs.readdirSync(sourceDir);
  
//   // Sort files by timestamp
//   files.sort((a, b) => {
//     const statA = fs.statSync(path.join(sourceDir, a));
//     const statB = fs.statSync(path.join(sourceDir, b));
//     return statA.mtime.getTime() - statB.mtime.getTime();
//   });

//   // Create target directory if it doesn't exist
//   if (!fs.existsSync(targetDir)) {
//     fs.mkdirSync(targetDir);
//   }

//   // Copy files to target directory
//   files.forEach(file => {
//     const sourcePath = path.join(sourceDir, file);
//     const targetPath = path.join(targetDir, file);
//     fs.copyFileSync(sourcePath, targetPath);
//     console.log(`File ${file} copied to target directory`);
//   });
// }

// // Function to get new files added since the last check
// function getNewFiles() {
//   const lastCheckedTime = new Date().getTime() - interval;

//   return fs.readdirSync(targetDir)
//     .filter(file => {
//       const filePath = path.join(targetDir, file);
//       const stat = fs.statSync(filePath);
//       return stat.mtime.getTime() > lastCheckedTime;
//     });
// }

// // Initial copy
// copyFiles();

// // Set interval to run every 5 minutes
// setInterval(() => {
//   copyFiles();
// }, interval);

// app.listen(7000, () => {
//     console.log("server running on port 7000")
//   })

const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const ftp = require('basic-ftp');

async function downloadDirectory(client, remoteDir, localDir) {
  try {
    // Ensure the local directory exists
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    // Change to the remote directory
    await client.cd(remoteDir);

    // List the contents of the remote directory
    const listing = await client.list();

    // Download each file or directory recursively
    for (const item of listing) {
      const remotePath = path.posix.join(remoteDir, item.name);
      const localPath = path.join(localDir, item.name);

      // if (item.isDirectory()) {
        // Recursively download subdirectory
        await downloadDirectory(client, remotePath, localPath);
      // } else {
        // Download file
        // await client.downloadTo(localPath, remotePath);
      // }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function main() {
  const client = new ftp.Client();

  try {
    // Connect to the FTP server
    await client.access({
      host: 'ftp.prescinto.com',
      user: 'Radiance',
      password: 'Welcome@123',
      secure: false // Set to true for FTPS
    });

    // Specify the remote directory to download
    const remoteDirectory = '/DJB/Haidarpur/chemical_house/Backup';

    // Specify the local directory where the files will be downloaded
    const localDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2';

    // Call the function to download the directory
    await downloadDirectory(client, remoteDirectory, localDirectory);

    console.log('Directory download complete.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close the FTP connection
    await client.close();
  }
}

// Call the main function
main();

app.listen(7001, () => {
  console.log('server running on port 7001');
});






