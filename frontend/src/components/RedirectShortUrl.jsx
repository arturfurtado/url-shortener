import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const RedirectShortUrl = () => {
  const { code } = useParams();

  useEffect(() => {
    axios.get(`http://localhost:3001/${code}`)
      .then((res) => {
        window.location.href = res.data.originalUrl;
      })
      .catch((err) => {
        console.error('Erro ao redirecionar:', err);
      });
  }, [code]);

  return <div className="text-white p-4">Redirecionando...</div>;
};

export default RedirectShortUrl;
