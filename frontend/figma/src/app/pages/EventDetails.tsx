import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Plus, Minus, Share2, Heart, Ticket } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { events, type EventCategory } from '../data/mockData';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = events.find((e) => e.id === id);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);

  if (!event) {
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

  const handleCheckout = () => {
    navigate(`/checkout/${event.id}?quantity=${quantity}`);
  };

  const availabilityPercentage = (event.availableTickets / event.totalTickets) * 100;

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
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button 
            onClick={() => setLiked(!liked)}
            className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-slate-900'}`} />
          </button>
          <button className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <Share2 className="w-5 h-5 text-slate-900" />
          </button>
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
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-12 w-12 rounded-xl"
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="h-12 w-12 rounded-xl"
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
          </CardContent>
        </Card>

        {/* Related Info */}
        {event.featured && (
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
            className="h-14 px-8 bg-[#305BF2] hover:bg-[#2347c9] text-lg font-semibold"
          >
            Comprar Agora
          </Button>
        </div>
      </div>
    </div>
  );
}