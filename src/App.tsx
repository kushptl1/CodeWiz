import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Code2, Upload, Sparkles, ArrowRight, X } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { getAuth, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, provider } from './config/firebase-config';

const LANGUAGES = [
  'choose your language',
  'typescript',
  'javascript',
  'python',
  'java',
  'csharp',
  'cpp',
  'go',
  'rust',
  'ruby',
  'php',
  'react',
  'angular',
  'vue',
  'nextjs'
];

interface ErrorModalProps {
  show: boolean;
  onClose: () => void;
}

function ErrorModal({ show, onClose }: ErrorModalProps) {
  if (!show) return null;
  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-red-600 text-white p-6 rounded-lg w-11/12 max-w-md">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Error</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="mt-4 text-lg">
          Please select both source and target languages before proceeding.
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400"
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
}

const App: React.FC = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [sourceCode, setSourceCode] = useState<string>('');
  const [sourceLang, setSourceLang] = useState<string>('choose your language');
  const [targetLang, setTargetLang] = useState<string>('choose your language');
  const [convertedCode, setConvertedCode] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const handleError = (): boolean => {
    if (
      sourceLang === 'choose your language' ||
      targetLang === 'choose your language'
    ) {
      setShowErrorModal(true);
      return true;
    }
    return false;
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error('Error logging in with Google:', error);
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => setUser(null))
      .catch((error) => console.error('Error logging out:', error));
  };

  const handleConvert = async () => {
    if (handleError()) return;

    try {
      const response = await fetch(
        'https://v7vk9k1rd1.execute-api.us-east-1.amazonaws.com/convert',
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            UserID: user?.uid,
            sourceLang,
            targetLang,
            sourceCode
          })
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Conversion failed');
      }

      const data = await response.json();
      setConvertedCode(data.converted_code); // Update the converted code
    } catch (error) {
      console.error('Error calling the Lambda API:', error);
      alert((error as Error).message);
    }
  };

  useEffect(() => {
    console.log('Converted Code:', convertedCode);
  }, [convertedCode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0f1729] to-gray-900 text-white">
      {/* Authentication */}
      <div className="absolute top-4 right-4 z-50">
        {user ? (
          <div className="p-4 text-green-400">
            <span>Welcome, {user.displayName}</span>
            <button
              onClick={handleLogout}
              className="ml-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ zIndex: 100 }}
          >
            Sign in with Google
          </button>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-gray-900"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex items-center justify-center space-x-2 text-purple-400 mb-6">
              <Code2 className="w-8 h-8" />
              <span className="text-xl font-semibold">CodeRefactor AI</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              AI-Powered Code Refactoring & Translation
            </h1>
            <p className="text-xl text-gray-300">
              Transform your code into cleaner, more efficient solutions with the
              power of AI
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <button
                onClick={() => setShowEditor(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                Try Now
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowEditor(true)}
                className={`px-8 py-4 bg-gray-800 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-700 transition-colors border border-gray-700 ${
                  !user ? 'cursor-not-allowed opacity-50' : ''
                }`}
                disabled={!user}
              >
                <Upload className="w-5 h-5" />
                Upload Code
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-8 mt-20">
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 max-w-sm mx-auto">
          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
            <Code2 className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Smart Refactoring</h3>
          <p className="text-gray-400 leading-relaxed">
            Our advanced AI model analyzes your code in real-time, offering intelligent
            suggestions for improvements...
          </p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 max-w-sm mx-auto">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Flexible Code Input</h3>
          <p className="text-gray-400 leading-relaxed">
            Choose your preferred way to input code. Use our interactive code editor...
          </p>
        </div>
      </div>

      <ErrorModal show={showErrorModal} onClose={() => setShowErrorModal(false)} />

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-[90vw] h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-300">
                    Source Language:
                  </label>
                  <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-300">
                    Target Language:
                  </label>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setShowEditor(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              {/* Display the Converted Code above the Editor */}
              {convertedCode && (
                <div className="p-4 bg-gray-800 text-white rounded-lg mb-4">
                  <h3 className="text-xl font-semibold mb-2">Converted Code</h3>
                  <pre className="bg-gray-700 p-4 rounded-md whitespace-pre-wrap">
                    {convertedCode}
                  </pre>
                </div>
              )}
              <Editor
                height="100%"
                defaultLanguage={sourceLang}
                value={sourceCode}
                onChange={(value) => setSourceCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 16,
                  lineHeight: 1.6,
                  padding: { top: 20 },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  contextmenu: true,
                  scrollbar: {
                    vertical: 'visible',
                    horizontal: 'visible',
                    verticalScrollbarSize: 12,
                    horizontalScrollbarSize: 12
                  }
                }}
                className="h-full"
              />
            </div>
            <div className="p-6 border-t border-gray-800 flex justify-between items-center bg-gray-900/80 backdrop-blur-sm">
              <div className="text-sm text-gray-400">Paste your code or start typing to begin</div>
              <button
                onClick={handleConvert}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity text-white"
              >
                Convert Code
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display Converted Code */}
      {convertedCode && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-[80vw] p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Converted Code</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm text-gray-400">Original Code</h4>
                <pre className="text-white bg-gray-800 p-4 rounded-md">
                  {sourceCode}
                </pre>
              </div>
              <div>
                <h4 className="text-sm text-gray-400">Converted Code</h4>
                <pre className="text-white bg-gray-800 p-4 rounded-md">
                  {convertedCode}
                </pre>
              </div>
            </div>
            <button
              onClick={() => setConvertedCode('')}
              className="mt-4 px-6 py-3 bg-red-500 rounded-lg text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
