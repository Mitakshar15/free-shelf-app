const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors());

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Simple endpoint to serve files from local file system
app.get('/api/serve-file', (req, res) => {
  const filePath = req.query.path;
  
  if (!filePath) {
    return res.status(400).send('No file path provided');
  }
  
  console.log('Requested file path:', filePath);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File not found:', filePath);
      return res.status(404).send('File not found');
    }
    
    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    
    // Stream the file
    const stream = fs.createReadStream(filePath);
    stream.on('error', (error) => {
      console.error('Error streaming file:', error);
      res.status(500).send('Error streaming file');
    });
    
    stream.pipe(res);
  });
});

// Serve static files from Angular app's dist folder if it exists
if (fs.existsSync(path.join(__dirname, 'dist/free-shelf-app'))) {
  app.use(express.static(path.join(__dirname, 'dist/free-shelf-app')));
  
  // All other GET requests not handled before will return the Angular app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/free-shelf-app/index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`File server running on http://localhost:${PORT}`);
  console.log(`To serve a file, use: http://localhost:${PORT}/api/serve-file?path=/path/to/file.jpg`);
});
