const fs = require('fs');
const path = require('path');
const csvtojson = require('csvtojson');

const sourceDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2/unzip';
const destinationDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2/JSON';

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
      const jsonFilePath = path.join(destinationDirectory, `${path.parse(file).name}.json`);

      // Convert CSV to JSON
      csvtojson()
        .fromFile(csvFilePath)
        .then((jsonArray) => {
          // Customize the JSON structure as needed
          const customJsonArray = jsonArray.map((data) => ({
              
            
            // Customize the fields as needed
            customField1: (() => {
                console.log("data:", data)
                data.field1
            })(),
            customField2: data.field2,
            // Add more fields or modify existing ones as necessary
          }));

          // Save the customized JSON data to a file
          fs.writeFileSync(jsonFilePath, JSON.stringify(customJsonArray, null, 2));
          console.log(`Conversion complete for ${file}`);
        })
        .catch((err) => {
          console.error(`Error converting CSV to JSON for ${file}:`, err);
        });
    }
  });
});
