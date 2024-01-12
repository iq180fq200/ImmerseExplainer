import { logger } from '@main/logger';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { config } from '@main/config';
import { IPCReply } from '@common/IPCReply';

export function retrieveStoredAPIKey(){
  const dir: string = path.join(os.homedir(),".ImmerseExplainer");
  const APIFile: string = path.join(dir,"APIKey.txt");
  if (fs.existsSync(APIFile)){
    const key: string = fs.readFileSync(APIFile,"utf-8");
    config.APIKEY = key;
    logger.info("API key retrived from: "+APIFile);
  }
  else{
    logger.info("No API key found at: "+APIFile);
  }
}

export function storeAPIKey(key: string){
  const dir: string = path.join(os.homedir(),".ImmerseExplainer");
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
  const APIFile: string = path.join(dir,"APIKey.txt");
  fs.writeFileSync(APIFile,key);
  logger.info("API key stored at: "+APIFile);
}

export function getDeckNameList() {
  const dir: string = path.join(os.homedir(), ".ImmerseExplainer");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const deckNameFile: string = path.join(dir, "deck_mapping.txt");
  let list: string[] = [];
  if (fs.existsSync(deckNameFile)) {
    const deckName: string = fs.readFileSync(deckNameFile, "utf-8");
    const maps = deckName.split("\n");
    list = maps.map((map) => map.split(",")[0]);
  }
  return {
    status: 200,
    content: list,
  } as IPCReply;
}