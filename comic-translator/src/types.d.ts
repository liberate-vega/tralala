export interface ElectronAPI {
  getProfiles: () => Promise<any[]>;
  saveProfile: (name: string, data: any) => Promise<any>;
  getBooks: () => Promise<any[]>;
  createBook: (name: string, imagePaths: string[]) => Promise<any>;
  openImagesDialog: () => Promise<string[]>;
  saveBookTranscript: (bookId: string, pageId: number, transcript: string) => Promise<any>;
  getUserDataPath: () => Promise<string>;
  getFileBase64: (filePath: string) => Promise<string>;
  translateImage: (base64Image: string, profile: any, mimeType: string) => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
