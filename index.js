// const express = require('express');
// const app = express();
// const zlib = require('zlib');
// const fs = require('fs');
// const Client = require('ftp');
// const path = require('path');

// const sourceDir = '/DJB/Haidarpur/chemical_house/Backup/300000000/'; // Replace with the source directory path on the FTP server
// const targetDir = 'C:/Users/jhasu/OneDrive/Desktop/Radiance/Data2'; // Replace with the target directory path
// const interval = 5 * 60 * 1000; // 5 minutes in milliseconds

// // Function to copy the entire directory from source to target directory
// function copyDirectory(client, source, destination) {
//   if (!fs.existsSync(destination)) {
//     fs.mkdirSync(destination);
//   }

//   client.list(source, async (err, list) => {
//     if (err) throw err;

//     // console.log("file..............", list)

//     list.forEach(file => {
//     const sourcePath = path.join(source, file.name);
//     const destinationPath = path.join(destination, file.name);

//       if (file.type !== 'd') {
//         client.get(sourcePath, (err, stream) => {
//           if (err) {
//             console.error(`Error getting file ${file.name}:`, err);
//             throw err;
//           }

//           const writeStream = fs.createWriteStream(destinationPath);

//           // Pipe the FTP stream directly to the local file
//           stream.pipe(writeStream);

//           writeStream.once('close', () => {
//             console.log(`File ${file.name} copied to target directory`);
//           });
//         });
//       }
//     });
//   });
// }

// // Function to connect to FTP server and download the directory
// function connectAndCopy() {
//   const c = new Client();

//   // Enable passive mode
//   c.on('ready', () => {
//     c.togglePasv = true;
//     copyDirectory(c, sourceDir, targetDir);
//     c.end();
//     console.log("ready....")
//   });

//   // Handle errors
//   c.on('error', (err) => {
//     console.error('FTP Error:', err);
//     c.end();
//   });

//   // Connect to FTP server
//   c.connect({
//     host: 'ftp.prescinto.com', // Replace with FTP server host
//     user: 'Radiance',         // Replace with FTP username
//     password: 'Welcome@123',
//     // debug: console.log    // Replace with FTP password
//   });
//   // console.log("c++++++++++++++", c)

// }

// // Initial copy
// connectAndCopy();

// // Set interval to run every 5 minutes
// setInterval(connectAndCopy, interval);

// app.listen(7001, () => {
//   console.log("server running on port 7001");
// });


const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const ftp = require('basic-ftp');

const sourceDir = '/DJB/Haidarpur/chemical_house/Backup/300000000/'; // Replace with the source directory path on the FTP server
const targetDir = 'C:/Users/jhasu/OneDrive/Desktop/Radiance/Data2'; // Replace with the target directory path
const numberOfFilesToCopy = 3100;
let filesCopied = 0;

// Function to download files from FTP server
async function downloadFiles() {
  const client = new ftp.Client();

  try {
    await client.access({
      host: 'ftp.prescinto.com', // Replace with FTP server host
      user: 'Radiance',         // Replace with FTP username
      password: 'Welcome@123'    // Replace with FTP password
    });

    await client.cd(sourceDir);

    const list = await client.list();

    for (const file of list) {
      if (filesCopied < numberOfFilesToCopy) {
        const sourcePath = path.join(sourceDir, file.name);
        const destinationPath = path.join(targetDir, file.name);

        if (file.type !== 'd') {
          await client.downloadTo(destinationPath, sourcePath);
          console.log(`File ${file.name} copied to target directory`);
          filesCopied++;
        }
      }
    }
  } catch (err) {
    console.error('Download error:', err);
  } finally {
    client.close();
  }
}

// Initial download
downloadFiles();

// Set interval to run every 5 minutes
const interval = 5 * 60 * 1000; // 5 minutes in milliseconds
setInterval(downloadFiles, interval);

app.listen(7001, () => {
  console.log('server running on port 7001');
});
