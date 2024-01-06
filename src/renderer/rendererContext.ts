import { ipcRenderer } from 'electron';

const rendererContext = {
  explain: (context: string, phrase: string[]) => {
    return ipcRenderer.invoke('explain',context,phrase)
  },
  translate: (phrase: string) => {
    return ipcRenderer.invoke('translate',phrase)
  },
  listenClipPopContext: (callback:any) => {ipcRenderer.on('clippopContext', (_, data) => callback(data))},
  unlistenClipPopContext: () => {ipcRenderer.removeAllListeners('clippopContext')},
  copyToClipboard: (text: string) => {ipcRenderer.invoke('copyToClipboard',text)},
  addToAnki: (context: string, word_indexes: number[], explanation: string) => {return ipcRenderer.invoke('addToAnki',context,word_indexes,explanation)},
  setOpenAIKey: (key: string) => {return ipcRenderer.invoke('setOpenAIKey',key)},
};

export type RendererContextAPI = typeof rendererContext;

export default rendererContext;