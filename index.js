const express = require('express');
const app = express();
const ftp = require("basic-ftp");
const fs = require("fs").promises;
const fs1 = require("fs");
const path = require("path");
const zlib = require('zlib');
const csvtojson = require('csvtojson');
const jsonFile = require('./json/files.json');

const config = {
  host: 'ftp.prescinto.com',
  user: 'Radiance',
  password: 'Welcome@123',
};

const remoteDirectory = '/DJB/Haidarpur/chemical_house/Backup';
const localDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2';
const inputDirectory = localDirectory + '/300000000';
const outputDirectory = localDirectory + '/unzip';
const sourceDirectory = outputDirectory;
const destinationDirectory = localDirectory + '/JSON';

let resultArray = [];

const downloadDirectory = async (remoteDir, localDir, fileLimit = 10) => {
  const client = new ftp.Client();

  try {
    await client.access(config);
    await client.cd(remoteDir);

    const files = await client.list();

    // Limit the number of files to download
    const filesToDownload = files.slice(0, fileLimit);

    for (const file of filesToDownload) {
      const remotePath = path.join(remoteDir, file.name);
      const localPath = path.join(localDir, file.name);

      if (file.isDirectory) {
        await fs.mkdir(localPath, { recursive: true });
        await downloadDirectory(remotePath, localPath, fileLimit);
      } else {
        try {
          await fs.access(localPath);
          console.log(`File already exists: ${localPath}`);
        } catch (err) {
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

const unzipFiles = () => {
  if (!fs1.existsSync(outputDirectory)) {
    fs1.mkdirSync(outputDirectory);
  }

  const files = fs1.readdirSync(inputDirectory);

  files.forEach((file) => {
    const inputFile = path.join(inputDirectory, file);
    const outputFile = path.join(outputDirectory, path.basename(file, '.gz'));

    const readStream = fs1.createReadStream(inputFile);
    const gunzipStream = zlib.createGunzip();
    const writeStream = fs1.createWriteStream(outputFile);

    readStream.pipe(gunzipStream).pipe(writeStream);

    readStream.on('error', (err) => {
      console.error(`Error reading the input file "${file}":`, err);
    });

    gunzipStream.on('error', (err) => {
      console.error(`Error decompressing the input file "${file}":`, err);
    });

    writeStream.on('error', (err) => {
      console.error(`Error writing the output file "${outputFile}":`, err);
    });

    writeStream.on('close', () => {
      console.log(`File "${file}" has been successfully unzipped and saved to "${outputFile}".`);
    });
  });

};

const convertCsvToJson = () => {

  console.log("inside convertCsvToJson")
  let dataArray = [];
  let fileData;

  fs1.readdir(sourceDirectory, (err, files) => {
    console.log("sour", sourceDirectory)
    if (err) {
      console.error('Error reading source directory:', err);
      return;
    }

    files.forEach((file) => {
      dataArray = [];
      console.log("file", file)
      fileData = file;
      // if(file == "SLP00BA23G_010124_001534.csv") {

        if (path.extname(file) === '.csv') {
          const csvFilePath = path.join(sourceDirectory, file);
  
          fs1.readFile(csvFilePath, 'utf8', (err, data) => {
            if (err) {
              console.error(`Error reading CSV file ${file}:`, err);
              return;
            }
            console.log("data : -------------------------", data);
            const firstLine = data.split('\n');
            firstLine.forEach(res => {
              dataArray.push(res.split(';'));
            });
            console.log("dataArray", dataArray)
  
            resultArray = [];
            let currentResultObj;
  
            for (let i = 3; i < dataArray.length; i++) {
              if (dataArray[i][0] === 'deviceType') {
                let deviceType = dataArray[i][1];
                let name = dataArray[i][2];
                let ftpId = dataArray[i][3];
  
                currentResultObj = {
                  deviceType: deviceType,
                  name: name,
                  ftpId: ftpId,
                  data: []
                };
                resultArray.push(currentResultObj);
                // console.log("resultArray", resultArray);
  
                let categoryIndex = jsonFile.findIndex(item => item.category === deviceType);
  
                if (categoryIndex !== -1) {
                  let categoryDataKeys = Object.values(jsonFile[categoryIndex].data);
                  // console.log("categoryDataKeys", categoryDataKeys)
  
                  function dataArrayObjects(k) {
                    let dataObj = {};
                    for (let j = 0; j < categoryDataKeys.length; j++) {
                      let key;
                      let value;
                      if (j === 0) {
                        key = categoryDataKeys[j];
                        value = dataArray[i + 2 + k][j];
                      } else {
                        key = categoryDataKeys[j];
                        value = Number(dataArray[i + 2 + k][j]);
                      }
                      if (key !== "" && !isNaN(value) || key === "timestamp") {
                        dataObj[key] = value;
                      }
                    }
                    if (Object.keys(dataObj).length > 1) {
                      currentResultObj.data.push(dataObj);
                    }
                  }
  
                  let k = 0;
                  while (dataArray[i + 2 + k][0].includes("/")) {
                    dataArrayObjects(k);
                    k++;
                  }
  
                  if (dataArray[i + 4] && dataArray[i + 4][0] === 'deviceType') {
                    i += 3;
                  }
                }
              } 
              // else if (dataArray[i][0].includes('/')) {
              //   let dataObj = {};
              //   let dataObjKeys = currentResultObj.data[0];
  
              //   for (let j = 0; j < dataObjKeys?.length; j++) {
              //     let key = dataObjKeys[j];
              //     let value = dataArray[i + 2][j];
  
              //     if (key !== "" && !isNaN(value) || key === "timestamp") {
              //       dataObj[key] = value;
              //     }
              //   }
  
              //   if (Object.keys(dataObj).length > 1) {
              //     currentResultObj.data.push(dataObj);
              //   }
              // }
            }
            // if(file == "SLP00BA23G_010124_001534.csv") {
              // console.log(resultArray.length);
              console.log("resultArray", resultArray);
              resultArray = []
              // }
            });
          }
          // console.log("files", resultArray)
          // }
          // saveJsonFile(resultArray, fileData);

    });
  });
};

function saveJsonFile(resultArray, fileName) {
  const jsonData = JSON.stringify(resultArray, null, 2);
  const filePath = localDirectory + `/${fileName}.json`;

  fs.writeFile(filePath, jsonData)
  .then(() => {
    console.log(`Data has been written to ${filePath}`);
  })
  .catch((error) => {
    console.error(`Error writing to ${filePath}:`, error);
  });
}

// Example usage
// const downloadAndSchedule = async () => {
//   await downloadDirectory(remoteDirectory, localDirectory, 10);
//   setInterval(async () => {
//     await downloadDirectory(remoteDirectory, localDirectory, 10);
//   }, 5 * 60 * 1000);

//   unzipFiles();
//   setTimeout(() => {
//   }, 3000)
  
  
// };
convertCsvToJson();

// downloadAndSchedule().then(() => {
//   console.log("habbi come to dubai !!!")
// })

app.listen(7003, () => {
  console.log('Server running on port 7003');
});
