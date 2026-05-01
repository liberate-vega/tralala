import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onStartTranslation: (name: string, imagePaths: string[]) => void;
}

export default function NewBookModal({ onClose, onStartTranslation }: Props) {
  const [bookName, setBookName] = useState('');
  const [imagePaths, setImagePaths] = useState<string[]>([]);

  const handleSelectImages = async () => {
    const paths = await window.electronAPI.openImagesDialog();
    if (paths && paths.length > 0) {
      setImagePaths(paths);
    }
  };

  const handleStart = () => {
    if (bookName.trim() && imagePaths.length > 0) {
      onStartTranslation(bookName, imagePaths);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full flex flex-col overflow-hidden">

        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Create New Book</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Book Name</label>
            <input
              type="text"
              value={bookName}
              onChange={e => setBookName(e.target.value)}
              placeholder="e.g. My Awesome Comic Vol 1"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
             <label className="block text-sm font-medium mb-2">Select Images</label>
             <button
                onClick={handleSelectImages}
                className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50"
             >
                <span className="text-3xl mb-2">📸</span>
                <span className="font-medium">Browse Files</span>
             </button>
             {imagePaths.length > 0 && (
                <p className="mt-2 text-sm text-green-600 font-medium">Selected {imagePaths.length} images.</p>
             )}
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-100 font-medium text-gray-700">Cancel</button>
          <button
            onClick={handleStart}
            disabled={!bookName.trim() || imagePaths.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            Start Translation
          </button>
        </div>

      </div>
    </div>
  );
}
