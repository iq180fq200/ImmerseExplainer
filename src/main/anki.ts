import { IpcMainInvokeEvent } from 'electron'
import 'openai/shims/node'
import { logger } from './logger'
import { IPCReply } from '@common/IPCReply'
import * as net from 'net';

export async function handleAddFlashcard(
  _event: IpcMainInvokeEvent,
  context: string,
  word_indexes: number[],
  explanation: string,
  deckName: string,
  includeCloze: boolean,
  includeQACard: boolean
) {
  return new Promise<IPCReply>((resolve, reject) => {
    let level = ""
    if (includeCloze && word_indexes.length !== 0) {
      if (includeQACard) {
        level = "both"
      }else{
        level = "application"
      }
    } else{
      level = "understanding"
    }
    const args = {
      context: context,
      word_indexes: word_indexes,
      explanation: explanation,
      deck_name: deckName,
      level: level,
    }

    const client = net.createConnection({ path: "/tmp/updateDeck.sock" }, () => {
        logger.info('Connected to server!');
        client.write(JSON.stringify(args));
    });



    client.on('data', (data: Buffer) => {
      logger.info('Received: ' + data);
      resolve({
        status: 200,
        content: 'success',
      } as IPCReply);
      client.destroy(); // close the connection after receiving the response
    });

    client.on('error', (err) => {
      if(err.message.includes("refused")){
        reject ({
          status: 400,
          content: `Error: Anki not running`,
        } as IPCReply)
      }
      reject({
        status: 500,
        content: `Error: ${err}`,
      } as IPCReply);
    });

    client.on('close', () => {
      logger.info('Connection to anki handler closed');
    });
  })
}

