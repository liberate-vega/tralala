import React, { useState, useEffect } from 'react';
import NewBookModal from './NewBookModal';
import TranslationProgress from './TranslationProgress';
import { translateImage } from '../utils/llmApi';

interface Props {
  activeProfile: any;
  onOpenBook: (id: string) => void;
}

export default function LibraryView({ activeProfile, onOpenBook }: Props) {
  const [books, setBooks] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [userDataPath, setUserDataPath] = useState('');

  const [showNewBookModal, setShowNewBookModal] = useState(false);
  const [translating, setTranslating] = useState<{bookName: string, current: number, total: number} | null>(null);

  useEffect(() => {
    loadBooks();
    window.electronAPI.getUserDataPath().then(setUserDataPath);
  }, []);

  const loadBooks = async () => {
    const loadedBooks = await window.electronAPI.getBooks();
    setBooks(loadedBooks);
  };

  const getCoverImage = (book: any) => {
    if (book.pages && book.pages.length > 0) {
       return `local://${userDataPath}/books/${book.id}/${book.pages[0].fileName}`;
    }
    return '';
  };

  const handleStartTranslation = async (bookName: string, imagePaths: string[]) => {
    setShowNewBookModal(false);

    const result = await window.electronAPI.createBook(bookName, imagePaths);
    if (!result.success) {
      alert("Error creating book: " + result.error);
      return;
    }

    const bookId = result.book.id;
    const pages = result.book.pages;

    setTranslating({ bookName, current: 0, total: pages.length });

    for (let i = 0; i < pages.length; i++) {
       const page = pages[i];
       try {
         const filePath = `${userDataPath}/books/${bookId}/${page.fileName}`;
         const base64Image = await window.electronAPI.getFileBase64(filePath);

         const transcript = await translateImage(base64Image, activeProfile);
         await window.electronAPI.saveBookTranscript(bookId, page.id, transcript);

       } catch (err: any) {
         console.error("Translation error on page", i, err);
         await window.electronAPI.saveBookTranscript(bookId, page.id, `[Translation Error: ${err.message}]`);
       }

       setTranslating({ bookName, current: i + 1, total: pages.length });
    }

    setTranslating(null);
    loadBooks();
  };

  return (
    <div className="p-8 h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">My Library</h2>
          {activeProfile ? (
            <p className="text-sm text-green-600 font-medium mt-1">Active AI: {activeProfile.name}</p>
          ) : (
            <p className="text-sm text-red-500 font-medium mt-1">No Active AI Profile - Please configure in Settings</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white border rounded-lg p-1 flex shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 font-bold' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 font-bold' : 'text-gray-500 hover:text-gray-800'}`}
            >
              List
            </button>
          </div>

          <button
            onClick={() => setShowNewBookModal(true)}
            disabled={!activeProfile}
            title={!activeProfile ? "Please setup an AI profile first" : ""}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + New Book
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
             <div className="text-6xl mb-4">📚</div>
             <p className="text-xl font-medium mb-2">Your library is empty</p>
             <p>Click "+ New Book" to start translating your comics.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-8">
            {books.map(book => (
              <div
                key={book.id}
                onClick={() => onOpenBook(book.id)}
                className="group cursor-pointer flex flex-col"
              >
                <div className="aspect-[2/3] bg-gray-200 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1 group-hover:border-blue-400 border border-gray-200 relative mb-3">
                  {book.pages && book.pages.length > 0 ? (
                     <img src={getCoverImage(book)} alt={book.name} className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400">No Pages</div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
                <h3 className="font-semibold text-gray-900 truncate px-1">{book.name}</h3>
                <p className="text-xs text-gray-500 px-1 mt-0.5">{book.pages ? book.pages.length : 0} pages</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 font-medium text-gray-600">Book Name</th>
                  <th className="px-6 py-4 font-medium text-gray-600">Pages</th>
                  <th className="px-6 py-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book, i) => (
                  <tr
                    key={book.id}
                    onClick={() => onOpenBook(book.id)}
                    className={`cursor-pointer hover:bg-blue-50 transition-colors ${i !== books.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{book.name}</td>
                    <td className="px-6 py-4 text-gray-600">{book.pages ? book.pages.length : 0}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-md">Ready</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNewBookModal && (
        <NewBookModal
          onClose={() => setShowNewBookModal(false)}
          onStartTranslation={handleStartTranslation}
        />
      )}

      {translating && (
        <TranslationProgress
          bookName={translating.bookName}
          current={translating.current}
          total={translating.total}
        />
      )}

    </div>
  );
}
