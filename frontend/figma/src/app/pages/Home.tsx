import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search, Calendar, MapPin, TrendingUp, Music, Theater, Trophy, Grid3x3, ChevronRight } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { type Event, type EventCategory } from '../data/mockData';
import { fetchAllEvents } from '../services/api';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const categoryParam = searchParams.get('categoria') as EventCategory | null;

  useEffect(() => {
    fetchAllEvents()
      .then(setEvents)
      .catch(() => setError('Não foi possível carregar os eventos. O servidor está rodando?'))
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (categoryParam) {
      filtered = filtered.filter(event => event.category === categoryParam);
    }

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [events, categoryParam, searchQuery]);

  const featuredEvents = useMemo(() => events.filter(event => event.featured), [events]);

  const handleCategoryChange = (category: string) => {
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
      futebol: Trophy,
      musica: Music,
      teatro: Theater,
      outros: Calendar,
    };
    return icons[category as keyof typeof icons] || Calendar;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const categories = [
    { id: 'todos', label: 'Todos', color: 'from-[#305BF2] to-[#2347c9]' },
    { id: 'futebol', label: 'Futebol', color: 'from-blue-500 to-blue-600' },
    { id: 'musica', label: 'Música', color: 'from-purple-500 to-purple-600' },
    { id: 'teatro', label: 'Teatro', color: 'from-amber-500 to-amber-600' },
    { id: 'outros', label: 'Outros', color: 'from-slate-500 to-slate-600' },
  ];

  return (
    <div className="bg-slate-50">
      {/* Search Section */}
      <section className="bg-white px-4 py-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar eventos, shows, jogos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base bg-slate-50 border-slate-200"
          />
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

      {/* Error Banner */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
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
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
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
            {categoryParam
              ? `Eventos de ${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)}`
              : searchQuery
                ? 'Resultados da busca'
                : 'Todos os Eventos'
            }
          </h2>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-500 text-base">
                Nenhum evento encontrado
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <Link key={event.id} to={`/evento/${event.id}`}>
                  <Card className="overflow-hidden active:bg-slate-50 transition-colors">
                    <div className="flex gap-4 p-3">
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
                        <div className="flex items-center justify-between mt-2">
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
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
