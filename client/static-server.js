const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3049;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'login.html' : req.url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.readFile(path.join(__dirname, 'public', 'login.html'), (err, data) => {
        res.end(data);
      });
    } else {
      const ext = path.extname(filePath);
      const contentTypeMap = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
      };
      res.writeHead(200, { 'Content-Type': contentTypeMap[ext] || 'text/plain' });
      res.end(data);
    }
  });
});

server.listen(PORT, 'localhost', () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║  🌐 Frontend Server Running            ║
  ║  📍 http://localhost:${PORT}           ║
  ║  🔌 Serving static files               ║
  ╚════════════════════════════════════════╝
  `);
});
