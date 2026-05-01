import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

type Provider = 'ollama' | 'openai' | 'anthropic' | 'gemini' | null;

export default function Wizard({ onClose, onSaved }: Props) {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState<Provider>(null);

  const [profileName, setProfileName] = useState('');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');

  const [saving, setSaving] = useState(false);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSave = async () => {
    setSaving(true);
    const data = {
      provider,
      endpointUrl,
      apiKey,
      modelName: modelName || getDefaultModel(provider)
    };
    await window.electronAPI.saveProfile(profileName, data);
    setSaving(false);
    onSaved();
  };

  const getDefaultModel = (prov: Provider) => {
    switch(prov) {
      case 'ollama': return 'llava:latest';
      case 'openai': return 'gpt-4o';
      case 'anthropic': return 'claude-3-5-sonnet-20240620';
      case 'gemini': return 'gemini-1.5-pro';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">

        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">AI Setup Wizard</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold mb-2">Choose an AI Provider</h3>
              <p className="text-gray-600 mb-6">Select the AI engine you'd like to use for translations. This app requires a model with vision capabilities to read text from images.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'ollama', title: 'Ollama (Local)', desc: 'Run models locally on your own hardware. Free and private, but requires a powerful GPU for fast vision translations.' },
                  { id: 'openai', title: 'OpenAI (Cloud)', desc: 'Fast, highly accurate cloud translation using GPT-4o. Requires an API key and usage costs money.' },
                  { id: 'anthropic', title: 'Anthropic (Cloud)', desc: 'Excellent reasoning and formatting using Claude 3.5 Sonnet. Requires an API key.' },
                  { id: 'gemini', title: 'Google Gemini (Cloud)', desc: 'Great multi-modal capabilities with Gemini 1.5. Requires an API key.' }
                ].map(opt => (
                  <div
                    key={opt.id}
                    onClick={() => { setProvider(opt.id as Provider); setProfileName(`${opt.title} Profile`); }}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${provider === opt.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <h4 className="font-bold text-lg mb-1">{opt.title}</h4>
                    <p className="text-sm text-gray-600">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && provider === 'ollama' && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Ollama Local Setup</h3>
              <div className="bg-blue-50 p-4 rounded-lg text-blue-900 text-sm space-y-2">
                <p><strong>Instructions:</strong></p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Download and install Ollama from <a href="https://ollama.com" target="_blank" rel="noreferrer" className="underline font-bold">ollama.com</a>.</li>
                  <li>Open your terminal and pull a vision model. We recommend <code>llava</code>. Run: <code>ollama run llava</code></li>
                  <li>Ensure Ollama is running in the background. It typically serves locally on port 11434.</li>
                </ol>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Profile Name</label>
                <input type="text" value={profileName} onChange={e=>setProfileName(e.target.value)} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ollama Endpoint URL</label>
                <input type="text" placeholder="http://127.0.0.1:11434" value={endpointUrl} onChange={e=>setEndpointUrl(e.target.value)} className="w-full p-2 border rounded-md" />
                <p className="text-xs text-gray-500 mt-1">Leave blank to use default: http://127.0.0.1:11434</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model Name</label>
                <input type="text" placeholder="llava:latest" value={modelName} onChange={e=>setModelName(e.target.value)} className="w-full p-2 border rounded-md" />
              </div>
            </div>
          )}

          {step === 2 && provider !== 'ollama' && provider !== null && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold capitalize">{provider} Cloud Setup</h3>
              <div className="bg-blue-50 p-4 rounded-lg text-blue-900 text-sm space-y-2">
                <p><strong>Instructions:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  {provider === 'openai' && <li>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="underline font-bold">platform.openai.com</a>.</li>}
                  {provider === 'anthropic' && <li>Get your API key from <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="underline font-bold">console.anthropic.com</a>.</li>}
                  {provider === 'gemini' && <li>Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-bold">Google AI Studio</a>.</li>}
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Profile Name</label>
                <input type="text" value={profileName} onChange={e=>setProfileName(e.target.value)} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">API Key</label>
                <input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="Enter your secret API key" className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model Name (Optional)</label>
                <input type="text" placeholder={`Default: ${getDefaultModel(provider)}`} value={modelName} onChange={e=>setModelName(e.target.value)} className="w-full p-2 border rounded-md" />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          {step > 1 && <button onClick={handleBack} className="px-4 py-2 border rounded-md hover:bg-gray-100">Back</button>}
          {step === 1 ? (
             <button disabled={!provider} onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">Next</button>
          ) : (
             <button onClick={handleSave} disabled={saving || (!apiKey && provider !== 'ollama')} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
               {saving ? 'Saving...' : 'Save Profile'}
             </button>
          )}
        </div>

      </div>
    </div>
  );
}
