import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Mail, Phone, MapPin, Calendar, Ticket, Heart, Settings, LogOut, Edit, Camera, CreditCard, Bell, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [userData, setUserData] = useState({
    name: user?.name || 'Maria Silva',
    email: user?.email || 'maria.silva@email.com',
    phone: '(81) 98765-4321',
    city: 'Recife, PE',
    avatar: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
  });

  const stats = {
    eventsAttended: 12,
    upcomingEvents: 3,
    favoriteEvents: 8,
    totalSpent: 1850,
  };

  const upcomingTickets = [
    {
      id: '1',
      event: 'Final do Campeonato Pernambucano',
      date: '2026-03-25',
      time: '16:00',
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1734652246537-104c43a68942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    },
    {
      id: '2',
      event: 'Festival de Frevo 2026',
      date: '2026-04-05',
      time: '18:00',
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1689793354800-de168c0a4c9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    },
  ];

  const handleSaveProfile = () => {
    setShowEditDialog(false);
    // Aqui implementaria a lógica de salvar
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
              <p className="text-2xl font-bold text-red-600">{stats.eventsAttended}</p>
              <p className="text-xs text-slate-600">Eventos visitados</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.upcomingEvents}</p>
              <p className="text-xs text-slate-600">Próximos eventos</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Heart className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{stats.favoriteEvents}</p>
              <p className="text-xs text-slate-600">Favoritos</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">R$ {stats.totalSpent}</p>
              <p className="text-xs text-slate-600">Total gasto</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Tickets */}
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-3">Meus Próximos Eventos</h2>
          <div className="space-y-3">
            {upcomingTickets.map((ticket) => (
              <Card key={ticket.id} className="overflow-hidden">
                <div className="flex gap-3 p-3">
                  <img
                    src={ticket.image}
                    alt={ticket.event}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm mb-2 line-clamp-2">{ticket.event}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(ticket.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-red-100 text-red-700 text-xs">
                        {ticket.quantity} {ticket.quantity === 1 ? 'ingresso' : 'ingressos'}
                      </Badge>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Ver QR Code
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
    </div>
  );
}