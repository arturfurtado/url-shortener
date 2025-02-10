import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './Authentication'; 
import { Link } from 'react-router-dom';
import { Copy } from 'lucide-react'; 

function Dashboard() {
  const { user, logout } = useAuth();
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    axios.get('/api/user/urls')
      .then(res => setUrls(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Bem-vindo, {user?.username}</h1>
        <button 
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Sair
        </button>
      </div>

      <div className="grid gap-4">
        {urls.map(url => (
          <div key={url.code} className="bg-white/5 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <a 
                  href={url.shortUrl} 
                  className="text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {url.shortUrl}
                </a>
                <p className="text-gray-400 text-sm mt-1">
                  Original: <span className="truncate">{url.originalUrl}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/analytics/${url.code}`}
                  className="text-gray-400 hover:text-gray-300"
                >
                  Estatísticas
                </Link>
                <button
                  onClick={() => navigator.clipboard.writeText(url.shortUrl)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
