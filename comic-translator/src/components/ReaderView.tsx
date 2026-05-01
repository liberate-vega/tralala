import React, { useState, useEffect, useRef } from 'react';

interface Props {
  bookId: string;
  onBack: () => void;
}

export default function ReaderView({ bookId, onBack }: Props) {
  const [book, setBook] = useState<any>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [userDataPath, setUserDataPath] = useState('');

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    loadBook();
    window.electronAPI.getUserDataPath().then(setUserDataPath);
  }, [bookId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, book]);

  const loadBook = async () => {
    const books = await window.electronAPI.getBooks();
    const found = books.find(b => b.id === bookId);
    if (found) {
      setBook(found);
      setCurrentPageIndex(0);
    }
  };

  const goToNext = () => {
    if (book && currentPageIndex < book.pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
      resetZoom();
    }
  };

  const goToPrev = () => {
    if (book && currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      resetZoom();
    }
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || scale > 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      goToPrev();
    } else {
      goToNext();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const newScale = Math.min(Math.max(scale - e.deltaY * 0.01, 1), 5);
      setScale(newScale);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  if (!book) return <div className="p-8">Loading...</div>;

  const currentPage = book.pages[currentPageIndex];
  const imageUrl = currentPage ? `local://${userDataPath}/books/${bookId}/${currentPage.fileName}` : '';
  const transcriptText = currentPage?.transcript || 'No translation available for this page.';

  const formattedTranscript = transcriptText.split('\n').map((line: string, i: number) => (
    <React.Fragment key={i}>
      {line}
      <br />
    </React.Fragment>
  ));

  return (
    <div className="flex h-full bg-gray-900 text-gray-100 overflow-hidden select-none">

      <div className="flex-1 relative flex flex-col border-r border-gray-800">
         <div className="absolute top-4 left-4 z-10 flex gap-4">
           <button onClick={onBack} className="bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur transition-colors">
             &larr; Library
           </button>
           {scale > 1 && (
             <button onClick={resetZoom} className="bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur transition-colors">
               Reset Zoom
             </button>
           )}
         </div>

         <div className="absolute top-4 right-4 z-10 bg-black/50 text-white px-3 py-1 rounded-lg backdrop-blur font-medium">
           Page {currentPageIndex + 1} / {book.pages.length}
         </div>

         <div
           className="flex-1 flex items-center justify-center overflow-hidden cursor-pointer"
           onClick={handleImageClick}
           onWheel={handleWheel}
           onMouseDown={handleMouseDown}
           onMouseMove={handleMouseMove}
           onMouseUp={handleMouseUp}
           onMouseLeave={handleMouseUp}
         >
           {imageUrl ? (
             <img
               src={imageUrl}
               alt={`Page ${currentPageIndex + 1}`}
               style={{
                 transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                 transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                 maxHeight: '100%',
                 maxWidth: '100%',
                 objectFit: 'contain'
               }}
               draggable={false}
             />
           ) : (
             <div className="text-gray-500">No image</div>
           )}
         </div>
      </div>

      <div className="w-1/3 min-w-[300px] max-w-lg bg-white text-gray-900 flex flex-col h-full shadow-[-4px_0_15px_rgba(0,0,0,0.1)] z-20">
         <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
           <h3 className="font-bold text-lg">{book.name}</h3>
           <p className="text-sm text-gray-500">Translation Transcript</p>
         </div>

         <div className="p-6 overflow-y-auto flex-1 font-serif text-lg leading-relaxed whitespace-pre-wrap">
           {formattedTranscript}
         </div>
      </div>

    </div>
  );
}
