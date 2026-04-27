export type EventCategory = 'futebol' | 'musica' | 'teatro' | 'outros';

export interface Event {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  image: string;
  price: number;
  availableTickets: number;
  totalTickets: number;
  description: string;
  featured: boolean;
  featuredUntil?: string;
}

export interface Tour {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  availableSlots: { date: string; time: string; available: boolean }[];
}

export interface AnalyticsData {
  totalRevenue: number;
  ticketsSold: number;
  upcomingEvents: number;
  tourBookings: number;
  totalEvents: number;
  uniqueVisitors: number;
  revenueByCategory: { category: string; revenue: number }[];
  salesByMonth: { month: string; sales: number }[];
  salesByDay: { day: string; vendas: number }[];
  salesByCategory: { name: string; value: number }[];
  topEvents: { name: string; tickets: number; revenue: number }[];
}

export const events: Event[] = [
  {
    id: '1',
    title: 'Final do Campeonato Estadual',
    category: 'futebol',
    date: '2026-04-15',
    time: '16:00',
    image: 'https://images.unsplash.com/photo-1734652246537-104c43a68942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBzdGFkaXVtJTIwZmllbGR8ZW58MXx8fHwxNzczNTMwMTE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 75,
    availableTickets: 12500,
    totalTickets: 45000,
    description: 'A grande final do campeonato estadual. Não perca este confronto épico!',
    featured: true,
  },
  {
    id: '2',
    title: 'Show Rock in Stadium',
    category: 'musica',
    date: '2026-04-20',
    time: '20:00',
    image: 'https://images.unsplash.com/photo-1689793354800-de168c0a4c9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBsaWdodHN8ZW58MXx8fHwxNzczNDQ5NjcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 150,
    availableTickets: 8000,
    totalTickets: 40000,
    description: 'O maior festival de rock do ano com bandas internacionais.',
    featured: true,
  },
  {
    id: '3',
    title: 'Espetáculo Teatral: A Grande Peça',
    category: 'teatro',
    date: '2026-04-25',
    time: '19:00',
    image: 'https://images.unsplash.com/photo-1609039504401-47ac3940f378?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwcGVyZm9ybWFuY2UlMjBzdGFnZXxlbnwxfHx8fDE3NzM1MTU1MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 90,
    availableTickets: 2500,
    totalTickets: 5000,
    description: 'Uma produção teatral única em formato arena no estádio.',
    featured: false,
  },
  {
    id: '4',
    title: 'Clássico Regional',
    category: 'futebol',
    date: '2026-05-05',
    time: '18:00',
    image: 'https://images.unsplash.com/photo-1770129768815-29a98e02d4f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBldmVudCUyMGNyb3dkfGVufDF8fHx8MTc3MzUzMDExOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 60,
    availableTickets: 20000,
    totalTickets: 45000,
    description: 'O maior clássico da região. Ambiente garantido!',
    featured: false,
  },
  {
    id: '5',
    title: 'Festival de Música Eletrônica',
    category: 'musica',
    date: '2026-05-12',
    time: '22:00',
    image: 'https://images.unsplash.com/photo-1689793354800-de168c0a4c9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBsaWdodHN8ZW58MXx8fHwxNzczNDQ5NjcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 120,
    availableTickets: 15000,
    totalTickets: 35000,
    description: 'Uma noite de música eletrônica com os melhores DJs do mundo.',
    featured: true,
  },
];

export const tours: Tour[] = [
  {
    id: 't1',
    title: 'Tour Completo do Estádio',
    description: 'Conheça os bastidores, vestiários, sala de troféus e muito mais!',
    duration: '2 horas',
    price: 45,
    image: 'https://images.unsplash.com/photo-1766085560633-896ad449d249?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFkaXVtJTIwdG91ciUyMGVtcHR5JTIwc2VhdHN8ZW58MXx8fHwxNzczNTMwMTE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    availableSlots: [
      { date: '2026-03-16', time: '10:00', available: true },
      { date: '2026-03-16', time: '14:00', available: true },
      { date: '2026-03-17', time: '10:00', available: false },
      { date: '2026-03-17', time: '14:00', available: true },
      { date: '2026-03-18', time: '10:00', available: true },
      { date: '2026-03-18', time: '14:00', available: true },
    ],
  },
  {
    id: 't2',
    title: 'Tour VIP com Almoço',
    description: 'Experiência exclusiva incluindo almoço no restaurante do estádio.',
    duration: '4 horas',
    price: 120,
    image: 'https://images.unsplash.com/photo-1734652246537-104c43a68942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBzdGFkaXVtJTIwZmllbGR8ZW58MXx8fHwxNzczNTMwMTE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    availableSlots: [
      { date: '2026-03-15', time: '11:00', available: true },
      { date: '2026-03-16', time: '11:00', available: true },
      { date: '2026-03-17', time: '11:00', available: false },
    ],
  },
];

export const analyticsData: AnalyticsData = {
  totalRevenue: 1250000,
  ticketsSold: 18500,
  upcomingEvents: 12,
  tourBookings: 245,
  totalEvents: 5,
  uniqueVisitors: 15000,
  revenueByCategory: [
    { category: 'Futebol', revenue: 550000 },
    { category: 'Música', revenue: 480000 },
    { category: 'Teatro', revenue: 150000 },
    { category: 'Outros', revenue: 70000 },
  ],
  salesByMonth: [
    { month: 'Jan', sales: 120000 },
    { month: 'Fev', sales: 180000 },
    { month: 'Mar', sales: 250000 },
    { month: 'Abr', sales: 220000 },
    { month: 'Mai', sales: 190000 },
    { month: 'Jun', sales: 290000 },
  ],
  salesByDay: [
    { day: 'Seg', vendas: 12000 },
    { day: 'Ter', vendas: 15000 },
    { day: 'Qua', vendas: 18000 },
    { day: 'Qui', vendas: 22000 },
    { day: 'Sex', vendas: 28000 },
    { day: 'Sáb', vendas: 35000 },
    { day: 'Dom', vendas: 31000 },
  ],
  salesByCategory: [
    { name: 'Futebol', value: 550000 },
    { name: 'Música', value: 480000 },
    { name: 'Teatro', value: 150000 },
    { name: 'Outros', value: 70000 },
  ],
  topEvents: [
    { name: 'Final do Campeonato', tickets: 4200, revenue: 315000 },
    { name: 'Rock in Stadium', tickets: 3800, revenue: 570000 },
    { name: 'Festival Eletrônico', tickets: 3200, revenue: 384000 },
    { name: 'Clássico Regional', tickets: 2900, revenue: 174000 },
    { name: 'Show Sertanejo', tickets: 2500, revenue: 187500 },
  ],
};