import { app, dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';

export const USER_DATA_PATH = app.getPath('userData');
export const BOOKS_DIR = path.join(USER_DATA_PATH, 'books');
export const PROFILES_DIR = path.join(USER_DATA_PATH, 'profiles');

export function initDirectories() {
  if (!fs.existsSync(BOOKS_DIR)) fs.mkdirSync(BOOKS_DIR, { recursive: true });
  if (!fs.existsSync(PROFILES_DIR)) fs.mkdirSync(PROFILES_DIR, { recursive: true });
}

export function getProfiles() {
  try {
    const files = fs.readdirSync(PROFILES_DIR);
    return files.filter(f => f.endsWith('.json')).map(f => {
      const data = fs.readFileSync(path.join(PROFILES_DIR, f), 'utf-8');
      return JSON.parse(data);
    });
  } catch (error) {
    return [];
  }
}

export function saveProfile(profileName: string, data: any) {
  try {
    const safeName = profileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(PROFILES_DIR, `${safeName}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ ...data, id: safeName, name: profileName }, null, 2));
    return { success: true, id: safeName };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function getBooks() {
  try {
    const dirs = fs.readdirSync(BOOKS_DIR, { withFileTypes: true });
    return dirs.filter(dirent => dirent.isDirectory()).map(dirent => {
      const bookPath = path.join(BOOKS_DIR, dirent.name);
      const jsonPath = path.join(bookPath, 'book.json');
      let bookData: any = { name: dirent.name, id: dirent.name, pages: [] };
      if (fs.existsSync(jsonPath)) {
        try {
          bookData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        } catch(e) {}
      }
      return bookData;
    });
  } catch (error) {
    return [];
  }
}

export async function openImagesDialog(window: BrowserWindow) {
  const result = await dialog.showOpenDialog(window, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }
    ]
  });
  return result.filePaths;
}

export function createBook(bookName: string, imagePaths: string[]) {
  try {
    const safeName = bookName.replace(/[^a-z0-9]/gi, '_');
    const bookDir = path.join(BOOKS_DIR, safeName);

    if (!fs.existsSync(bookDir)) {
      fs.mkdirSync(bookDir, { recursive: true });
    }

    const pages = imagePaths.map((imgPath, index) => {
      const ext = path.extname(imgPath);
      const newFileName = `page_${index.toString().padStart(3, '0')}${ext}`;
      const newPath = path.join(bookDir, newFileName);
      fs.copyFileSync(imgPath, newPath);
      return {
        id: index,
        fileName: newFileName,
        originalPath: imgPath,
        transcript: null
      };
    });

    const bookData = {
      id: safeName,
      name: bookName,
      pages
    };

    fs.writeFileSync(path.join(bookDir, 'book.json'), JSON.stringify(bookData, null, 2));
    return { success: true, book: bookData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function saveBookTranscript(bookId: string, pageId: number, transcript: string) {
    try {
        const bookPath = path.join(BOOKS_DIR, bookId);
        const jsonPath = path.join(bookPath, 'book.json');
        if (!fs.existsSync(jsonPath)) return { success: false, error: 'Book JSON not found' };

        const bookData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const page = bookData.pages.find((p: any) => p.id === pageId);
        if (page) {
            page.transcript = transcript;
            fs.writeFileSync(jsonPath, JSON.stringify(bookData, null, 2));
            return { success: true };
        }
        return { success: false, error: 'Page not found' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export function getFileBase64(filePath: string): string {
    try {
        const data = fs.readFileSync(filePath);
        return data.toString('base64');
    } catch(err) {
        return '';
    }
}
