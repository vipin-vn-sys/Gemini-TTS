
import React, { useState, useEffect, useCallback } from 'react';
import { generateSpeech } from './services/geminiService';
import { AudioSparkIcon, LoaderIcon, ErrorIcon, DownloadIcon } from './components/icons';

const voices = [
    { id: 'Kore', name: 'Kore (Female)' },
    { id: 'Puck', name: 'Puck (Male)' },
    { id: 'Charon', name: 'Charon (Male)' },
    { id: 'Zephyr', name: 'Zephyr (Female)' },
    { id: 'Fenrir', name: 'Fenrir (Male)' },
];

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>("Hello everyone, how are you");
  const [selectedVoice, setSelectedVoice] = useState<string>(voices[0].id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup function to revoke the object URL when the component unmounts
    // or when the audioUrl changes to prevent memory leaks.
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleGenerateSpeech = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const newAudioUrl = await generateSpeech(inputText, selectedVoice);
      setAudioUrl(newAudioUrl);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setAudioUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, selectedVoice]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden border border-slate-700">
          <div className="p-6 sm:p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-blue-500/10 p-3 rounded-full">
                <AudioSparkIcon className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Gemini Text-to-Speech</h1>
                <p className="text-slate-400">Transform your text into lifelike audio.</p>
              </div>
            </div>

            <div className="space-y-6">
               <div>
                <label htmlFor="voice-select" className="block text-sm font-medium text-slate-300 mb-2">
                  Select a Voice
                </label>
                <select
                  id="voice-select"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  disabled={isLoading}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow duration-200 text-slate-200"
                >
                  {voices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to convert to speech..."
                className="w-full h-36 p-4 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow duration-200 resize-none text-slate-200 placeholder-slate-500"
                disabled={isLoading}
              />
              
              <button
                onClick={handleGenerateSpeech}
                disabled={isLoading || !inputText.trim()}
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
              >
                {isLoading ? (
                  <>
                    <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Generating...
                  </>
                ) : (
                  'Generate Speech'
                )}
              </button>
            </div>
          </div>
          
          {(error || audioUrl) && (
             <div className="bg-slate-900/50 px-6 py-5 sm:px-8 border-t border-slate-700">
                {error && (
                    <div className="flex items-center bg-red-500/10 text-red-400 p-3 rounded-lg">
                        <ErrorIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}
                {audioUrl && (
                    <div className="mt-4">
                        <h3 className="text-slate-300 font-semibold mb-2">Generated Audio</h3>
                        <div className="flex items-center space-x-3">
                            <audio controls src={audioUrl} className="w-full">
                                Your browser does not support the audio element.
                            </audio>
                             <a
                              href={audioUrl}
                              download="gemini-speech.wav"
                              className="flex-shrink-0 inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded-lg transition-colors duration-200"
                              aria-label="Download generated audio"
                              title="Download audio"
                            >
                              <DownloadIcon className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                )}
             </div>
          )}
        </div>
        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>Powered by Google Gemini API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
