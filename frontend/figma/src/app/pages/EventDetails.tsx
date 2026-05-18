import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Plus, Minus, Share2, Heart, Ticket, Edit, Trash } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { type Event, type EventCategory } from '../data/mockData';
import { fetchEventById, getCreatedEventIdsForUser, getCreatedEventsForUser, saveCreatedEventForUser, deleteCreatedEventForUser } from '../services/api';
import { warnIfOffline } from '../utils/offline';
import { useAuth } from '../contexts/AuthContext';
import { isFeaturedActive } from '../utils/featured';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [isUserCreated, setIsUserCreated] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<Event | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }
    setLoading(true);
    const storedEvent = user ? getCreatedEventsForUser(user.id)[id] : undefined;

    fetchEventById(id)
      .then((fetchedEvent) => {
        setEvent({ ...fetchedEvent, ...(storedEvent ?? {}) });
      })
      .catch(() => {
        if (storedEvent) {
          setEvent(storedEvent);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  useEffect(() => {
    if (!user || !event) {
      setIsUserCreated(false);
      return;
    }
    setIsUserCreated(getCreatedEventIdsForUser(user.id).includes(event.id));
  }, [event, user]);

  useEffect(() => {
    if (!event) return;
    setQuantity((prev) => {
      if (event.availableTickets <= 0) return 0;
      return Math.min(Math.max(1, prev), event.availableTickets);
    });
  }, [event]);

  const getCategoryBadgeColor = (category: EventCategory) => {
    const colors = {
      futebol: 'bg-green-100 text-green-800',
      musica: 'bg-purple-100 text-purple-800',
      teatro: 'bg-amber-100 text-amber-800',
      outros: 'bg-slate-100 text-slate-800',
    };
    return colors[category] || colors.outros;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="h-[300px] bg-slate-200 animate-pulse" />
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-slate-600 mb-4">Evento não encontrado</p>
          <Link to="/">
            <Button>Voltar para Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    if (quantity < 1 || quantity > event.availableTickets) {
      return;
    }
    navigate(`/checkout/${event.id}?quantity=${quantity}`);
  };

  const handleOpenEditDialog = () => {
    if (!event) return;
    setEditFormData(event);
    setShowEditDialog(true);
  };

  const handleSaveCreatedEvent = () => {
    if (!user || !editFormData) return;
    saveCreatedEventForUser(user.id, editFormData);
    setEvent(editFormData);
    setShowEditDialog(false);
  };

  const handleDeleteEvent = () => {
    if (!user || !event) return;
    if (!window.confirm('Tem certeza que deseja excluir este evento? Essa ação não pode ser desfeita.')) return;
    deleteCreatedEventForUser(user.id, event.id);
    navigate('/perfil');
  };

  const availabilityPercentage = (event.availableTickets / event.totalTickets) * 100;
  const featuredActive = isFeaturedActive(event);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Image */}
      <div className="relative">
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <Link to="/">
            <button className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5 text-slate-900" />
            </button>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (warnIfOffline('curtir o evento')) return;
                setLiked(!liked);
              }}
              className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-slate-900'}`} />
            </button>
            <button className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
              <Share2 className="w-5 h-5 text-slate-900" />
            </button>
          </div>
          {isUserCreated && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="h-10 px-3"
                onClick={handleOpenEditDialog}
              >
                <Edit className="w-4 h-4 mr-1" /> Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-10 px-3"
                onClick={handleDeleteEvent}
              >
                <Trash className="w-4 h-4 mr-1" /> Excluir
              </Button>
            </div>
          )}
        </div>

        <img
          src={event.image}
          alt={event.title}
          className="w-full h-[300px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Event Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <Badge className={`mb-2 ${getCategoryBadgeColor(event.category)}`}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </Badge>
          <h1 className="text-white text-2xl font-bold leading-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Event Info Card */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500">Data</p>
                <p className="font-semibold capitalize truncate">{formatDate(event.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Horário</p>
                <p className="font-semibold">{event.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Local</p>
                <p className="font-semibold">Estádio Arena</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-bold text-lg mb-3">Sobre o Evento</h2>
            <p className="text-slate-600 leading-relaxed">{event.description}</p>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg">Disponibilidade</h2>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-slate-700">
                  {event.availableTickets.toLocaleString('pt-BR')} / {event.totalTickets.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  availabilityPercentage > 50
                    ? 'bg-green-500'
                    : availabilityPercentage > 20
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${availabilityPercentage}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {availabilityPercentage > 50
                ? 'Boa disponibilidade'
                : availabilityPercentage > 20
                  ? 'Ingressos limitados'
                  : 'Últimos ingressos!'}
            </p>
          </CardContent>
        </Card>

        {/* Quantity Selector */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-bold text-lg mb-4">Quantidade</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-2">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="h-12 w-12 rounded-xl"
                  disabled={quantity <= 1 || event.availableTickets === 0}
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <input
                  type="number"
                  value={quantity}
                  min={event.availableTickets > 0 ? 1 : 0}
                  max={event.availableTickets}
                  onChange={(e) => {
                    const raw = parseInt(e.target.value, 10);
                    const next = Number.isNaN(raw) ? (event.availableTickets > 0 ? 1 : 0) : raw;
                    setQuantity(Math.min(Math.max(event.availableTickets > 0 ? 1 : 0, next), event.availableTickets));
                  }}
                  className="w-20 text-center text-2xl font-bold bg-transparent outline-none"
                />
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setQuantity((prev) => Math.min(event.availableTickets, prev + 1))}
                  className="h-12 w-12 rounded-xl"
                  disabled={quantity >= event.availableTickets || event.availableTickets === 0}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-3xl font-bold text-blue-600">
                  R$ {(event.price * quantity).toFixed(2)}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {event.availableTickets > 0
                ? `Máximo disponível: ${event.availableTickets} ingresso${event.availableTickets === 1 ? '' : 's'}`
                : 'Esgotado'}
            </p>
          </CardContent>
        </Card>

        {featuredActive && (
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Ticket className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-bold mb-1">Evento em Destaque</h3>
              <p className="text-sm text-slate-600">
                Este é um dos eventos mais procurados!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl p-6">
          <DialogHeader>
            <DialogTitle>Editar evento</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(eventSubmit) => {
              eventSubmit.preventDefault();
              handleSaveCreatedEvent();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-title">Título</Label>
                <Input
                  id="event-title"
                  value={editFormData?.title ?? ''}
                  onChange={(e) => setEditFormData((prev) => prev ? { ...prev, title: e.target.value } : prev)}
                />
              </div>
              <div>
                <Label htmlFor="event-category">Categoria</Label>
                <Input
                  id="event-category"
                  value={editFormData?.category ?? 'outros'}
                  onChange={(e) => setEditFormData((prev) => prev ? { ...prev, category: e.target.value as EventCategory } : prev)}
                />
              </div>
              <div>
                <Label htmlFor="event-date">Data</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={editFormData?.date ?? ''}
                  onChange={(e) => setEditFormData((prev) => prev ? { ...prev, date: e.target.value } : prev)}
                />
              </div>
              <div>
                <Label htmlFor="event-time">Horário</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={editFormData?.time ?? ''}
                  onChange={(e) => setEditFormData((prev) => prev ? { ...prev, time: e.target.value } : prev)}
                />
              </div>
              <div>
                <Label htmlFor="event-price">Preço</Label>
                <Input
                  id="event-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData?.price ?? 0}
                  onChange={(e) => setEditFormData((prev) => prev ? { ...prev, price: Number(e.target.value) } : prev)}
                />
              </div>
              <div>
                <Label htmlFor="event-total-tickets">Ingressos Totais</Label>
                <Input
                  id="event-total-tickets"
                  type="number"
                  min="0"
                  value={editFormData?.totalTickets ?? 0}
                  onChange={(e) => {
                    const total = Number(e.target.value);
                    setEditFormData((prev) => prev ? {
                      ...prev,
                      totalTickets: total,
                      availableTickets: Math.min(prev.availableTickets, total),
                    } : prev);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="event-available-tickets">Ingressos disponíveis</Label>
                <Input
                  id="event-available-tickets"
                  type="number"
                  min="0"
                  max={editFormData?.totalTickets ?? 0}
                  value={editFormData?.availableTickets ?? 0}
                  onChange={(e) => setEditFormData((prev) => prev ? { ...prev, availableTickets: Math.min(Number(e.target.value), prev.totalTickets) } : prev)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="event-image">URL da imagem</Label>
              <Input
                id="event-image"
                type="text"
                value={editFormData?.image ?? ''}
                onChange={(e) => setEditFormData((prev) => prev ? { ...prev, image: e.target.value } : prev)}
              />
            </div>
            <div>
              <Label htmlFor="event-description">Descrição</Label>
              <textarea
                id="event-description"
                rows={4}
                value={editFormData?.description ?? ''}
                onChange={(e) => setEditFormData((prev) => prev ? { ...prev, description: e.target.value } : prev)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#305BF2] hover:bg-[#2347c9]">
                Salvar alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-slate-500">Total ({quantity} {quantity === 1 ? 'ingresso' : 'ingressos'})</p>
            <p className="text-2xl font-bold text-blue-600">
              R$ {(event.price * quantity).toFixed(2)}
            </p>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={event.availableTickets <= 0 || quantity > event.availableTickets}
            className="h-14 px-8 bg-[#305BF2] hover:bg-[#2347c9] text-lg font-semibold"
          >
            Comprar Agora
          </Button>
        </div>
      </div>
    </div>
  );
}
