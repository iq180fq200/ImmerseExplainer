import { IpcMainInvokeEvent } from 'electron'
import 'openai/shims/node'
import { logger } from './logger'
import { IPCReply } from '@common/IPCReply'
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function handleAddFlashcard(
  _event: IpcMainInvokeEvent,
  context: string,
  word_indexes: number[],
  explanation: string,
  // audioFile?: string,
  deckName: string,
  includeCloze: boolean
) {
  let executablePath;
  if (process.env.NODE_ENV === 'development') {
    // If in development, use the executable from your project directory
    executablePath = path.join(__dirname, '../../Anki/dist/updateDeck');
  } else {
    // If in production, use the executable from the resources directory
    executablePath = path.join(process.resourcesPath, 'updateDeck');
  }
  const str_word_indexes = word_indexes.map((index) => index.toString());
  const args = [
    '--context',
    context,
    '--explanation',
    explanation,
    // '--mp3_file',
    // audioFile,
    '--deck_name',
    deckName,
    '--level',
    includeCloze && str_word_indexes.length !== 0?"both":"understanding",
  ];
  if(str_word_indexes.length !== 0){
    args.push('--word_indexes')
    args.push(...str_word_indexes)
  }
  logger.info(`add to AnKi exec: ${executablePath} ${args.join(' ')}`);


  try {
    const { stdout, stderr } = await execFileAsync(executablePath,args)
    if (stderr) {
      logger.error(`python binary error: ${stderr}`);
      return { status: 400, content: `Stderr: ${stderr}` };
    }
    logger.trace(`python binary stdout: ${stdout}`);
    return {
      status: 200,
      content: 'success',
    } as IPCReply
  } catch (error) {
      if(error.message.includes("refused")){
        return {
          status: 400,
          content: `Error: Anki not running`,
        } as IPCReply
      }
      logger.error(`add to AnKi exec error: ${error}`);
      return {
        status: 500,
        content: `Error: ${error}`,
      } as IPCReply
  }
}

