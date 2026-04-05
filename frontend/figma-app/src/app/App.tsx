import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './routes';

export default function App() {
  useEffect(() => {
    fetch('http://localhost:8080/api/events')
      .then((response) => response.json())
      .then((data) => {
        console.info('Backend conectado:', data);
      })
      .catch(() => {
        console.warn('Backend indisponivel em /api/status');
      });
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
