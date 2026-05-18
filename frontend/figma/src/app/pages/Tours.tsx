import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Check, Star, MapPin, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { fetchAllEvents } from '../services/api';

interface Tour {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  includes: string[];
  availableSlots: { date: string; time: string; available: number }[];
}

export default function Tours() {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [toursState, setToursState] = useState<Tour[] | null>(null);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [showVoucher, setShowVoucher] = useState(false);
  const [voucherData, setVoucherData] = useState<any | null>(null);

  const initialTours: Tour[] = [
    {
      id: '1',
      name: 'Tour VIP Completo',
      description: 'Conheça todos os bastidores do estádio incluindo vestiários, sala de troféus, campo e áreas exclusivas.',
      duration: '2 horas',
      price: 150,
      image: 'https://images.unsplash.com/photo-1766085560633-896ad449d249?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFkaXVtJTIwdG91ciUyMGVtcHR5JTIwc2VhdHN8ZW58MXx8fHwxNzczNTMwMTE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.9,
      reviews: 234,
      includes: [
        'Acesso aos vestiários',
        'Sala de troféus',
        'Campo oficial',
        'Túnel dos jogadores',
        'Foto no banco de reservas',
        'Guia especializado',
      ],
      availableSlots: [
        { date: '2026-03-20', time: '10:00', available: 8 },
        { date: '2026-03-20', time: '14:00', available: 12 },
        { date: '2026-03-21', time: '10:00', available: 5 },
        { date: '2026-03-21', time: '16:00', available: 15 },
      ],
    },
    {
      id: '2',
      name: 'Tour Clássico',
      description: 'Visite as principais áreas do estádio com guia especializado.',
      duration: '1 hora',
      price: 80,
      image: 'https://images.unsplash.com/photo-1766085560633-896ad449d249?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFkaXVtJTIwdG91ciUyMGVtcHR5JTIwc2VhdHN8ZW58MXx8fHwxNzczNTMwMTE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.7,
      reviews: 156,
      includes: [
        'Campo oficial',
        'Arquibancada',
        'Túnel dos jogadores',
        'Guia especializado',
      ],
      availableSlots: [
        { date: '2026-03-20', time: '11:00', available: 20 },
        { date: '2026-03-20', time: '15:00', available: 18 },
        { date: '2026-03-21', time: '11:00', available: 15 },
      ],
    },
    {
      id: '3',
      name: 'Tour Museu',
      description: 'Explore a história do clube através de troféus, camisas históricas e memorabilia.',
      duration: '1h30',
      price: 60,
      image: 'https://images.unsplash.com/photo-1766085560633-896ad449d249?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFkaXVtJTIwdG91ciUyMGVtcHR5JTIwc2VhdHN8ZW58MXx8fHwxNzczNTMwMTE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.8,
      reviews: 189,
      includes: [
        'Sala de troféus',
        'Museu interativo',
        'Exposição de camisas',
        'Áudio guia',
      ],
      availableSlots: [
        { date: '2026-03-20', time: '09:00', available: 25 },
        { date: '2026-03-20', time: '13:00', available: 30 },
        { date: '2026-03-21', time: '09:00', available: 22 },
      ],
    },
  ];

  useEffect(() => {
    // Inicializa tours em estado mutável
    setToursState(initialTours);

    // Buscar eventos para bloquear datas que não estão disponíveis para tours
    fetchAllEvents()
      .then((events) => {
        const dates = new Set<string>(events.map((e) => e.date));
        setBlockedDates(dates);
      })
      .catch(() => {
        // falha ao buscar eventos não impede reservas locais
      });
  }, []);

  const handleBookTour = (tour: Tour) => {
    setSelectedTour(tour);
    setShowBooking(true);
    setSelectedSlot(null);
    setTicketCount(1);
  };

  const selectedSlotAvailable = selectedTour?.availableSlots.find(
    (slot) => slot.date === selectedSlot?.date && slot.time === selectedSlot?.time
  )?.available ?? 0;

  useEffect(() => {
    if (!selectedSlot) {
      setTicketCount(1);
      return;
    }

    setTicketCount((prev) => Math.min(Math.max(1, prev), selectedSlotAvailable || 1));
  }, [selectedSlot, selectedSlotAvailable]);

  const handleConfirmBooking = () => {
    if (!selectedTour || !selectedSlot) return;

    // Verifica bloqueio de data
    if (blockedDates.has(selectedSlot.date)) {
      alert('Não é possível reservar neste dia: o espaço está reservado para preparação de evento/jogo.');
      return;
    }

    if (ticketCount > selectedSlotAvailable) {
      alert(`A quantidade selecionada ultrapassa o disponível. Máximo ${selectedSlotAvailable} ingresso(s).`);
      return;
    }

    // Atualiza vagas localmente
    setToursState((prev) => {
      if (!prev) return prev;
      return prev.map((t) => {
        if (t.id !== selectedTour.id) return t;
        return {
          ...t,
          availableSlots: t.availableSlots.map((s) => {
            if (s.date === selectedSlot.date && s.time === selectedSlot.time) {
              return { ...s, available: Math.max(0, s.available - ticketCount) };
            }
            return s;
          }),
        };
      });
    });

    // Gera comprovante (voucher)
    const voucher = {
      id: (typeof crypto !== 'undefined' && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : `${Date.now()}-${Math.floor(Math.random()*10000)}`,
      tour: selectedTour.name,
      date: selectedSlot.date,
      time: selectedSlot.time,
      tickets: ticketCount,
      total: ((selectedTour.price || 0) * ticketCount).toFixed(2),
      instructions: 'Apresente este comprovante na recepção do estádio 20 minutos antes do horário. Traga documento com foto.'
    };

    setVoucherData(voucher);
    setShowVoucher(true);
    setShowBooking(false);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', weekday: 'long' });
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-[#394A7D] text-white px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Visitas Guiadas</h1>
        <p className="text-blue-100 leading-relaxed">
          Conheça os bastidores do estádio em experiências únicas
        </p>
      </div>

      {/* Tours List */}
      <div className="p-4 space-y-4">
        {(toursState ?? initialTours).map((tour) => (
          <Card key={tour.id} className="overflow-hidden shadow-md">
            <div className="relative h-[200px]">
              <img
                src={tour.image}
                alt={tour.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-3 right-3">
                <Badge className="bg-white/95 text-slate-900 backdrop-blur-sm">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                  {tour.rating} ({tour.reviews})
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-bold text-xl mb-1">{tour.name}</h3>
                <div className="flex items-center gap-3 text-white/90 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>Estádio Arena</span>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <p className="text-base text-slate-600 mb-4 leading-relaxed">
                {tour.description}
              </p>

              {/* Includes */}
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-slate-900 mb-2">O que está incluído:</h4>
                <div className="space-y-2">
                  {tour.includes.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price and CTA */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-xs text-slate-500">A partir de</p>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {tour.price.toFixed(2)}
                  </p>
                </div>
                <Button
                  onClick={() => handleBookTour(tour)}
                  className="bg-blue-600 hover:bg-blue-700 h-12 px-6"
                >
                  Agendar
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-base mb-2">Tours em Grupo</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Grupos acima de 10 pessoas têm desconto especial. Entre em contato para mais informações!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="max-w-[95vw] w-full max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedTour?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Select Date & Time */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Escolha data e horário
              </Label>
              <div className="space-y-2">
                {(
                  (toursState?.find((t) => t.id === selectedTour?.id)?.availableSlots ?? selectedTour?.availableSlots ?? [])
                ).map((slot, index) => {
                  const isBlocked = blockedDates.has(slot.date);
                  const isSoldOut = slot.available <= 0;

                  return (
                    <button
                      key={index}
                      onClick={() => { if (!isBlocked && !isSoldOut) setSelectedSlot(slot); }}
                      disabled={isBlocked || isSoldOut}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200'
                      } ${isBlocked || isSoldOut ? 'opacity-60 cursor-not-allowed' : 'active:bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-base font-semibold">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          {formatDate(slot.date)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4" />
                          {slot.time}
                        </div>
                        <span className={`font-medium ${isSoldOut ? 'text-rose-600' : 'text-green-600'}`}>
                          {isSoldOut ? 'Esgotado' : `${slot.available} vagas disponíveis`}
                        </span>
                      </div>
                      {isBlocked && (
                        <div className="mt-2 text-sm text-rose-600">Indisponível: preparo do espaço para evento/jogo neste dia.</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Number of Tickets */}
            {selectedSlot && (
              <div>
                <Label htmlFor="tickets" className="text-base font-semibold mb-3 block">
                  Quantidade de ingressos
                </Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setTicketCount((prev) => Math.max(1, prev - 1))}
                    className="h-12 w-12"
                    disabled={ticketCount <= 1}
                  >
                    -
                  </Button>
                  <Input
                    id="tickets"
                    type="number"
                    value={ticketCount}
                    min={1}
                    max={selectedSlotAvailable}
                    onChange={(e) => {
                      const raw = parseInt(e.target.value, 10);
                      const next = Number.isNaN(raw) ? 1 : raw;
                      setTicketCount(Math.min(Math.max(1, next), selectedSlotAvailable || 1));
                    }}
                    className="text-center text-lg font-bold h-12"
                  />
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setTicketCount((prev) => Math.min(prev + 1, selectedSlotAvailable || prev))}
                    className="h-12 w-12"
                    disabled={ticketCount >= selectedSlotAvailable}
                  >
                    +
                  </Button>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  Máximo disponível: {selectedSlotAvailable} ingresso{selectedSlotAvailable === 1 ? '' : 's'}
                </p>
              </div>
            )}

            {/* Total */}
            {selectedSlot && (
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">Valor unitário</span>
                  <span className="font-semibold">R$ {selectedTour?.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">Quantidade</span>
                  <span className="font-semibold">{ticketCount}</span>
                </div>
                <div className="h-px bg-slate-200 my-3" />
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    R$ {((selectedTour?.price || 0) * ticketCount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Confirm Button */}
            <Button
              onClick={handleConfirmBooking}
              disabled={!selectedSlot}
              className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
            >
              Confirmar Reserva
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Voucher Dialog */}
      <Dialog open={showVoucher} onOpenChange={setShowVoucher}>
        <DialogContent className="max-w-md w-full rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Comprovante de Reserva</DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            {voucherData && (
              <div>
                <p className="text-sm text-slate-600 mb-2">Código:</p>
                <div className="p-3 bg-slate-50 rounded-md font-mono text-sm mb-3">{voucherData.id}</div>

                <p className="text-sm text-slate-600">Tour</p>
                <h3 className="font-bold text-lg">{voucherData.tour}</h3>

                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-700">
                  <div>
                    <p className="text-xs text-slate-500">Data</p>
                    <p>{voucherData.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Horário</p>
                    <p>{voucherData.time}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-slate-500">Ingressos</p>
                  <p>{voucherData.tickets} • Total R$ {voucherData.total}</p>
                </div>

                <div className="mt-4 text-sm text-slate-600">
                  <p className="font-semibold">Instruções</p>
                  <p>{voucherData.instructions}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={async () => {
                  if (!voucherData) return;
                  const text = `Comprovante: ${voucherData.id}\nTour: ${voucherData.tour}\nData: ${voucherData.date} ${voucherData.time}\nIngressos: ${voucherData.tickets}\nTotal: R$ ${voucherData.total}\n\n${voucherData.instructions}`;
                  try { await navigator.clipboard.writeText(text); alert('Comprovante copiado para a área de transferência'); } catch { alert('Não foi possível copiar para a área de transferência'); }
                }}
                variant="outline"
              >
                Copiar comprovante
              </Button>

              <Button
                onClick={() => {
                  if (!voucherData) return;
                  const subject = encodeURIComponent('Comprovante de Reserva - ' + voucherData.tour);
                  const body = encodeURIComponent(`Comprovante: ${voucherData.id}\nTour: ${voucherData.tour}\nData: ${voucherData.date} ${voucherData.time}\nIngressos: ${voucherData.tickets}\nTotal: R$ ${voucherData.total}\n\n${voucherData.instructions}`);
                  window.location.href = `mailto:?subject=${subject}&body=${body}`;
                }}
              >
                Enviar por e-mail
              </Button>
            </div>

            <div>
              <Button onClick={() => setShowVoucher(false)} variant="ghost">Fechar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}