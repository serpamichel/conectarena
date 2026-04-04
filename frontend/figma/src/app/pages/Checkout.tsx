import { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router';
import { ArrowLeft, CheckCircle2, CreditCard, Smartphone, Ticket, Calendar, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { events } from '../data/mockData';

export default function Checkout() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const quantity = parseInt(searchParams.get('quantity') || '1');
  const event = events.find((e) => e.id === id);

  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix'>('credit');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

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

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 2000);
  };

  const total = event.price * quantity;
  const serviceFee = total * 0.1;
  const finalTotal = total + serviceFee;

  if (isComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Compra Confirmada!</h1>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Seus ingressos foram enviados para o seu e-mail. Apresente o QR Code na entrada do evento.
            </p>
            
            {/* Ticket Preview */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <Ticket className="w-8 h-8" />
                <span className="text-sm font-mono bg-white/20 px-3 py-1 rounded-full">
                  #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">{event.title}</h3>
              <div className="space-y-2 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.date).toLocaleDateString('pt-BR')} • {event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Estádio Arena</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 text-center">
                <p className="text-xs text-blue-200 mb-2">QUANTIDADE</p>
                <p className="text-3xl font-bold">{quantity}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link to="/" className="block">
                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700">
                  Voltar para Home
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-12">
                Ver Meus Ingressos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky top-14 z-40">
        <div className="px-4 py-4">
          <Link to={`/evento/${id}`}>
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-xl font-bold mt-2">Finalizar Compra</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Event Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <img
                src={event.image}
                alt={event.title}
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base mb-2 line-clamp-2">{event.title}</h2>
                <div className="space-y-1 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {new Date(event.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 flex-shrink-0" />
                    <span>{quantity} {quantity === 1 ? 'ingresso' : 'ingressos'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-bold text-lg mb-4">Forma de Pagamento</h2>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod('credit')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'credit'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 active:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">Cartão de Crédito</p>
                    <p className="text-sm text-slate-500">Em até 12x sem juros</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'credit' ? 'border-blue-600' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'credit' && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    )}
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('pix')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'pix'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 active:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">PIX</p>
                    <p className="text-sm text-slate-500">Aprovação imediata</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'pix' ? 'border-blue-600' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'pix' && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    )}
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Credit Card Form */}
        {paymentMethod === 'credit' && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="cardNumber" className="text-sm font-semibold mb-2 block">
                  Número do Cartão
                </Label>
                <Input
                  id="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  className="h-12 text-base"
                  maxLength={19}
                />
              </div>
              <div>
                <Label htmlFor="cardName" className="text-sm font-semibold mb-2 block">
                  Nome no Cartão
                </Label>
                <Input
                  id="cardName"
                  placeholder="Como está no cartão"
                  className="h-12 text-base"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="expiry" className="text-sm font-semibold mb-2 block">
                    Validade
                  </Label>
                  <Input
                    id="expiry"
                    placeholder="MM/AA"
                    className="h-12 text-base"
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv" className="text-sm font-semibold mb-2 block">
                    CVV
                  </Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    type="password"
                    className="h-12 text-base"
                    maxLength={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PIX Info */}
        {paymentMethod === 'pix' && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <Smartphone className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Pagamento via PIX</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Após confirmar, você receberá um QR Code para realizar o pagamento via PIX. 
                O ingresso será liberado após a confirmação.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Price Summary */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-bold text-lg mb-4">Resumo do Pedido</h2>
            <div className="flex items-center justify-between text-base">
              <span className="text-slate-600">
                {quantity} {quantity === 1 ? 'ingresso' : 'ingressos'} × R$ {event.price.toFixed(2)}
              </span>
              <span className="font-semibold">R$ {total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-base">
              <span className="text-slate-600">Taxa de serviço</span>
              <span className="font-semibold">R$ {serviceFee.toFixed(2)}</span>
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                R$ {finalTotal.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full h-14 bg-[#305BF2] hover:bg-[#2347c9] text-lg font-semibold"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processando...
            </div>
          ) : (
            `Pagar R$ ${finalTotal.toFixed(2)}`
          )}
        </Button>
      </div>
    </div>
  );
}