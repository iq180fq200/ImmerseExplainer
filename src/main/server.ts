import { logger } from '@main/logger';
import * as http from 'http';
import path from 'path';
import fs from 'fs';
import { appWindow } from '@main/appWindow';



// Create a server
export const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    // Receive data in chunks
    req.on('data', chunk => {
      body += chunk.toString();
    });

    // When the entire body has been received
    req.on('end', () => {
      logger.info('Received from clippop:', body);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Request received');

      // send to renderer
      appWindow.webContents.send('clippopContext', body);
      // appWindow.moveTop();
      appWindow.focus();
      // appWindow.show();

    });
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
});

export function startExtensionServer(){
  const socketPath = path.join('/tmp', 'ImmerseExplainer.sock');
// Delete the socket file if it already exists
  if (fs.existsSync(socketPath)) {
    logger.info('Socket file already exists, deleting it...');
    fs.unlinkSync(socketPath);
  }else{
    logger.info('Socket file does not exist, creating it...');
  }
  server.listen(socketPath, () => {
    logger.info(`Server listening on ${socketPath}`);
  });

}

