import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    const apiBaseUrl = 'http://localhost:8080';

    fetch(`${apiBaseUrl}/api/status`)
      .then((response) => response.json())
      .then((data) => {
        console.info('Backend conectado:', data);
      })
      .catch(() => {
        console.warn('Backend indisponivel em /api/status');
      });
  }, []);

  return (
    <main>
      <h1>Figma App</h1>
    </main>
  );
}
