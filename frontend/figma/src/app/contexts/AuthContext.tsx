import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, aceitouLgpd: boolean) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  try {
    const payload = token.split('.')[1];
    if (!payload) return true;

    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const exp = typeof decoded.exp === 'number' ? decoded.exp * 1000 : undefined;
    return exp === undefined || Date.now() > exp;
  } catch {
    return true;
  }
}

function clearAuthStorage() {
  localStorage.removeItem('conectarena_user');
  localStorage.removeItem('conectarena_token');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('conectarena_user');
    const savedToken = localStorage.getItem('conectarena_token');

    if (savedUser && savedToken && !isTokenExpired(savedToken)) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        clearAuthStorage();
      }
    } else {
      clearAuthStorage();
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha: password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error(data.mensagem || 'Conta bloqueada temporariamente. Tente novamente em 15 minutos.');
      }
      const tentativas = data.tentativasRestantes;
      const msg = data.erro || 'Email ou senha inválidos';
      throw new Error(tentativas !== undefined ? `${msg} (${tentativas} tentativa${tentativas === 1 ? '' : 's'} restante${tentativas === 1 ? '' : 's'})` : msg);
    }

    const data = await response.json();
    localStorage.setItem('conectarena_token', data.token);

    const loggedUser: User = {
      id: email,
      name: data.nome,
      email,
      role: data.role || 'USER',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };

    setUser(loggedUser);
    localStorage.setItem('conectarena_user', JSON.stringify(loggedUser));
  };

  const signup = async (name: string, email: string, password: string, aceitouLgpd: boolean) => {
    const response = await fetch('/api/auth/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: name, email, senha: password, aceitouLgpd }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.erro || 'Erro ao realizar cadastro');
    }

    const data = await response.json();
    localStorage.setItem('conectarena_token', data.token);

    const newUser: User = {
      id: email,
      name: data.nome,
      email,
      role: data.role || 'USER',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };

    setUser(newUser);
    localStorage.setItem('conectarena_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    clearAuthStorage();
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
