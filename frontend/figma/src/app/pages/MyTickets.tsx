import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Ticket, Calendar, MapPin, CreditCard, Smartphone, ArrowLeft, ShoppingBag, QrCode, X } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { fetchMyPurchases, type TicketPurchase } from '../services/api';

const CATEGORY_COLORS: Record<string, string> = {
  futebol: 'bg-green-100 text-green-800',
  musica: 'bg-purple-100 text-purple-800',
  teatro: 'bg-amber-100 text-amber-800',
  outros: 'bg-slate-100 text-slate-800',
};

const CATEGORY_LABELS: Record<string, string> = {
  futebol: 'Futebol',
  musica: 'Música',
  teatro: 'Teatro',
  outros: 'Outros',
};

function qrUrl(code: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(code)}&format=png`;
}

export default function MyTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrTicket, setQrTicket] = useState<TicketPurchase | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchMyPurchases(user.id)
      .then(setTickets)
      .catch(() => setError('Não foi possível carregar seus ingressos.'))
      .finally(() => setLoading(false));
  }, [user]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-slate-50 min-h-screen pb-8">
      {/* Header — sticky abaixo do header global (h-14) */}
      <div className="bg-[#394A7D] text-white px-4 pt-4 pb-6 sticky top-14 z-40 shadow-md">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-3 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold">Meus Ingressos</h1>
        <p className="text-blue-200 text-sm mt-0.5">
          {user?.name ? `Olá, ${user.name}` : 'Suas compras registradas'}
        </p>
      </div>

      <div className="px-4 mt-4">
        {loading && (
          <div className="space-y-4 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        {!loading && !error && tickets.length === 0 && (
          <div className="mt-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-700 mb-2">Nenhum ingresso ainda</h2>
            <p className="text-slate-500 text-sm mb-6">
              Seus ingressos comprados aparecerão aqui.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-[#305BF2] text-white rounded-xl font-semibold text-sm"
            >
              Ver Eventos
            </Link>
          </div>
        )}

        {!loading && tickets.length > 0 && (
          <div className="space-y-4 mt-4">
            <p className="text-sm text-slate-500">
              {tickets.length} {tickets.length === 1 ? 'ingresso comprado' : 'ingressos comprados'}
            </p>

            {tickets.map((purchase) => (
              <Card key={purchase.id} className="overflow-hidden shadow-sm">
                {/* Imagem + categoria */}
                <div className="relative h-28">
                  <img
                    src={purchase.evento.imagemUrl}
                    alt={purchase.evento.nome}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <Badge
                    className={`absolute top-3 left-3 text-xs ${CATEGORY_COLORS[purchase.evento.categoria] ?? CATEGORY_COLORS.outros}`}
                  >
                    {CATEGORY_LABELS[purchase.evento.categoria] ?? 'Outros'}
                  </Badge>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-base leading-tight line-clamp-1">
                      {purchase.evento.nome}
                    </h3>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Infos do evento */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span>{formatDate(purchase.evento.data)} • {purchase.evento.horario}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span>{purchase.evento.local}</span>
                    </div>
                  </div>

                  {/* Divisor estilo ingresso */}
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200 -ml-5" />
                    <div className="flex-1 border-t border-dashed border-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200 -mr-5" />
                  </div>

                  {/* Código e detalhes da compra */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-blue-600" />
                      <span className="font-mono font-bold text-blue-700 text-sm tracking-wider">
                        {purchase.codigoIngresso}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      {purchase.metodoPagamento === 'pix'
                        ? <Smartphone className="w-3.5 h-3.5" />
                        : <CreditCard className="w-3.5 h-3.5" />}
                      <span>{purchase.metodoPagamento === 'pix' ? 'PIX' : 'Cartão'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {purchase.quantidade} {purchase.quantidade === 1 ? 'ingresso' : 'ingressos'}
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-blue-600">
                        R$ {purchase.totalPago.toFixed(2)}
                      </span>
                      <p className="text-xs text-slate-400">
                        Comprado em {formatDateTime(purchase.dataCompra)}
                      </p>
                    </div>
                  </div>

                  {/* QR Code button */}
                  <Button
                    variant="outline"
                    className="w-full h-10 text-sm border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => setQrTicket(purchase)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Ver QR Code
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Dialog */}
      <Dialog open={!!qrTicket} onOpenChange={(open) => !open && setQrTicket(null)}>
        <DialogContent className="max-w-[90vw] w-full rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base leading-snug line-clamp-2 pr-8">
              {qrTicket?.evento.nome}
            </DialogTitle>
          </DialogHeader>
          {qrTicket && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <img
                  src={qrUrl(qrTicket.codigoIngresso)}
                  alt={`QR Code ${qrTicket.codigoIngresso}`}
                  className="w-56 h-56"
                />
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Código do ingresso</p>
                <p className="font-mono font-bold text-blue-700 text-lg tracking-widest">
                  {qrTicket.codigoIngresso}
                </p>
              </div>
              <div className="text-center text-xs text-slate-400 leading-relaxed">
                <p>Apresente este QR Code na entrada do evento.</p>
                <p>{qrTicket.quantidade} {qrTicket.quantidade === 1 ? 'ingresso' : 'ingressos'} • {qrTicket.evento.horario}</p>
              </div>
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => setQrTicket(null)}
              >
                <X className="w-4 h-4 mr-2" />
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
