// app.js

// Define an instance of Express
const express = require('express');

// Specify Host and port
const HOST = '127.0.0.1';
const app = express();

// TCP port 
const PORT = 3000;

// Serve Static Assets from the public folder
app.use(express.static('public'));

// Start the server and listen on the TCP port defined above
// Display a console message to indicate that the server staarted and is running
app.listen(PORT, HOST, () => {
    console.log(`Server connected at http://localhost:${PORT}`);
});