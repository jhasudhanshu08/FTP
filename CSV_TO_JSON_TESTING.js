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

        for(let i = 0; i < dataArray.length; i++) {
          if(dataArray[i][0] === "deviceType" && i >= 3) {
            arrayOfObj.push({
              deviceType: dataArray[i][1],
              name: dataArray[i][2],
              ftpId: dataArray[i][3], 
              data: (() => {
                if(dataArray[i+2][0].includes("/") && i >= 3) {
                  
                  dataArray[i+2].forEach(data => {
                    console.log("data", data)
                    for(let jsonData of jsonFile) {
                      // console.log("dataArray[i][1]", dataArray[i+2])
                      if(jsonData.category === dataArray[i][1] && dataArray[i][1] === "Meter") {
                        // console.log("jsonData.category", jsonData.category, " - ", dataArray[i][1])
                        for(let key in jsonData.data) {
                          // console.log("jsonData.data[key] : ", jsonData.data[key])
                          // console.log("data : ", data)

                          innerDataObject[jsonData.data[key]] = data
                        }
                        // console.log("innerDataObject", innerDataObject);
                      }
                    }
                  })
                }
                return [innerDataObject];
                
              })()
            })
            // object["deviceType"] = dataArray[i][1];
            // object["name"] = dataArray[i][2];
            // object["ftpId"] = dataArray[i][3];
            // innerDataObject[jsonData.data[key]] = data

          }
        }
        console.log("object", arrayOfObj[0])

            // for(let i = 0; i < dataArray.length; i++) {
          

            //   if(dataArray[i][0] === "deviceType" && i >= 3) {
            //     object = {
            //       deviceType: dataArray[i][1],
            //       name: dataArray[i][2],
            //       ftpId: dataArray[i][3]
            //     }
              
            //     // console.log("data", object);
            //     // dataArray[i].forEach(data => {
            //     //   if(data !== dataArray[i][0] && data !== dataArray[i][dataArray[i].length-1]) {
                    
                    
                    
            //     //   }
            //     // })
            //   }
            //   else if(dataArray[i][0].includes("/") && i >= 3) {
            //     // console.log("dataArray[i]", dataArray[i])
            //     dataArray[i].forEach(data => {
            //       // console.log("data : ", data)
            //       for(let jsonData of jsonFile) {
            //         if(jsonData.category === "MFM") {
            //           for(let key in jsonData.data) {
            //             innerDataObject[jsonData.data[key]] = data
            //           }
            //         }
            //       }
            //     })
            //   }
            //   else {
            //     console.log("else")
            //   }
            // }
            // console.log("innerDataObject", innerDataObject)
            // console.log("json file", res)
            // for(key in res.data) {
            //   // console.log(key, " - ", res.data[key])
            // }
        // const fileData = firstLine.split(';');

        // Log the first line
        // console.log(`First line of ${file}:`, firstLine);
      });
    }
  });
});
