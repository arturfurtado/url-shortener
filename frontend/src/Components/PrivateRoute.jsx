import { useAuth } from './Authentication';     
import { Navigate } from 'react-router-dom';

export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  return user ? children : <Navigate to="/login" />;
}
