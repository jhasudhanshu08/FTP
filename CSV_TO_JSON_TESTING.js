const fs = require('fs');
const path = require('path');
const csvtojson = require('csvtojson');
const jsonFile = require('./json/files.json');

const sourceDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2/unzip';
const destinationDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2/JSON';

let dataArray = [];
let object = {};
let arrayOfObj = [];
let innerDataObject = {};
let resultArray = [];
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

        // console.log("data", data)
        // Split the CSV data by lines and take the first line
        const firstLine = data.split('\n');
        firstLine.forEach(res => {
          // console.log("response", res.split(';')[0])
          dataArray.push(res.split(';'));
        })
        console.log("dataArray", dataArray)
        // console.log("jsonFile", jsonFile)
        let resultArray = [];

        let currentResultObj; // Keep track of the current result object

        for (let i = 3; i < dataArray.length; i++) {
          if (dataArray[i][0] === 'deviceType') {
            let deviceType = dataArray[i][1];
            let name = dataArray[i][2];
            let ftpId = dataArray[i][3];

            currentResultObj = {
              deviceType: deviceType,
              name: name,
              ftpId: ftpId,
              data: [] // Initialize data as an array
            };

            resultArray.push(currentResultObj);

            // Find the corresponding category in jsonFile
            let categoryIndex = jsonFile.findIndex(item => item.category === deviceType);

            if (categoryIndex !== -1) {
              let categoryDataKeys = Object.values(jsonFile[categoryIndex].data);

              let dataObj = {}; // Initialize dataObj as a new object

              for (let j = 0; j < categoryDataKeys.length; j++) {
                let key = categoryDataKeys[j];
                let value = dataArray[i + 2][j];

                // Skip the case where key is an empty string
                if (key !== "") {
                  dataObj[key] = value;
                }
              }

              currentResultObj.data.push(dataObj);
            }

            // Skip the next array if it starts with "deviceType"
            if (dataArray[i + 4] && dataArray[i + 4][0] === 'deviceType') {
              i += 3; // Skip the next array
            }
          } else if (dataArray[i][0].includes('/') && dataArray[i + 2]) {
            console.log("dataArray[i][0]", dataArray[i][0])
            // If the 0 index includes "/" and the array at i + 2 exists
            let dataObj = {};
            let dataObjKeys = currentResultObj.data[0];

            for (let j = 0; j < dataObjKeys.length; j++) {
              let key = dataObjKeys[j];
              let value = dataArray[i + 2][j];

              // Skip the case where key is an empty string
              if (key !== "") {
                dataObj[key] = value;
              }
            }

            currentResultObj.data.push(dataObj);
          }
        }

        console.log(resultArray[0]);

      });
    }
  });
});

// "data": {
//   "timestamp": "01/01/24-00:00:33",
//   "currentPhaseR": "0",
//   "currentPhaseY": "0",
//   "currentPhaseB": "0",
//   "frequency": "50.092", 
//   "VoltageAvg": "448.874", 
//   "VoltageAvg": "259.166", 
//   "activeCurrent": "0", 
//   "powerFactor": "0.582", 
//   "activePower": "0", 
//    "apparantPower": "0", 
//    "reactivePower": "0", 
//    "netActiveEnergy": "261673.805", 
//    "activeEnergyImport": "123280.805", 
//    "activeEnergyExport": "138393", 
//    "netApparentEnergy": "263629.211", 
//    "apparentEnergyImport": "124287.805", 
//    "apparentEnergyExport": "139341.406", 
//    "": "446.982", 
//    "": "450.542", 
//    "": "449.099", 
//    "voltagePhaseR": "259.763", 
//    "voltagePhaseY": "259.248", 
//    "voltagePhaseB": "258.486", 
//    "currentPhaseR": "0", 
//    "currentPhaseY": "0", 
//    "currentPhaseB": "0", 
//    "powerFactorPhaseR": "0.754", 
//    "powerFactorPhaseY": "0.566", 
//    "powerFactorPhaseB": "0.411", 
//    "activePowerPhaseR": "0", 
//    "activePowerPhaseY": "0", 
//    "activePowerPhaseB": "0", 
//    "apparantPowerPhaseR": "0", 
//    "apparantPowerPhaseY": "0", 
//    "apparantPowerPhaseB": "0", 
//    "reactivePowerPhaseR": "0", 
//    "reactivePowerPhaseY": "0", 
//    "reactivePowerPhaseB": "0"
// }

// {
//   deviceType: 'Meter',
//   name: 'SM',
//   ftpId: 'XD597126',
//   data: [
//     {
//       timestamp: '01/01/24-00:00:33',
//       currentPhaseR: '0',
//       currentPhaseY: '0',
//       currentPhaseB: '0',
//       frequency: '50.092',
//       VoltageAvg: '259.166',
//       activeCurrent: '0',
//       powerFactor: '0.582',
//       activePower: '0',
//       apparantPower: '0',
//       reactivePower: '0',
//       netActiveEnergy: '261673.805',
//       activeEnergyImport: '123280.805',
//       activeEnergyExport: '138393',
//       netApparentEnergy: '263629.211',
//       apparentEnergyImport: '124287.805',
//       apparentEnergyExport: '139341.406',
//       voltagePhaseR: '259.763',
//       voltagePhaseY: '259.248',
//       voltagePhaseB: '258.486',
//       powerFactorPhaseR: '0.754',
//       powerFactorPhaseY: '0.566',
//       powerFactorPhaseB: '0.411',
//       activePowerPhaseR: '0',
//       activePowerPhaseY: '0',
//       activePowerPhaseB: '0',
//       apparantPowerPhaseR: '0',
//       apparantPowerPhaseY: '0',
//       apparantPowerPhaseB: '0',
//       reactivePowerPhaseR: '0',
//       reactivePowerPhaseY: '0',
//       reactivePowerPhaseB: '0'
//     },
//     {
//       timestamp: '10/01/24-00:00:33',
//       currentPhaseR: '0',
//       currentPhaseY: '0',
//       currentPhaseB: '0',
//       frequency: '50.092',
//       VoltageAvg: '259.166',
//       activeCurrent: '0',
//       powerFactor: '0.582',
//       activePower: '0',
//       apparantPower: '0',
//       reactivePower: '0',
//       netActiveEnergy: '261673.805',
//       activeEnergyImport: '123280.805',
//       activeEnergyExport: '138393',
//       netApparentEnergy: '263629.211',
//       apparentEnergyImport: '124287.805',
//       apparentEnergyExport: '139341.406',
//       voltagePhaseR: '259.763',
//       voltagePhaseY: '259.248',
//       voltagePhaseB: '258.486',
//       powerFactorPhaseR: '0.754',
//       powerFactorPhaseY: '0.566',
//       powerFactorPhaseB: '0.411',
//       activePowerPhaseR: '0',
//       activePowerPhaseY: '0',
//       activePowerPhaseB: '0',
//       apparantPowerPhaseR: '0',
//       apparantPowerPhaseY: '0',
//       apparantPowerPhaseB: '0',
//       reactivePowerPhaseR: '0',
//       reactivePowerPhaseY: '0',
//       reactivePowerPhaseB: '0'
//     }
//   ]
// }