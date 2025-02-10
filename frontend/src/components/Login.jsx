import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState('');
  
  const fetchUrls = async (authToken) => {
    try {
      const urlsRes = await axios.get('http://localhost:3001/urls', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (Array.isArray(urlsRes.data)) {
        setUrls(urlsRes.data);
      } else {
        setUrls([]);
      }
    } catch (err) {
      setError('Falha ao buscar URLs');
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUrls(storedToken);
    }
  }, []);

 const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post('http://localhost:3001/login', { username, password });
    const token = res.data.token;
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('username', username); 

    const urlsRes = await axios.get('http://localhost:3001/urls', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (Array.isArray(urlsRes.data)) {
      setUrls(urlsRes.data);
    } else {
      setUrls([]);
    }
  } catch (err) {
    setError('Falha no login');
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }
};


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-4">
      {!token ? (
        <form
          onSubmit={handleLogin}
          className="flex flex-col space-y-6 bg-gray-800 bg-opacity-90 border border-gray-700 rounded-lg p-12 shadow-xl w-full max-w-md"
        >
          <h2 className="text-4xl font-bold text-center text-white">Entrar</h2>
          {error && <p className="text-red-500 text-center text-lg">{error}</p>}
          <div className="space-y-4">
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nome de usuário"
            />
            <input
              type="password"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-500 to-violet-400 rounded text-white font-bold text-xl transition-transform transform hover:scale-105"
          >
            <User className="w-6 h-6" /> Login
          </button>
        </form>
      ) : (
        <div className="w-full max-w-4xl p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-semibold text-white">Suas URLs</h2>
            <Link
              to="/"
              className="px-4 py-2 bg-gray-800 bg-opacity-90 border border-gray-700 rounded transition-colors hover:bg-blue-500 text-white"
            >
              Criar URL
            </Link>
          </div>
          {urls.length === 0 ? (
            <p className="text-gray-400 text-lg">Nenhuma URL encontrada</p>
          ) : (
            <ul className="bg-gray-800 overflow-auto bg-opacity-80 backdrop-blur rounded-xl p-6 shadow-xl border border-gray-700">
              {urls.map((url) => (
                <li
                  key={url.id}
                  className="cursor-pointer p-3 mb-3 bg-gray-700 rounded hover:bg-blue-500 transition-colors"
                >
                  <Link
                    to={`/analytics/${url.shortened_url}`}
                    className="flex flex-col sm:flex-row sm:space-x-4"
                  >
                    <span className="text-blue-300 font-medium">
                      {url.shortened_url}
                    </span>
                    <span className="text-white hidden sm:block"> - </span>
                    <span className="text-blue-200 break-all">
                      {url.original_url}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Login;
