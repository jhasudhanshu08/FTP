const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const ftp = require('basic-ftp');

async function listDirectories(directory) {
  const client = new ftp.Client();

  try {
    // Connect to the FTP server
    await client.access({
      host: 'ftp.prescinto.com',
      user: 'Radiance',
      password: 'Welcome@123',
      secure: false // Set to true for FTPS
    });

    // Change to the specified directory
    await client.cd(directory);

    // List the contents of the directory
    const listing = await client.list();

    // Filter out only directories and print their names
    const directories = listing
      .filter(item => item.type === 2) // 1 represents a directory
      .map(item => {
        console.log('Directory:', item);
        return item.name;
      });

    // If no directories found
    if (directories.length === 0) {
      console.log('No directories found in', directory);
    }

    return directories;
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close the FTP connection
    await client.close();
  }
}

// Specify the directory to list
const targetDirectory = '/DJB/Haidarpur/chemical_house/Backup';

// Call the function to list directories
listDirectories(targetDirectory);

app.listen(7002, () => {
    console.log('server running on port 7002');
  });
