import React, { useState } from 'react';
import { Code2, Upload, Sparkles, ArrowRight, X } from 'lucide-react';
import Editor from '@monaco-editor/react';

const LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'java',
  'csharp',
  'cpp',
  'go',
  'rust',
  'ruby',
  'php'
];

function App() {
  const [showEditor, setShowEditor] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const [sourceLang, setSourceLang] = useState('javascript');
  const [targetLang, setTargetLang] = useState('typescript');

  const handleRefactor = () => {
    // TODO: Implement refactoring logic
    console.log('Refactoring from', sourceLang, 'to', targetLang);
    console.log('Code:', sourceCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0f1729] to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-gray-900"></div>
        
        {/* Content */}
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
              Transform your code into cleaner, more efficient solutions with the power of AI
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
                className="px-8 py-4 bg-gray-800 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-700 transition-colors border border-gray-700"
              >
                <Upload className="w-5 h-5" />
                Upload Code
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mt-24">
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Refactoring</h3>
              <p className="text-gray-400 leading-relaxed">
                Our advanced AI agents analyze your code in real-time, offering intelligent suggestions for improvements. 
                Using state-of-the-art language models, we identify optimization opportunities, detect anti-patterns, 
                and propose modern coding practices. Each suggestion comes with detailed explanations and the reasoning 
                behind the proposed changes.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Flexible Code Input</h3>
              <p className="text-gray-400 leading-relaxed">
                Choose your preferred way to input code. Use our interactive code editor with syntax highlighting 
                for direct input and editing, or simply drag and drop your files. Support for multiple file formats 
                and programming languages ensures a seamless experience, whether you're refactoring a single function 
                or an entire module.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-[90vw] h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-300">Source Language:</label>
                  <select 
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-300">Target Language:</label>
                  <select 
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
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
                    horizontalScrollbarSize: 12,
                  }
                }}
                className="h-full"
              />
            </div>
            <div className="p-6 border-t border-gray-800 flex justify-between items-center bg-gray-900/80 backdrop-blur-sm">
              <div className="text-sm text-gray-400">
                Paste your code or start typing to begin
              </div>
              <button
                onClick={handleRefactor}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity text-white"
              >
                Refactor Code
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;