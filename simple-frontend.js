const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const publicDir = path.join(__dirname, 'client', 'public');

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let filePath = path.join(publicDir, req.url === '/' ? 'login.html' : req.url);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Serve login.html for all 404s
      fs.readFile(path.join(publicDir, 'login.html'), (err2, data2) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data2);
      });
    } else {
      const contentTypeMap = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
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
  ║  📁 Serving from: public/login.html    ║
  ╚════════════════════════════════════════╝
  `);
});
