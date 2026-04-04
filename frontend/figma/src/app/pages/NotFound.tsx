import { Link } from 'react-router';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-3xl font-bold mt-4 mb-2">Página não encontrada</h2>
        <p className="text-slate-600 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link to="/">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Home className="w-4 h-4" />
            Voltar para o Início
          </Button>
        </Link>
      </div>
    </div>
  );
}
