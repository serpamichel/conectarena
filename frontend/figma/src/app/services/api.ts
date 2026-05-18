import type { Event, EventCategory } from '../data/mockData';

function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('conectarena_token');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
}

interface ApiEvent {
  id: number;
  nome: string;
  descricao: string;
  data: string;
  local: string;
  categoria: EventCategory;
  horario: string;
  imagemUrl: string;
  preco: number;
  ingressosDisponiveis: number;
  totalIngressos: number;
  destaque: boolean;
  destaqueExpiraEm?: string | null;
}

function mapEvent(e: ApiEvent): Event {
  return {
    id: String(e.id),
    title: e.nome,
    category: e.categoria ?? 'outros',
    date: e.data ? e.data.substring(0, 10) : '',
    time: e.horario ?? '',
    image: e.imagemUrl ?? '',
    price: e.preco ?? 0,
    availableTickets: e.ingressosDisponiveis ?? 0,
    totalTickets: e.totalIngressos ?? 0,
    description: e.descricao ?? '',
    featured: e.destaque ?? false,
    featuredUntil: e.destaqueExpiraEm ?? undefined,
  };
}

export async function fetchAllEvents(): Promise<Event[]> {
  const res = await fetch('/api/events/all');
  if (!res.ok) throw new Error('Falha ao buscar eventos');
  const data: ApiEvent[] = await res.json();
  return data.map(mapEvent);
}

export async function fetchEventById(id: string): Promise<Event> {
  const res = await fetch(`/api/events/${id}`);
  if (!res.ok) throw new Error('Evento não encontrado');
  const data: ApiEvent = await res.json();
  return mapEvent(data);
}

export async function createEvent(eventData: Partial<ApiEvent>): Promise<ApiEvent> {
  const token = localStorage.getItem('conectarena_token');
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(eventData),
  });
  
  if (!res.ok) {
    let errorMsg = 'Falha ao criar evento';
    if (res.status === 409 || res.status === 400) {
      const errorData = await res.json().catch(() => ({}));
      errorMsg = errorData.erro || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export interface PurchaseResponse {
  id: number;
  codigoIngresso: string;
  totalPago: number;
  dataCompra: string;
}

export async function createPurchase(params: {
  eventoId: number;
  userId: string;
  userName: string;
  quantidade: number;
  metodoPagamento: string;
}): Promise<PurchaseResponse> {
  const res = await authFetch('/api/purchases', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error('Não autorizado. É necessário fazer login para concluir a compra.');
    }
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { erro?: string }).erro ?? `Falha ao processar compra (status ${res.status})`);
  }
  return res.json();
}

export interface AnalyticsData {
  eventMetrics: {
    id: number;
    name: string;
    date: string;
    ticketsSold: number;
    totalCapacity: number;
    occupancyRate: number;
    views: number;
    interest: string;
  }[];
  totalRevenue: number;
  ticketsSold: number;
  totalEvents: number;
  ticketMedio: number;
  salesByCategory: { name: string; value: number }[];
  topEvents: { name: string; tickets: number; revenue: number }[];
  salesByDay: { day: string; vendas: number }[];
  salesByMonth: { month: string; vendas: number }[];
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await authFetch('/api/purchases/analytics');
  if (!res.ok) throw new Error('Falha ao buscar analytics');
  return res.json();
}

export interface ApiPost {
  id: number;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorVerified: boolean;
  content: string;
  imageUrl: string | null;
  likes: number;
  comments: number;
  createdAt: string;
  tags: string[];
  likedByMe: boolean;
}

export async function fetchPosts(userId?: string): Promise<ApiPost[]> {
  const url = userId ? `/api/posts?userId=${userId}` : '/api/posts';
  const res = await authFetch(url);
  if (!res.ok) throw new Error('Falha ao buscar posts');
  return res.json();
}

export async function createPost(params: {
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  tags?: string[];
}): Promise<ApiPost> {
  const res = await authFetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Falha ao publicar post');
  return res.json();
}

export interface TicketPurchase {
  id: number;
  codigoIngresso: string;
  quantidade: number;
  totalPago: number;
  metodoPagamento: string;
  dataCompra: string;
  evento: {
    id: number;
    nome: string;
    data: string;
    horario: string;
    local: string;
    categoria: string;
    imagemUrl: string;
  };
}

export async function fetchMyPurchases(userId: string): Promise<TicketPurchase[]> {
  const res = await authFetch(`/api/purchases/user/${userId}`);
  if (!res.ok) throw new Error('Erro ao buscar ingressos');
  return res.json();
}

export async function togglePostLike(
  postId: number,
  userId: string
): Promise<{ likes: number; likedByMe: boolean }> {
  const res = await authFetch(`/api/posts/${postId}/like`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Falha ao curtir post');
  return res.json();
}

export async function addPostComment(params: {
  postId: number;
  userId: string;
  authorName: string;
  text: string;
}): Promise<{ comments: number }> {
  const res = await authFetch(`/api/posts/${params.postId}/comment`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Falha ao enviar comentário');
  return res.json();
}
