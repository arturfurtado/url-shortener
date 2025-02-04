import React, { useState } from 'react';
import axios from 'axios';
import { Check, Copy, Link } from 'lucide-react';

function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) {
      setError('Por favor, insira uma URL válida');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:3001/api/shorten', { originalUrl });
      setShortUrl(response.data.shortUrl);
    } catch (err) {
      setError('Erro ao encurtar a URL. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Falha ao copiar URL');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
          URL Shortener
        </h1>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-2xl bg-white/5 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white/10"
      >
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://seusite.com/exemplo-longo"
              className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-lg border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 outline-none text-white placeholder-gray-400 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center gap-2 w-full py-4 font-medium rounded-lg transition-all ${
              loading 
                ? 'bg-blue-400/50 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500'
            }`}
          >
            {loading ? (
              <>
                <span className="animate-spin">🌀</span>
                Encurtando...
              </>
            ) : (
              <>
                <Link size={18} />
                Encurtar URL
              </>
            )}
          </button>
        </div>

        {shortUrl && (
          <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10 animate-fade-in">
            <div className="flex items-center justify-between gap-4">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex-1 truncate"
              >
                {shortUrl}
              </a>
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Copiar URL"
              >
                {copied ? (
                  <Check className="text-green-400" size={20} />
                ) : (
                  <Copy className="text-gray-400" size={20} />
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-400/10 border border-red-400/30 text-red-400 rounded-lg animate-fade-in">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

export default App;