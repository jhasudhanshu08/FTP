const fs = require('fs');
const path = require('path');
const csvtojson = require('csvtojson');
const jsonFile = require('./json/files.json');

const sourceDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2/unzip';
const destinationDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2/JSON';

let dataArray = [];
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
          dataArray.push(res.split(';'));
        })
        let resultArray = [];
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

            let categoryIndex = jsonFile.findIndex(item => item.category === deviceType);

            if (categoryIndex !== -1) {
              let categoryDataKeys = Object.values(jsonFile[categoryIndex].data);

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
                // Insert the object only if it's not empty
                if (Object.keys(dataObj).length > 1) {
                  currentResultObj.data.push(dataObj);
                }
              }
              let k = 0;
              while (dataArray[i + 2 + k][0].includes("/")) {
                dataArrayObjects(k);
                k++;
              }
              // Skip the next array if it starts with "deviceType"
              if (dataArray[i + 4] && dataArray[i + 4][0] === 'deviceType') {
                i += 3; // Skip the next array
              }
            }
          } else if (dataArray[i][0].includes('/')) {
            let dataObj = {};
            let dataObjKeys = currentResultObj.data[0];

            for (let j = 0; j < dataObjKeys?.length; j++) {
              let key = dataObjKeys[j];
              let value = dataArray[i + 2][j];

              if (key !== "" && !isNaN(value) || key === "timestamp") {
                dataObj[key] = value;
              }
            }

            // Insert the object only if it's not empty
            if (Object.keys(dataObj).length > 1) {
              currentResultObj.data.push(dataObj);
            }
          }
        }

        console.log(resultArray);

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



