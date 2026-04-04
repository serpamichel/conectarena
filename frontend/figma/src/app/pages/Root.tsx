import { Outlet, Link, useLocation } from 'react-router';
import { Home, Compass, Users, User, BarChart3 } from 'lucide-react';
import logoImage from '@/assets/65b9ba7a0a782428c87c0147cf8dad9bd71e4a3c.png';

export default function Root() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Mobile Header */}
      <header className="bg-[#394A7D] border-b border-[#2d3b63] sticky top-0 z-50 shadow-lg">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md p-1">
                <img src={logoImage} alt="ConectArena" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-bold text-white">ConectArena</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-120px)]">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              location.pathname === '/' 
                ? 'text-[#305BF2]' 
                : 'text-slate-500 active:bg-slate-100'
            }`}
          >
            <Home className={`w-6 h-6 ${location.pathname === '/' ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">Início</span>
          </Link>
          <Link
            to="/visitas"
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              location.pathname === '/visitas' 
                ? 'text-[#305BF2]' 
                : 'text-slate-500 active:bg-slate-100'
            }`}
          >
            <Compass className={`w-6 h-6 ${location.pathname === '/visitas' ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">Visitas</span>
          </Link>
          <Link
            to="/comunidade"
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              location.pathname === '/comunidade' 
                ? 'text-[#305BF2]' 
                : 'text-slate-500 active:bg-slate-100'
            }`}
          >
            <Users className={`w-6 h-6 ${location.pathname === '/comunidade' ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">Comunidade</span>
          </Link>
          <Link
            to="/analytics"
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              location.pathname === '/analytics' 
                ? 'text-[#305BF2]' 
                : 'text-slate-500 active:bg-slate-100'
            }`}
          >
            <BarChart3 className={`w-6 h-6 ${location.pathname === '/analytics' ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">Analytics</span>
          </Link>
          <Link
            to="/perfil"
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              location.pathname === '/perfil' 
                ? 'text-[#305BF2]' 
                : 'text-slate-500 active:bg-slate-100'
            }`}
          >
            <User className={`w-6 h-6 ${location.pathname === '/perfil' ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}