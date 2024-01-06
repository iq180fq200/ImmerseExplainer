import { IpcMainInvokeEvent } from 'electron'
import 'openai/shims/node'
import { translate } from '@vitalets/google-translate-api';
import { logger } from './logger';

export async function handleTranslate(
  _event: IpcMainInvokeEvent,
  phrase: string
) {
  try{const text = await translate(phrase, {to: 'zh-cn'})
    return {
    status: 200,
    content: text.text,
  }}
  catch(err){
    logger.error("Google Translation Error" + err)
    return {
      status: 500,
      content: 'Google Translation Error',
    }
  }
}
