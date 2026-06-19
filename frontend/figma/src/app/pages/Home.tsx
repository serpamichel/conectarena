
import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Search, Calendar, MapPin, TrendingUp, Music, Theater, Trophy, Grid3x3, ChevronRight, ChevronLeft, Mic, Heart, Users, Plus, Edit, Trash } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { type Event, type EventCategory } from '../data/mockData';
import { fetchAllEvents, getCreatedEventsForUser, deleteCreatedEventForUser } from '../services/api';
import { isFeaturedActive } from '../utils/featured';
import { warnIfOffline } from '../utils/offline';
import { useAuth } from '../contexts/AuthContext';
export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'server' | null>(null);
  const categoryParam = searchParams.get('categoria') as EventCategory | 'cadastrados' | null;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createdEvents, setCreatedEvents] = useState<Record<string, Event>>({});

  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const loadEvents = () => {
    setLoading(true);
    setError(null);
    setErrorType(null);

    fetchAllEvents()
      .then((evts) => {
        setEvents(evts);
      })
      .catch((err: unknown) => {
        // Quando a fetch falha por falta de conexão ela rejeita com TypeError
        if (!navigator.onLine || (err instanceof TypeError)) {
          setErrorType('network');
          setError('Não há conexão com a internet. Verifique sua rede e tente novamente.');
        } else {
          setErrorType('server');
          setError('Não foi possível carregar os eventos. O servidor está rodando?');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (user) {
      setCreatedEvents(getCreatedEventsForUser(user.id));
    } else {
      setCreatedEvents({});
    }
  }, [user]);

  const handleDeleteCreatedEvent = (eventId: string) => {
    if (!user) return;
    deleteCreatedEventForUser(user.id, eventId);
    setCreatedEvents((prev) => {
      const next = { ...prev };
      delete next[eventId];
      return next;
    });
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const mergedEvents = useMemo(() => {
    const eventMap = new Map(events.map((event) => [event.id, event]));
    Object.values(createdEvents).forEach((createdEvent) => {
      eventMap.set(createdEvent.id, {
        ...eventMap.get(createdEvent.id),
        ...createdEvent,
      });
    });
    return Array.from(eventMap.values());
  }, [events, createdEvents]);

  const filteredEvents = useMemo(() => {
    let filtered = mergedEvents;

    if (categoryParam === 'cadastrados') {
      filtered = filtered.filter(event => Boolean(createdEvents[event.id]));
    } else if (categoryParam) {
      filtered = filtered.filter(event => event.category === categoryParam);
    }

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [mergedEvents, categoryParam, searchQuery, createdEvents]);

  const featuredEvents = useMemo(
    () => mergedEvents.filter((event) => isFeaturedActive(event, new Date(now))),
    [mergedEvents, now]
  );

  const rankedEvents = useMemo(() => {
    const organicOrder = new Map(mergedEvents.map((event, index) => [event.id, index]));

    return [...filteredEvents].sort((a, b) => {
      const currentDate = new Date(now);
      const aFeatured = isFeaturedActive(a, currentDate);
      const bFeatured = isFeaturedActive(b, currentDate);

      if (aFeatured !== bFeatured) {
        return aFeatured ? -1 : 1;
      }

      return (organicOrder.get(a.id) ?? 0) - (organicOrder.get(b.id) ?? 0);
    });
  }, [mergedEvents, filteredEvents, now]);

  const handleCategoryChange = (category: string) => {
    if (warnIfOffline('filtrar eventos')) return;

    if (category === 'todos') {
      setSearchParams({});
    } else {
      setSearchParams({ categoria: category });
    }
  };

  const getCategoryBadgeColor = (category: EventCategory) => {
    const colors = {
      futebol: 'bg-green-100 text-green-800',
      musica: 'bg-purple-100 text-purple-800',
      teatro: 'bg-amber-100 text-amber-800',
      outros: 'bg-slate-100 text-slate-800',
    };
    return colors[category] || colors.outros;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      todos: Grid3x3,
      cadastrados: Users,
      futebol: Trophy,
      musica: Music,
      teatro: Theater,
      palestras: Mic,
      religiosos: Heart,
      outros: Calendar,
    };
    return icons[category as keyof typeof icons] || Calendar;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getExpirationLabel = (featuredUntil?: string) => {
    if (!featuredUntil) return 'Expiração em 07 dias';

    const expiresAt = new Date(featuredUntil);
    if (Number.isNaN(expiresAt.getTime())) return 'Expiração inválida';

    const remainingMs = expiresAt.getTime() - now;
    if (remainingMs <= 0) return 'Expira em menos de 1 hora';

    const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    if (days > 0) {
      const dayLabel = days === 1 ? 'dia' : 'dias';
      const hourLabel = hours === 1 ? 'hora' : 'horas';
      return `Expira em ${days} ${dayLabel} e ${hours} ${hourLabel}`;
    }

    const hourLabel = totalHours === 1 ? 'hora' : 'horas';
    return `Expira em ${totalHours} ${hourLabel}`;
  };

  const categories = [
    { id: 'todos', label: 'Todos', color: 'from-[#305BF2] to-[#2347c9]' },
    { id: 'cadastrados', label: 'Meus Eventos', color: 'from-emerald-500 to-emerald-600' },
    { id: 'futebol', label: 'Futebol', color: 'from-blue-500 to-blue-600' },
    { id: 'musica', label: 'Música', color: 'from-purple-500 to-purple-600' },
    { id: 'teatro', label: 'Teatro', color: 'from-amber-500 to-amber-600' },
    { id: 'palestras', label: 'Palestras', color: 'from-rose-500 to-rose-600' },
    { id: 'religiosos', label: 'Religiosos', color: 'from-emerald-500 to-emerald-600' },
    { id: 'outros', label: 'Outros', color: 'from-slate-500 to-slate-600' },
  ];

  return (
    <div className="bg-slate-50">
      {/* Search Section */}
      <section className="bg-white px-4 py-4 border-b">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar eventos, shows, jogos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base bg-slate-50 border-slate-200"
          />
        </div>
        <div className="flex justify-end">
          <Link to="/admin/criar-evento" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Publicar Evento
          </Link>
        </div>
      </section>

      {/* Categories - Horizontal Scroll */}
      <section className="bg-white border-b">
        <div className="px-4 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.id);
              const isActive = (categoryParam || 'todos') === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`
                    flex-shrink-0 flex flex-col items-center justify-center gap-2 p-3 rounded-2xl min-w-[80px] transition-all
                    ${isActive
                      ? `bg-gradient-to-br ${category.color} text-white shadow-lg scale-105`
                      : 'bg-slate-100 text-slate-600 active:bg-slate-200'
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-semibold whitespace-nowrap">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Error Banner / Network Empty State */}
      {error && errorType === 'server' && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && error && errorType === 'network' && (
        <section className="px-4 py-12 text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold mb-2">Erro de conexão</h3>
          <p className="text-slate-500 mb-4">Não foi possível conectar à internet. Verifique sua conexão e tente novamente.</p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => loadEvents()} variant="default">Recarregar</Button>
          </div>
        </section>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <section className="px-4 py-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </section>
      )}

      {/* Featured Events */}
      {!loading && !categoryParam && !searchQuery && featuredEvents.length > 0 && (
        <section className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold">Em Destaque</h2>
              <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                Destaque
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={scrollLeft}
                className="p-1.5 rounded-full hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
                aria-label="Voltar para o início"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={scrollRight}
                className="p-1.5 rounded-full hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
                aria-label="Avançar carrossel"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 scroll-smooth">
            {featuredEvents.map((event) => (
              <Link
                key={event.id}
                to={`/evento/${event.id}`}
                className="flex-shrink-0 w-[280px]"
              >
                <Card className="overflow-hidden shadow-md active:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-[180px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <Badge className={`absolute top-3 right-3 ${getCategoryBadgeColor(event.category)}`}>
                      {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </Badge>
                    <Badge className="absolute top-3 left-3 bg-amber-100 text-amber-900 border border-amber-300 text-xs">
                      {getExpirationLabel(event.featuredUntil)}
                    </Badge>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg line-clamp-1 mb-1">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 text-white/90 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">A partir de</p>
                        <p className="text-2xl font-bold text-blue-600">
                          R$ {event.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Disponível</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {event.availableTickets.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Events */}
      {!loading && (
        <section className="px-4 py-6">
          <h2 className="text-xl font-bold mb-4">
            {categoryParam === 'cadastrados'
              ? 'Meus Eventos'
              : categoryParam
                ? `Eventos de ${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)}`
                : searchQuery
                  ? 'Resultados da busca'
                  : 'Todos os Eventos'
            }
          </h2>

          {rankedEvents.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              {searchQuery ? (
                <>
                  <h3 className="text-lg font-bold mb-2">Nenhum evento encontrado para esta busca</h3>
                  <p className="text-slate-500 mb-4">Tente verificar a ortografia, usar termos mais gerais ou remover filtros. Você também pode ver os eventos em destaque abaixo.</p>
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" onClick={() => { setSearchQuery(''); setSearchParams({}); }}>Ver destaques</Button>
                    <Button variant="ghost" onClick={() => setSearchQuery('')}>Limpar busca</Button>
                  </div>
                </>
              ) : categoryParam === 'cadastrados' ? (
                user ? (
                  <p className="text-slate-500 text-base">Você ainda não cadastrou eventos.</p>
                ) : (
                  <p className="text-slate-500 text-base">Faça login para ver seus eventos cadastrados.</p>
                )
              ) : categoryParam ? (
                <p className="text-slate-500 text-base">Nenhum evento encontrado para esta categoria</p>
              ) : (
                <p className="text-slate-500 text-base">Nenhum evento encontrado</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {rankedEvents.map((event) => {
                const isCreated = Boolean(createdEvents[event.id]);
                return (
                  <Card key={event.id} className="overflow-hidden active:bg-slate-50 transition-colors">
                    <div className="flex flex-col gap-4 p-3 lg:flex-row lg:items-center lg:justify-between">
                      <Link to={`/evento/${event.id}`} className="flex-1 min-w-0 flex gap-4 items-center">
                        <div className="relative flex-shrink-0">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <Badge className={`absolute -top-1 -right-1 text-xs px-2 ${getCategoryBadgeColor(event.category)}`}>
                            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base mb-1 line-clamp-2">{event.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{formatDate(event.date)} • {event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">Estádio Arena</span>
                          </div>
                        </div>
                      </Link>

                      <div className="flex flex-col gap-3 lg:items-end">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-xs text-slate-500">A partir de</p>
                            <p className="text-lg font-bold text-blue-600">
                              R$ {event.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                            Comprar
                          </div>
                        </div>
                        {isCreated && (
                          <div className="flex flex-wrap gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 text-xs border-slate-200 text-slate-700"
                              onClick={() => navigate(`/evento/${event.id}`)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-9 text-xs"
                              onClick={() => handleDeleteCreatedEvent(event.id)}
                            >
                              <Trash className="w-4 h-4 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      )}
      <div className="fixed bottom-6 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 px-4">
        <Link
          to="/admin/criar-evento"
          className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-blue-600 text-white py-3 text-sm font-semibold shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Criar Evento
        </Link>
      </div>
    </div>
  );
}
