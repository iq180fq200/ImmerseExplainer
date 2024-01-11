import { IpcMainInvokeEvent } from 'electron'
import 'openai/shims/node'
import { translate } from '@vitalets/google-translate-api';
import { logger } from './logger';
import { HttpProxyAgent } from 'http-proxy-agent';
import path from 'path';
import { promisify } from 'util';
import { execFile } from 'child_process';

const execFileAsync = promisify(execFile);

async function getProxyAgent() {
  let executablePath;
  if (process.env.NODE_ENV === 'development') {
    // If in development, use the executable from your project directory
    executablePath = path.join(__dirname, '../../Anki/dist/ProxyServer');
  } else {
    // If in production, use the executable from the resources directory
    executablePath = path.join(process.resourcesPath, 'ProxyServer');
  }
  const { stdout, stderr } = await execFileAsync(executablePath)
  if (stderr) {
    logger.error(`proxy pool error: ${stderr}`);
    throw new Error(`proxy pool error: ${stderr}`);
  }else {
    return new HttpProxyAgent(stdout);
  }
}

let agent: HttpProxyAgent | undefined = undefined;

export async function handleTranslate(
  _event: IpcMainInvokeEvent,
  phrase: string
) {
  try{
    const text = await translate(phrase, {to: 'zh-cn', fetchOptions:{agent},})
    return {
    status: 200,
    content: text.text,
  }}
  catch(err){
    logger.error("Google Translation Error" + err)
    if(err.name === 'TooManyRequestsError'){
      try{
        const agent_1 = getProxyAgent();
        agent_1.then((_agent) => {
          agent = _agent;
          logger.info("proxy agent set")
        })
        return {
          status: 200,
          content: 'Too many google translation requests, trying to find a proxy, please try again later after 30 seconds',
        }
      }
      catch (err){
        logger.error("proxy pool error: " + err)
      }
    }
    return {
      status: 500,
      content: 'Google Translation Error',
    }
  }
}
