import { app, BrowserWindow, ipcMain, protocol, net } from 'electron';
import { initDirectories, getProfiles, saveProfile, getBooks, createBook, openImagesDialog, saveBookTranscript, getFileBase64, USER_DATA_PATH } from './fileSystem';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) {
  app.quit();
}

app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-dev-shm-usage");

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  protocol.handle('local', (request) => {
    const filePath = request.url.replace('local://', '');
    return net.fetch('file://' + filePath);
  });

  initDirectories();

  ipcMain.handle('get-profiles', () => getProfiles());
  ipcMain.handle('save-profile', (event, name, data) => saveProfile(name, data));
  ipcMain.handle('get-books', () => getBooks());
  ipcMain.handle('create-book', (event, name, imagePaths) => createBook(name, imagePaths));
  ipcMain.handle('open-images-dialog', async (event) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    if (win) {
        return openImagesDialog(win);
    }
    return [];
  });
  ipcMain.handle('save-book-transcript', (event, bookId, pageId, transcript) => saveBookTranscript(bookId, pageId, transcript));
  ipcMain.handle('get-user-data-path', () => USER_DATA_PATH);
  ipcMain.handle('get-file-base64', (event, filePath) => getFileBase64(filePath));
});
