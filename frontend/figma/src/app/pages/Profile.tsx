import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { User, Mail, Phone, MapPin, Calendar, Ticket, Heart, Settings, LogOut, Edit, Camera, CreditCard, Bell, Shield, QrCode, X, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { fetchMyPurchases, type TicketPurchase } from '../services/api';

function qrUrl(code: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(code)}&format=png`;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [qrTicket, setQrTicket] = useState<TicketPurchase | null>(null);
  const [tickets, setTickets] = useState<TicketPurchase[]>([]);
  const [userData, setUserData] = useState({
    name: user?.name || 'Usuário',
    email: user?.email || '',
    phone: '(81) 98765-4321',
    city: 'Recife, PE',
    avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id ?? 'default'}`,
  });

  useEffect(() => {
    if (!user) return;
    fetchMyPurchases(user.id).then(setTickets).catch(() => {});
  }, [user]);

  const totalSpent = tickets.reduce((sum, t) => sum + t.totalPago, 0);
  const upcomingCount = tickets.filter(t => new Date(t.evento.data) >= new Date()).length;
  const recentTickets = tickets.slice(0, 3);

  const handleSaveProfile = () => {
    setShowEditDialog(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Profile Header */}
      <div className="bg-[#394A7D] text-white px-4 pt-8 pb-24">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-24 h-24 rounded-full bg-white p-1 shadow-lg"
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
              <Camera className="w-4 h-4 text-[#305BF2]" />
            </button>
          </div>
          <h1 className="text-2xl font-bold mb-1">{userData.name}</h1>
          <p className="text-blue-100 text-sm mb-4">{userData.email}</p>
          <Button
            onClick={() => setShowEditDialog(true)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white h-10 px-6"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
        </div>
      </div>

      <div className="px-4 -mt-16 pb-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-white shadow-lg">
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Ticket className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{tickets.length}</p>
              <p className="text-xs text-slate-600">Compras realizadas</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{upcomingCount}</p>
              <p className="text-xs text-slate-600">Próximos eventos</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Heart className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">—</p>
              <p className="text-xs text-slate-600">Favoritos</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {totalSpent > 0 ? `R$ ${totalSpent.toFixed(0)}` : '—'}
              </p>
              <p className="text-xs text-slate-600">Total gasto</p>
            </CardContent>
          </Card>
        </div>

        {/* Meus Ingressos */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Meus Ingressos</h2>
            {tickets.length > 0 && (
              <Link
                to="/meus-ingressos"
                className="flex items-center gap-1 text-sm text-blue-600 font-medium"
              >
                Ver todos
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {tickets.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-3">Nenhum ingresso comprado ainda.</p>
                <Link to="/">
                  <Button size="sm" className="bg-[#305BF2] hover:bg-[#2347c9]">
                    Ver Eventos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <Card key={ticket.id} className="overflow-hidden">
                  <div className="flex gap-3 p-3">
                    <img
                      src={ticket.evento.imagemUrl}
                      alt={ticket.evento.nome}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm mb-1 line-clamp-2">{ticket.evento.nome}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(ticket.evento.data).toLocaleDateString('pt-BR')} • {ticket.evento.horario}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-red-100 text-red-700 text-xs">
                          {ticket.quantidade} {ticket.quantidade === 1 ? 'ingresso' : 'ingressos'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-blue-200 text-blue-700"
                          onClick={() => setQrTicket(ticket)}
                        >
                          <QrCode className="w-3 h-3 mr-1" />
                          QR Code
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Personal Info */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h2 className="text-base font-bold mb-4">Informações Pessoais</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Nome completo</p>
                  <p className="font-medium">{userData.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">E-mail</p>
                  <p className="font-medium truncate">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Telefone</p>
                  <p className="font-medium">{userData.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Localização</p>
                  <p className="font-medium">{userData.city}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h2 className="text-base font-bold mb-4">Configurações</h2>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg active:bg-slate-50 transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="flex-1 text-left">Notificações</span>
                <div className="w-11 h-6 bg-red-600 rounded-full flex items-center px-1">
                  <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg active:bg-slate-50 transition-colors">
                <Shield className="w-5 h-5 text-slate-600" />
                <span className="flex-1 text-left">Privacidade</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg active:bg-slate-50 transition-colors">
                <CreditCard className="w-5 h-5 text-slate-600" />
                <span className="flex-1 text-left">Formas de Pagamento</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg active:bg-slate-50 transition-colors">
                <Settings className="w-5 h-5 text-slate-600" />
                <span className="flex-1 text-left">Configurações Gerais</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair da Conta
        </Button>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[95vw] w-full max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" className="text-sm font-semibold mb-2 block">
                Nome Completo
              </Label>
              <Input
                id="name"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="h-12"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-semibold mb-2 block">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="h-12"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-semibold mb-2 block">
                Telefone
              </Label>
              <Input
                id="phone"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                className="h-12"
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-sm font-semibold mb-2 block">
                Cidade
              </Label>
              <Input
                id="city"
                value={userData.city}
                onChange={(e) => setUserData({ ...userData, city: e.target.value })}
                className="h-12"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="flex-1 h-12"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700"
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
