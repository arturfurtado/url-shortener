import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      await axios.post('http://localhost:3001/register', { username, password });
      setMessage('Registro realizado com sucesso! Faça login.');
      setError('');
    } catch (err) {
      setError('Falha no registro');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-4">
      <form
        onSubmit={handleRegister}
        className="bg-gray-800 p-12 border border-gray-700 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-4xl font-bold text-white mb-6 text-center">Registro</h2>

        {message && <p className="text-green-400 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Escolha um usuário"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4 relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Escolha uma senha"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="mb-6 relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme a senha"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-500 to-violet-400 rounded text-white font-bold text-xl transition-transform transform hover:scale-105"
        >
          Registrar
        </button>
      </form>
    </div>
  );
}

export default Register;
