import React from 'react';

interface Props {
  bookName: string;
  current: number;
  total: number;
}

export default function TranslationProgress({ bookName, current, total }: Props) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
         <div className="text-5xl mb-4 animate-bounce">🤖</div>
         <h2 className="text-2xl font-bold mb-2">Translating {bookName}</h2>
         <p className="text-gray-600 mb-8">Please wait while the AI analyzes and translates your comic. This may take a while depending on your model.</p>

         <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
           <div className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out" style={{ width: `${percentage}%` }}></div>
         </div>
         <p className="font-bold text-lg text-gray-800">Received {current} of {total} total pages ({percentage}%)</p>
      </div>
    </div>
  );
}
