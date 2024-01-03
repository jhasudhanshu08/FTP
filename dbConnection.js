const express = require('express');
const app = express();
const fs = require('fs');
const csvParser = require('csv-parser');
const { MongoClient } = require('mongodb');
const path = require('path');

const inputDirectory = 'C:/Users/jhasu/OneDrive/Desktop/Solar_Logiq/Git 2/FTP/FTP/Data2/unzip'; // Replace with your output directory
const mongoURI = 'mongodb://localhost:27017'; // Replace with your MongoDB URI
const databaseName = 'sudhanshu'; // Replace with your MongoDB database name
const collectionName = 'csvFileReader'; // Replace with your MongoDB collection name

// Connect to MongoDB
async function connectToMongo() {
  const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    // Call the function to process CSV files
    await processCSVFiles(client.db(databaseName));

    // Start Express app after establishing MongoDB connection
    app.listen(7003, () => {
      console.log('Server running on port for DB 7000');
    });
  } finally {
    // No need to close the connection here, it will be closed when the application exits
    // await client.close();
    // console.log('Disconnected from MongoDB');
  }
}

// Process CSV files in the output directory
async function processCSVFiles(db) {
  // Get a list of files in the output directory
  const files = fs.readdirSync(inputDirectory);

  // Process each file in the output directory
  for (const file of files) {
    if (file.endsWith('.csv')) {
      const filePath = path.join(inputDirectory, file);
      await readCSVAndSaveToMongo(filePath, db);
    }
  }
}

// Read CSV file and save to MongoDB
async function readCSVAndSaveToMongo(filePath, db) {
  console.log(`Reading and saving data from ${filePath}`);

  // Create a readable stream from the CSV file
  const readStream = fs.createReadStream(filePath);

  // Use csv-parser to parse the CSV file
  readStream.pipe(csvParser())
    .on('data', async (row) => {
      // Insert each row into MongoDB
      await db.collection(collectionName).insertOne(row);
    })
    .on('end', () => {
      console.log(`Data from ${filePath} successfully saved to MongoDB`);
    })
    .on('error', (err) => {
      console.error(`Error reading and saving data from ${filePath}:`, err);
    });
}

// Call the function to connect to MongoDB and process CSV files
connectToMongo();
