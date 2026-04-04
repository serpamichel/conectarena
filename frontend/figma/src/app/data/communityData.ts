export interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
  tags?: string[];
}

export const communityPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'Maria Silva',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      verified: true,
    },
    content: 'Quem vai no jogo de domingo? Estamos organizando uma caravana saindo do centro às 14h! 🚌⚽',
    likes: 124,
    comments: 18,
    timestamp: '2h atrás',
    tags: ['futebol', 'caravana'],
  },
  {
    id: '2',
    author: {
      name: 'João Santos',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao',
      verified: false,
    },
    content: 'O show de ontem foi INCRÍVEL! Melhor experiência da minha vida no estádio 🎸🔥',
    image: 'https://images.unsplash.com/photo-1689793354800-de168c0a4c9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBsaWdodHN8ZW58MXx8fHwxNzczNDQ5NjcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    likes: 287,
    comments: 42,
    timestamp: '5h atrás',
    tags: ['música', 'show'],
  },
  {
    id: '3',
    author: {
      name: 'Ana Costa',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      verified: true,
    },
    content: 'Alguém tem ingressos extras para o clássico do mês que vem? Preciso de 2! 🙏',
    likes: 45,
    comments: 12,
    timestamp: '1d atrás',
    tags: ['futebol', 'ingressos'],
  },
  {
    id: '4',
    author: {
      name: 'Pedro Oliveira',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
      verified: false,
    },
    content: 'Fizemos o tour VIP hoje e foi sensacional! Vale muito a pena conhecer os bastidores 🏟️',
    image: 'https://images.unsplash.com/photo-1766085560633-896ad449d249?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFkaXVtJTIwdG91ciUyMGVtcHR5JTIwc2VhdHN8ZW58MXx8fHwxNzczNTMwMTE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    likes: 156,
    comments: 23,
    timestamp: '2d atrás',
    tags: ['tour', 'visita'],
  },
  {
    id: '5',
    author: {
      name: 'Carla Mendes',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carla',
      verified: true,
    },
    content: 'Grupo de WhatsApp para quem vai nos próximos eventos! Deixa o contato nos comentários 📱',
    likes: 92,
    comments: 67,
    timestamp: '3d atrás',
    tags: ['comunidade'],
  },
  {
    id: '6',
    author: {
      name: 'Lucas Ferreira',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
      verified: false,
    },
    content: 'Primeira vez no estádio e já virei fã! Atmosfera incrível durante o jogo 🔴⚪',
    image: 'https://images.unsplash.com/photo-1770129768815-29a98e02d4f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBldmVudCUyMGNyb3dkfGVufDF8fHx8MTc3MzUzMDExOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    likes: 203,
    comments: 31,
    timestamp: '4d atrás',
    tags: ['futebol', 'primeira-vez'],
  },
];

export interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  image: string;
  category: string;
}

export const communityGroups: Group[] = [
  {
    id: 'g1',
    name: 'Torcida Organizada',
    description: 'Grupo oficial da torcida do estádio',
    members: 1247,
    image: 'https://images.unsplash.com/photo-1770129768815-29a98e02d4f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBldmVudCUyMGNyb3dkfGVufDF8fHx8MTc3MzUzMDExOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'futebol',
  },
  {
    id: 'g2',
    name: 'Amantes de Shows',
    description: 'Para quem ama eventos musicais',
    members: 892,
    image: 'https://images.unsplash.com/photo-1689793354800-de168c0a4c9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBsaWdodHN8ZW58MXx8fHwxNzczNDQ5NjcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'música',
  },
  {
    id: 'g3',
    name: 'Exploradores do Estádio',
    description: 'Compartilhe sua experiência nas visitas',
    members: 456,
    image: 'https://images.unsplash.com/photo-1766085560633-896ad449d249?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFkaXVtJTIwdG91ciUyMGVtcHR5JTIwc2VhdHN8ZW58MXx8fHwxNzczNTMwMTE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'tour',
  },
  {
    id: 'g4',
    name: 'Eventos Culturais',
    description: 'Teatro, arte e cultura no estádio',
    members: 324,
    image: 'https://images.unsplash.com/photo-1609039504401-47ac3940f378?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwcGVyZm9ybWFuY2UlMjBzdGFnZXxlbnwxfHx8fDE3NzM1MTU1MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'teatro',
  },
];
