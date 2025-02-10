import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Check, Copy, Link as LinkIcon, User, LogOut } from 'lucide-react';

function Home() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ token, username });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) {
      setError('Por favor, insira uma URL válida');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token não encontrado, faça login novamente.');
        return;
      }
      const response = await axios.post(
        'http://localhost:3001/api/shorten',
        { originalUrl, customSlug: showCustom ? customSlug : null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShortUrl(response.data.shortUrl);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao encurtar a URL. Tente novamente.');
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

  const code = shortUrl ? shortUrl.split('/').pop() : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center p-4">
      <header className="w-full flex justify-end p-4">
        {user ? (
          <div className="flex items-center  text-white space-x-6">
            <Link className='cursor-pointer flex items-center justify-center bg-slate-700 hover:bg-slate-800 hover:scale-110 transition-all px-4 py-2 rounded' to='/login'>
              <User size={24} />
              <span className='font-bold text-xl'>{user.username}</span>
            </Link>
            <LogOut className="cursor-pointer hover:scale-120 transition-transform" onClick={handleLogout} size={24}  />
          </div>
        ) : (
          <div className="flex space-x-5">
            <Link to="/register">
              <button className="bg-slate-700 text-white hover:scale-110 hover:bg-slate-800 transition-all px-4 py-2 rounded">Cadastro</button>
            </Link>
            <Link to="/login">
              <button className="bg-slate-700 text-white hover:scale-110 hover:bg-slate-800 transition-all px-4 py-2 rounded">Login</button>
            </Link>
          </div>
        )}
      </header>

      <div className="flex flex-col items-center justify-center w-full flex-1">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
          URL Shortener
        </h1>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-white/5 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white/10"
        >
          <div className="flex flex-col space-y-4">
            <button
              type="button"
              onClick={() => setShowCustom(!showCustom)}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
            >
              {showCustom ? '← Usar código aleatório' : 'Quero um slug personalizado'}
            </button>

            {showCustom && (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">/</span>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="meu-slug"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-lg border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 outline-none text-white placeholder-gray-400 transition-all"
                  pattern="[a-zA-Z0-9_\-\(\)]+"
                  title="Apenas letras, números, hífens e underscores"
                />
              </div>
            )}

            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="Insira a URL"
                className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-lg border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 outline-none text-white placeholder-gray-400 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center gap-2 w-full py-4 font-medium rounded-lg transition-all ${loading
                ? 'bg-blue-400/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-semibold text-lg'
                }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Encurtando...
                </div>
              ) : (
                <>
                  <LinkIcon size={18} />
                  Encurtar URL
                </>
              )}
            </button>
          </div>

          {shortUrl && (
            <div className="mt-6 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <a
                    href={shortUrl}
                    className="text-blue-400 hover:text-blue-300 truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortUrl}
                  </a>
                  <button
                  type='button'
                    onClick={copyToClipboard}
                    className="text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <Link
                  to={`/analytics/${code}`}
                  className="text-gray-400 hover:text-gray-300 text-sm whitespace-nowrap"
                >
                  (Ver estatísticas)
                </Link>
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
    </div>
  );
}

export default Home;
