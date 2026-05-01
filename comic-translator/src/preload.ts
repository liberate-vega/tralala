import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getProfiles: () => ipcRenderer.invoke('get-profiles'),
  saveProfile: (name: string, data: any) => ipcRenderer.invoke('save-profile', name, data),
  getBooks: () => ipcRenderer.invoke('get-books'),
  createBook: (name: string, imagePaths: string[]) => ipcRenderer.invoke('create-book', name, imagePaths),
  openImagesDialog: () => ipcRenderer.invoke('open-images-dialog'),
  saveBookTranscript: (bookId: string, pageId: number, transcript: string) => ipcRenderer.invoke('save-book-transcript', bookId, pageId, transcript),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  getFileBase64: (filePath: string) => ipcRenderer.invoke('get-file-base64', filePath)
});
