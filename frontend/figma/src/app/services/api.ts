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

async function handleJsonResponse<T>(res: Response, errorMsg: string): Promise<T> {
  const contentType = res.headers.get('content-type');
  
  if (!res.ok) {
    let error = errorMsg;
    
    // Se for erro de servidor, tenta extrair mensagem do HTML/JSON
    if (contentType?.includes('application/json')) {
      try {
        const errData = await res.json();
        error = errData.erro || errData.message || error;
      } catch {
        // fallback para mensagem padrão
      }
    } else if (contentType?.includes('text/html')) {
      // Erro HTML - extrai mensagem se possível
      console.warn(`Backend retornou HTML (erro ${res.status}). Verifique se o servidor está rodando.`);
      error = `Erro do servidor (${res.status}). Backend pode não estar respondendo corretamente.`;
    }
    
    throw new Error(error);
  }

  if (!contentType?.includes('application/json')) {
    const text = await res.text();
    console.error('Resposta não-JSON:', text.substring(0, 100));
    throw new Error('Resposta do servidor não é JSON válido');
  }

  return res.json();
}

export async function fetchAllEvents(): Promise<Event[]> {
  try {
    const res = await fetch('/api/events/all');
    const data = await handleJsonResponse<ApiEvent[]>(res, 'Falha ao buscar eventos');
    return data.map(mapEvent);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    throw error;
  }
}

export async function fetchEventById(id: string): Promise<Event> {
  try {
    const res = await fetch(`/api/events/${id}`);
    const data = await handleJsonResponse<ApiEvent>(res, 'Evento não encontrado');
    return mapEvent(data);
  } catch (error) {
    console.error(`Erro ao buscar evento ${id}:`, error);
    throw error;
  }
}

export async function createEvent(eventData: Partial<ApiEvent>): Promise<ApiEvent> {
  try {
    const token = localStorage.getItem('conectarena_token');
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(eventData),
    });
    
    if (res.status === 401 || res.status === 403) {
      throw new Error('A publicação de eventos exige login. Por favor, faça login e tente novamente.');
    }

    return await handleJsonResponse<ApiEvent>(res, 'Falha ao criar evento');
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    throw error;
  }
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
  try {
    const res = await authFetch('/api/purchases', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    
    if (res.status === 401 || res.status === 403) {
      throw new Error('Não autorizado. É necessário fazer login para concluir a compra.');
    }
    
    return await handleJsonResponse<PurchaseResponse>(res, 'Falha ao processar compra');
  } catch (error) {
    console.error('Erro ao criar compra:', error);
    throw error;
  }
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
  try {
    const res = await authFetch('/api/purchases/analytics');
    const json = await handleJsonResponse<any>(res, 'Falha ao buscar analytics');

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
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    throw error;
  }
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
  try {
    const url = userId ? `/api/posts?userId=${userId}` : '/api/posts';
    const res = await authFetch(url);
    return await handleJsonResponse<ApiPost[]>(res, 'Falha ao buscar posts');
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    throw error;
  }
}

export async function createPost(params: {
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  tags?: string[];
}): Promise<ApiPost> {
  try {
    const res = await authFetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return await handleJsonResponse<ApiPost>(res, 'Falha ao publicar post');
  } catch (error) {
    console.error('Erro ao criar post:', error);
    throw error;
  }
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
  try {
    const res = await authFetch(`/api/purchases/user/${userId}`);
    return await handleJsonResponse<TicketPurchase[]>(res, 'Erro ao buscar ingressos');
  } catch (error) {
    console.error('Erro ao buscar compras:', error);
    throw error;
  }
}

export async function togglePostLike(
  postId: number,
  userId: string
): Promise<{ likes: number; likedByMe: boolean }> {
  try {
    const res = await authFetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return await handleJsonResponse<{ likes: number; likedByMe: boolean }>(res, 'Falha ao curtir post');
  } catch (error) {
    console.error('Erro ao curtir post:', error);
    throw error;
  }
}

export async function addPostComment(params: {
  postId: number;
  userId: string;
  authorName: string;
  text: string;
}): Promise<{ comments: number }> {
  try {
    const res = await authFetch(`/api/posts/${params.postId}/comment`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return await handleJsonResponse<{ comments: number }>(res, 'Falha ao enviar comentário');
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    throw error;
  }
}

export async function fetchPostComments(postId: number): Promise<ApiComment[]> {
  try {
    const res = await authFetch(`/api/posts/${postId}/comments`);
    return await handleJsonResponse<ApiComment[]>(res, 'Falha ao buscar comentários');
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    throw error;
  }
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
