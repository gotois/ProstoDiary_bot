const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const logger = require('../src/services/logger.service');
const PORT = Number(process.env.PORT) || 9000;

http.createServer((req, res) => {
  const uri = url.parse(req.url).pathname;
  let filename = path.join(process.cwd(), uri);
  fs.exists(filename, (exists) => {
    if (!exists) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('404 Not Found\n');
      res.end();
      return;
    }
    if (fs.statSync(filename).isDirectory()) {
      filename = path.join(filename, 'web/index.html');
    }
    fs.readFile(filename, 'binary', (error, file) => {
      if (error) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.write('Oops 🤷️');
        logger.log('error', error.toString());
        res.end();
        return;
      }
      res.writeHead(200);
      res.write(file, 'binary');
      res.end();
    });
  });
}).listen(PORT);
