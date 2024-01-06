import { app, BrowserWindow, ipcMain,clipboard } from 'electron';
import path from 'path';
import { handleExplain } from '@main/explainer';
import { handleAddFlashcard } from '@main/anki';
import { config } from '@main/config';
import { logger } from '@main/logger';
import { IPCReply } from '@common/IPCReply';
import { handleTranslate } from '@main/translator';
import { storeAPIKey } from '@main/io';

// Electron Forge automatically creates these entry points
declare const APP_WINDOW_WEBPACK_ENTRY: string;
declare const APP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export let appWindow: BrowserWindow;

/**
 * Create Application Window
 * @returns {BrowserWindow} Application Window Instance
 */
export function createAppWindow(): BrowserWindow {

  // Create new window instance
  appWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#FFFFFF',
    show: false,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: 'hidden',
    icon: path.resolve('assets/icons/appLogo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      preload: APP_WINDOW_PRELOAD_WEBPACK_ENTRY,
      sandbox: false,
    },
  });

  // Load the index.html of the app window.
  appWindow.loadURL(APP_WINDOW_WEBPACK_ENTRY);

  // Show window when it is ready to
  appWindow.on('ready-to-show', () => appWindow.show());

  // Register Inter Process Communication for main process
  registerMainIPC();

  //start the development window if in development mode
  if (process.env.NODE_ENV === 'development'){
    appWindow.webContents.openDevTools()
  }

  // Close all windows when main window is closed
  appWindow.on('close', () => {
    appWindow = null;
    app.quit();
  });

  return appWindow;
}

/**
 * Register Inter Process Communication
 */
function registerMainIPC() {
  /**
   * Here you can assign IPC related codes for the application window
   * to Communicate asynchronously from the main process to renderer processes.
   */
  // registerTitlebarIpc(appWindow);

  /**
   * ask gpt for context-aware explanation and return the result
   */
  ipcMain.handle('explain', handleExplain)
  ipcMain.handle('translate', handleTranslate)
  ipcMain.handle('copyToClipboard', (_, text: string) => {
    clipboard.writeText(text);
  })
  ipcMain.handle('addToAnki', handleAddFlashcard)
  ipcMain.handle('setOpenAIKey', (_, key: string) => {
    logger.info("setOpenAIKey: " + key)
    config.APIKEY = key
    storeAPIKey(key)
    return {
      status: 200,
      content: "OpenAI API key is set",
    } as IPCReply
  })
  ipcMain.handle('getOpenAIKey', () => {
    return {
      status: 200,
      content: config.APIKEY,
    } as IPCReply
  })
}
