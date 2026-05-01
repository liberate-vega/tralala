import React, { useState, useEffect } from 'react';
import SettingsView from './components/SettingsView';
import LibraryView from './components/LibraryView';
import ReaderView from './components/ReaderView';

export default function App() {
  const [currentView, setCurrentView] = useState<'library' | 'settings' | 'reader'>('library');
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const loadedProfiles = await window.electronAPI.getProfiles();
    setProfiles(loadedProfiles);
    if (loadedProfiles.length > 0 && !activeProfileId) {
      setActiveProfileId(loadedProfiles[0].id);
    }
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId);

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm shrink-0">
        <h1
          className="text-xl font-bold tracking-tight cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => setCurrentView('library')}
        >
          Comic Translator
        </h1>
        <nav className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView('library')}
            className={`px-4 py-2 rounded-md font-medium ${currentView === 'library' || currentView === 'reader' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Library
          </button>
          <button
            onClick={() => setCurrentView('settings')}
            className={`px-4 py-2 rounded-md font-medium ${currentView === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Settings
          </button>
        </nav>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {currentView === 'settings' && (
          <SettingsView
            profiles={profiles}
            onProfileSaved={loadProfiles}
            activeProfileId={activeProfileId}
            onSelectActiveProfile={setActiveProfileId}
          />
        )}
        {currentView === 'library' && (
          <LibraryView
             activeProfile={activeProfile}
             onOpenBook={(bookId) => {
               setActiveBookId(bookId);
               setCurrentView('reader');
             }}
          />
        )}
        {currentView === 'reader' && activeBookId && (
          <ReaderView bookId={activeBookId} onBack={() => setCurrentView('library')} />
        )}
      </main>
    </div>
  );
}
