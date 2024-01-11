const express = require("express");
const app = express();
const ftp = require("basic-ftp");
const fs = require("fs").promises;
const fs1 = require("fs");
const path = require("path");
const zlib = require("zlib");
const csvtojson = require("csvtojson");
const jsonFile = require("./json/files.json");

const config = {
  host: "ftp.prescinto.com",
  user: "Radiance",
  password: "Welcome@123",
};

const remoteDirectory = "/DJB/Haidarpur/chemical_house/Backup";
const localDirectory =
  "C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2";
const inputDirectory = localDirectory + "/300000000";
const outputDirectory = localDirectory + "/unzip";
const sourceDirectory = outputDirectory;
const destinationDirectory = localDirectory + "/JSON";

const plantProfile = await PlantProfile.find({ plantId: plantIds });
if (plantProfile[0] != undefined) {
  plantProfile[0].dataLogger.forEach((logger) => {
    let remoteDirectory = logger.remotePath;
    let localDirectory = logger.localPath;
    downloadAndSchedule(remoteDirectory, localDirectory);
  });
}

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
        await downloadDirectory(
          remotePath,
          localPath,
          itemLimit - itemsDownloaded
        );
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

const unzipFiles = () => {
  if (!fs1.existsSync(outputDirectory)) {
    fs1.mkdirSync(outputDirectory);
  }

  const files = fs1.readdirSync(inputDirectory);

  files.forEach((file) => {
    const inputFile = path.join(inputDirectory, file);
    const outputFile = path.join(outputDirectory, path.basename(file, ".gz"));

    const readStream = fs1.createReadStream(inputFile);
    const gunzipStream = zlib.createGunzip();
    const writeStream = fs1.createWriteStream(outputFile);

    readStream.pipe(gunzipStream).pipe(writeStream);

    readStream.on("error", (err) => {
      console.error(`Error reading the input file "${file}":`, err);
    });

    gunzipStream.on("error", (err) => {
      console.error(`Error decompressing the input file "${file}":`, err);
    });

    writeStream.on("error", (err) => {
      console.error(`Error writing the output file "${outputFile}":`, err);
    });

    writeStream.on("close", () => {
      console.log(
        `File "${file}" has been successfully unzipped and saved to "${outputFile}".`
      );
    });
  });
};

const convertCsvToJson = () => {
  console.log("convertCsvToJson called !!");
  fs1.readdir(sourceDirectory, (err, files) => {
    if (err) {
      console.error("Error reading source directory:", err);
      return;
    }

    files.forEach((file) => {
      let resultArray = [];
      let dataArray = [];

      if (path.extname(file) === ".csv") {
        const csvFilePath = path.join(sourceDirectory, file);

        fs1.readFile(csvFilePath, "utf8", (err, data) => {
          if (err) {
            console.error(`Error reading CSV file ${file}:`, err);
            return;
          }
          const firstLine = data.split("\n");
          dataArray = [];
          firstLine.forEach((res) => {
            dataArray.push(res.split(";"));
          });
          let currentResultObj;

          for (let i = 3; i < dataArray.length; i++) {
            if (dataArray[i][0] === "deviceType") {
              let deviceType = dataArray[i][1];
              let name = dataArray[i][2];
              let ftpId = dataArray[i][3];

              currentResultObj = {
                deviceType: deviceType,
                name: name,
                ftpId: ftpId,
                data: [],
              };
              resultArray.push(currentResultObj);
              // console.log("resultArray", resultArray);

              let categoryIndex = jsonFile.findIndex(
                (item) => item.category === deviceType
              );

              if (categoryIndex !== -1) {
                let categoryDataKeys = Object.values(
                  jsonFile[categoryIndex].data
                );

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
                    if ((key !== "" && !isNaN(value)) || key === "timestamp") {
                      dataObj[key] = value;
                    }
                  }
                  if (Object.keys(dataObj).length > 0) {
                    currentResultObj.data.push(dataObj);
                  }
                }

                let k = 0;
                while (dataArray[i + 2 + k][0].includes("/")) {
                  dataArrayObjects(k);
                  k++;
                }

                if (dataArray[i + 4] && dataArray[i + 4][0] === "deviceType") {
                  i += 3;
                }
              }
            }
          }
          console.log("resultArray", resultArray[0]);

          const commonFunctionForAllDevices = async (
            result,
            type,
            plantProfile
          ) => {
            if (plantProfile[0] != undefined) {
              if (plantProfile[0][type].details[0] != undefined) {
                let ftpIndex = plantProfile[0][type].details.findIndex(
                  (item) => item.ftpId === result.ftpId
                );
                if (ftpIndex != -1) {
                  let deviceNoData =
                    plantProfile[0][type].details[ftpIndex].id;
                  let latestMeterDoc = await Meter.aggregate([
                    { $match: { plantId: plantIds, deviceNo: deviceNoData } },
                    { $sort: { timestamp: -1 } },
                    { $limit: 1 },
                  ]);
                  if (latestMeterDoc[0] != undefined) {
                    if (result.data[0] != undefined) {
                      result.data.forEach(async (data) => {
                        let dbObject = {};
                        if (Object.keys(data).length > 1) {
                          if (latestMeterDoc[0].timestamp < data?.timestamp) {
                            dbObject = {
                              timestampSync: data.timestamp,
                              loggerNo: 1, // loop on logger will be run in the begining
                              plantId: plantIds,
                              deviceType: 200,
                              deviceNo:
                                plantProfile[0][type].details[ftpIndex].id,
                              errorFlag: 0,
                              ...data,
                            };
                          }
                        } else {
                          if (latestMeterDoc[0].timestamp < data?.timestamp) {
                            dbObject = {
                              timestampSync: data.timestamp,
                              loggerNo: 1, // loop on logger will be run in the begining
                              plantId: plantIds,
                              deviceType: 200,
                              deviceNo:
                                plantProfile[0][type].details[ftpIndex].id,
                              errorFlag: 1,
                            };
                          }
                        }
                        let dbType = type.replace(/\b\w/g, (match) =>
                          match.toUpperCase()
                        );
                        if (type === "meter") {
                          dbObject.solutionFlag = "MFM";
                        }
                        if (Object.keys(dbObject).length != 0) {
                          await dbType.insertOne(dbObject);
                        }
                      });
                    }
                  }
                }
              }
            }
          };
          // Now Database saving start
          const dataBaseWork = async () => {
            resultArray.forEach(async (result) => {
              if (result.deviceType === "Meter") {
                commonFunctionForAllDevices(result, "meter", plantProfile);
              }
              if (result.deviceType === "Inverter") {
                commonFunctionForAllDevices(result, "inverter", plantProfile);
              }
              if (result.deviceType === "Weather") {
                commonFunctionForAllDevices(
                  result,
                  "weatherStation",
                  plantProfile
                );
              }
              if (result.deviceType === "SMB") {
                commonFunctionForAllDevices(result, "scbs", plantProfile);
              }
            });
          };

          fs1.unlink(csvFilePath, (err) => {
            if (err) {
              console.error(`Error deleting CSV file ${file}:`, err);
            } else {
              console.log(`CSV file ${file} deleted successfully`);
            }
          });
        });
      }
    });
  });
};

// Example usage
async function downloadAndSchedule(remoteDirectory, localDirectory) {
  await downloadDirectory(remoteDirectory, localDirectory, 10);
  unzipFiles();
  convertCsvToJson();
  setInterval(async () => {
    await downloadDirectory(remoteDirectory, localDirectory, 10);
    unzipFiles();
    convertCsvToJson();
  }, 5 * 60 * 1000);

  setTimeout(() => {}, 3000);
}
// await downloadDirectory(remoteDirectory, localDirectory, 10);
//   unzipFiles();
//   convertCsvToJson();
// downloadAndSchedule()

app.listen(7003, () => {
  console.log("Server running on port 7003");
});
