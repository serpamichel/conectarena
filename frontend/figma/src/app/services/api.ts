import type { Event, EventCategory } from '../data/mockData';

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('conectarena_token');
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if ((response.status === 401 || response.status === 403) && token) {
    localStorage.removeItem('conectarena_token');
    localStorage.removeItem('conectarena_user');
  }

  return response;
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
    if (res.status === 401 || res.status === 403) {
      throw new Error('A publicação de eventos exige login. Por favor, faça login e tente novamente.');
    }

    let errorMsg = 'Falha ao criar evento';
    if (res.status === 409 || res.status === 400) {
      const errorData = await res.json().catch(() => ({}));
      errorMsg = errorData.erro || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

const CREATED_EVENTS_KEY_PREFIX = 'conectarena_created_events_';

type CreatedEventsMap = Record<string, Event>;

function parseCreatedEvents(raw: string | null): CreatedEventsMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return {};
    }
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as CreatedEventsMap;
    }
  } catch {
    return {};
  }
  return {};
}

export function getCreatedEventIdsForUser(userId: string): string[] {
  const raw = localStorage.getItem(`${CREATED_EVENTS_KEY_PREFIX}${userId}`);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.keys(parsed);
    }
  } catch {
    return [];
  }
  return [];
}

export function getCreatedEventsForUser(userId: string): CreatedEventsMap {
  const raw = localStorage.getItem(`${CREATED_EVENTS_KEY_PREFIX}${userId}`);
  return parseCreatedEvents(raw);
}

export function saveCreatedEventForUser(userId: string, event: Event): void {
  try {
    const existing = getCreatedEventsForUser(userId);
    existing[event.id] = event;
    localStorage.setItem(`${CREATED_EVENTS_KEY_PREFIX}${userId}`, JSON.stringify(existing));
  } catch {
    // ignore localStorage failure
  }
}

export function deleteCreatedEventForUser(userId: string, eventId: string): void {
  try {
    const raw = localStorage.getItem(`${CREATED_EVENTS_KEY_PREFIX}${userId}`);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const updated = parsed.filter((id) => String(id) !== eventId);
      localStorage.setItem(`${CREATED_EVENTS_KEY_PREFIX}${userId}`, JSON.stringify(updated));
      return;
    }
    if (typeof parsed === 'object' && parsed !== null) {
      delete parsed[eventId];
      localStorage.setItem(`${CREATED_EVENTS_KEY_PREFIX}${userId}`, JSON.stringify(parsed));
    }
  } catch {
    // ignore localStorage failure
  }
}

export function saveCreatedEventIdForUser(userId: string, eventId: string): void {
  try {
    const existing = getCreatedEventsForUser(userId);
    if (Object.keys(existing).length > 0) {
      existing[eventId] = existing[eventId] ?? {
        id: eventId,
        title: '',
        category: 'outros',
        date: '',
        time: '',
        image: '',
        price: 0,
        availableTickets: 0,
        totalTickets: 0,
        description: '',
        featured: false,
      };
      localStorage.setItem(`${CREATED_EVENTS_KEY_PREFIX}${userId}`, JSON.stringify(existing));
      return;
    }

    const ids = getCreatedEventIdsForUser(userId);
    const updated = Array.from(new Set([...ids, eventId]));
    localStorage.setItem(`${CREATED_EVENTS_KEY_PREFIX}${userId}`, JSON.stringify(updated));
  } catch {
    // ignore localStorage failure
  }
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
  const json = await res.json().catch(() => ({}));

  // Normalizar campos faltantes para evitar erros quando o backend retornar objeto parcial
  const defaultSalesByCategory = [
    { name: 'Futebol', value: 0 },
    { name: 'Música', value: 0 },
    { name: 'Teatro', value: 0 },
    { name: 'Outros', value: 0 },
  ];

  const defaultSalesByDay = [
    { day: 'Seg', vendas: 0 },
    { day: 'Ter', vendas: 0 },
    { day: 'Qua', vendas: 0 },
    { day: 'Qui', vendas: 0 },
    { day: 'Sex', vendas: 0 },
    { day: 'Sáb', vendas: 0 },
    { day: 'Dom', vendas: 0 },
  ];

  return {
    eventMetrics: json.eventMetrics ?? [],
    totalRevenue: Number(json.totalRevenue ?? 0),
    ticketsSold: Number(json.ticketsSold ?? 0),
    totalEvents: Number(json.totalEvents ?? 0),
    ticketMedio: Number(json.ticketMedio ?? 0),
    salesByCategory: json.salesByCategory ?? defaultSalesByCategory,
    topEvents: json.topEvents ?? [],
    salesByDay: json.salesByDay ?? defaultSalesByDay,
    salesByMonth: json.salesByMonth ?? [],
  };
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

export interface ApiComment {
  id: number;
  postId: number;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
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

export async function fetchPostComments(postId: number): Promise<ApiComment[]> {
  const res = await authFetch(`/api/posts/${postId}/comments`);
  if (!res.ok) throw new Error('Falha ao buscar comentários');
  return res.json();
}

const LOCAL_POST_OVERRIDES_PREFIX = 'conectarena_post_overrides_';
const LOCAL_POST_DELETIONS_PREFIX = 'conectarena_post_deletions_';

export type PostOverride = {
  content?: string;
  editedAt?: string;
};

export function getEditedPostsForUser(userId: string): Record<string, PostOverride> {
  try {
    const raw = localStorage.getItem(`${LOCAL_POST_OVERRIDES_PREFIX}${userId}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) return parsed;
  } catch {
    // ignore
  }
  return {};
}

export function saveEditedPostForUser(userId: string, postId: string, override: PostOverride): void {
  try {
    const existing = getEditedPostsForUser(userId);
    existing[postId] = { ...(existing[postId] ?? {}), ...override, editedAt: new Date().toISOString() };
    localStorage.setItem(`${LOCAL_POST_OVERRIDES_PREFIX}${userId}`, JSON.stringify(existing));
  } catch {
    // ignore
  }
}

export function getDeletedPostIdsForUser(userId: string): string[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_POST_DELETIONS_PREFIX}${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // ignore
  }
  return [];
}

export function markPostDeletedForUser(userId: string, postId: string): void {
  try {
    const ids = new Set(getDeletedPostIdsForUser(userId));
    ids.add(postId);
    localStorage.setItem(`${LOCAL_POST_DELETIONS_PREFIX}${userId}`, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore
  }
}
