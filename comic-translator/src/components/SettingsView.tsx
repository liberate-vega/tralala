import React, { useState } from 'react';
import Wizard from './Wizard';

interface Props {
  profiles: any[];
  onProfileSaved: () => void;
  activeProfileId: string | null;
  onSelectActiveProfile: (id: string) => void;
}

export default function SettingsView({ profiles, onProfileSaved, activeProfileId, onSelectActiveProfile }: Props) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-8 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Settings</h2>
        <button
          onClick={() => setIsWizardOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
        >
          + New AI Profile
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4 border-b pb-4">Active AI Profile</h3>

        {profiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No AI profiles configured yet.</p>
            <p>Click "New AI Profile" to set up an AI translation model.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map(profile => (
              <div
                key={profile.id}
                onClick={() => onSelectActiveProfile(profile.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  activeProfileId === profile.id
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-lg">{profile.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{profile.provider} Model</p>
                  </div>
                  {activeProfileId === profile.id && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Active</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isWizardOpen && (
        <Wizard
          onClose={() => setIsWizardOpen(false)}
          onSaved={() => {
            setIsWizardOpen(false);
            onProfileSaved();
          }}
        />
      )}
    </div>
  );
}
