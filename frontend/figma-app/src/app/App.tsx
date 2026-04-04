import { RouterProvider } from 'react-router';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { router } from './routes.tsx';

export default function App() {
  useEffect(() => {
    fetch('/api/status')
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
