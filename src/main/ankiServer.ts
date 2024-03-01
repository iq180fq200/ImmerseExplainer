import path from 'path';
import { spawn } from 'child_process';
import { logger } from '@main/logger';

export async function startAnkiServer() {
  let executablePath;
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    // If in development, use the executable from your project directory
    executablePath = path.join(__dirname, '../../Anki/dist/updateDeck');
  } else {
    // If in production, use the executable from the resources directory
    executablePath = path.join(process.resourcesPath, 'updateDeck');
  }

  const child = spawn(executablePath);

  // Setup cleanup function
  function cleanup() {
    console.log('Node.js process exiting, terminating the executable...');
    child.kill();
  }

  // Attach cleanup function to exit events
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup); // Handle Ctrl+C
  process.on('SIGTERM', cleanup); // Handle kill command

  // Handle stdout and stderr
  child.stdout.on('data', (data) => {
    logger.info(`update anki stdout: ${data}`);
  });
  child.stderr.on('data', (data) => {
    logger.error(`update anki stderr: ${data}`);
  });

}