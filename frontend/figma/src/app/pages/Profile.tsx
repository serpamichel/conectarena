import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { User, Mail, Phone, MapPin, Calendar, Ticket, Heart, Settings, LogOut, Edit, Camera, CreditCard, Bell, Shield, QrCode, X, Star, ChevronRight, Trash } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { fetchAllEvents, fetchMyPurchases, getCreatedEventIdsForUser, getCreatedEventsForUser, saveCreatedEventForUser, deleteCreatedEventForUser, type Event, type TicketPurchase } from '../services/api';

function qrUrl(code: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(code)}&format=png`;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminAba, setAdminAba] = useState<'sistema' | 'fornecedores'>('sistema');
  const [backupStatus, setBackupStatus] = useState('');
  const [backupLista, setBackupLista] = useState<string[]>([]);
  const [healthStatus, setHealthStatus] = useState<Record<string, any> | null>(null);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [showNovoFornecedor, setShowNovoFornecedor] = useState(false);
  const [novoFornecedor, setNovoFornecedor] = useState({ nome: '', tipoServico: '', cnpj: '', emailContato: '', conformeLgpd: false, observacoes: '' });
  const [showLgpdDialog, setShowLgpdDialog] = useState(false);
  const [showExclusaoConfirm, setShowExclusaoConfirm] = useState(false);
  const [lgpdData, setLgpdData] = useState<Record<string, string> | null>(null);
  const [lgpdLoading, setLgpdLoading] = useState(false);
  const [lgpdMensagem, setLgpdMensagem] = useState('');
  const [qrTicket, setQrTicket] = useState<TicketPurchase | null>(null);
  const [tickets, setTickets] = useState<TicketPurchase[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [myEventsLoading, setMyEventsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editFormData, setEditFormData] = useState<Event | null>(null);
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

  useEffect(() => {
    if (!user) {
      setMyEvents([]);
      setMyEventsLoading(false);
      return;
    }

    setMyEventsLoading(true);
    const myCreatedIds = getCreatedEventIdsForUser(user.id);
    const storedEvents = getCreatedEventsForUser(user.id);
    if (myCreatedIds.length === 0) {
      setMyEvents([]);
      setMyEventsLoading(false);
      return;
    }

    fetchAllEvents()
      .then((events) => {
        const backendEvents = events
          .filter((event) => myCreatedIds.includes(event.id))
          .map((event) => ({ ...event, ...(storedEvents[event.id] ?? {}) }));

        const localOnlyEvents = Object.keys(storedEvents)
          .filter((id) => !backendEvents.some((event) => event.id === id))
          .map((id) => storedEvents[id]);

        setMyEvents([...backendEvents, ...localOnlyEvents]);
      })
      .catch(() => setMyEvents(Object.values(storedEvents)))
      .finally(() => setMyEventsLoading(false));
  }, [user]);

  const totalSpent = tickets.reduce((sum, t) => sum + t.totalPago, 0);
  const upcomingCount = tickets.filter(t => new Date(t.evento.data) >= new Date()).length;
  const recentTickets = tickets.slice(0, 3);

  const handleSaveProfile = () => {
    setShowEditDialog(false);
  };

  const handleDeleteCreatedEvent = (eventId: string) => {
    if (!user) return;
    if (!window.confirm('Tem certeza que deseja excluir este evento? Essa ação não pode ser desfeita.')) return;
    deleteCreatedEventForUser(user.id, eventId);
    setMyEvents((prev) => prev.filter((event) => event.id !== eventId));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAbrirAdmin = async () => {
    setShowAdminDialog(true);
    setAdminAba('sistema');
    setBackupStatus('');
    setBackupLista([]);
    setHealthStatus(null);
    const token = localStorage.getItem('conectarena_token');
    const [healthRes, listaRes, fornRes] = await Promise.all([
      fetch('/api/status/health'),
      fetch('/api/backup/listar', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/fornecedores', { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    if (healthRes.ok) setHealthStatus(await healthRes.json());
    if (listaRes.ok) setBackupLista(await listaRes.json());
    if (fornRes.ok) setFornecedores(await fornRes.json());
  };

  const handleCadastrarFornecedor = async () => {
    const token = localStorage.getItem('conectarena_token');
    const res = await fetch('/api/fornecedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(novoFornecedor),
    });
    if (res.ok) {
      const criado = await res.json();
      setFornecedores(prev => [criado, ...prev]);
      setNovoFornecedor({ nome: '', tipoServico: '', cnpj: '', emailContato: '', conformeLgpd: false, observacoes: '' });
      setShowNovoFornecedor(false);
    }
  };

  const handleDesativarFornecedor = async (id: number) => {
    const token = localStorage.getItem('conectarena_token');
    const res = await fetch(`/api/fornecedores/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setFornecedores(prev => prev.map(f => f.id === id ? { ...f, status: 'INATIVO' } : f));
    }
  };

  const handleExecutarBackup = async () => {
    setBackupStatus('Executando...');
    try {
      const token = localStorage.getItem('conectarena_token');
      const res = await fetch('/api/backup/executar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBackupStatus(data.mensagem || 'Backup realizado!');
      const listaRes = await fetch('/api/backup/listar', { headers: { Authorization: `Bearer ${token}` } });
      if (listaRes.ok) setBackupLista(await listaRes.json());
    } catch {
      setBackupStatus('Erro ao realizar backup.');
    }
  };

  const handleAbrirLgpd = async () => {
    setShowLgpdDialog(true);
    setLgpdMensagem('');
    setLgpdLoading(true);
    try {
      const token = localStorage.getItem('conectarena_token');
      const res = await fetch('/api/lgpd/meus-dados', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLgpdData(data);
    } catch {
      setLgpdData(null);
    } finally {
      setLgpdLoading(false);
    }
  };

  const handleSolicitarExclusao = async () => {
    setShowExclusaoConfirm(false);
    try {
      const token = localStorage.getItem('conectarena_token');
      const res = await fetch('/api/lgpd/solicitar-exclusao', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLgpdMensagem(data.mensagem || 'Solicitação registrada.');
    } catch {
      setLgpdMensagem('Erro ao processar solicitação.');
    }
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => setShowEditDialog(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white h-10 px-6"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
            <Button
              onClick={() => navigate('/admin/criar-evento')}
              className="group bg-gradient-to-r from-[#305BF2] to-[#1f4ecf] text-white shadow-xl shadow-[#305BF2]/20 h-10 px-6 border border-transparent hover:from-[#1f4ecf] hover:to-[#2347c9] transition-transform duration-300 ease-out hover:scale-[1.02]"
            >
              <Star className="w-4 h-4 mr-2 text-amber-200 drop-shadow-[0_0_8px_rgba(255,255,255,0.35)] transition duration-300 ease-out group-hover:text-amber-100 group-hover:drop-shadow-[0_0_16px_rgba(255,255,255,0.7)] group-hover:animate-pulse" />
              Publicar Evento
            </Button>
          </div>
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

        {/* Meus Eventos */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold">Meus Eventos</h2>
              <p className="text-sm text-slate-500">Eventos cadastrados por você</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-sm"
              onClick={() => navigate('/admin/criar-evento')}
            >
              Novo evento
            </Button>
          </div>

          {myEventsLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">Carregando eventos...</CardContent>
            </Card>
          ) : myEvents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-slate-500 mb-3">
                  {user ? 'Você ainda não cadastrou eventos.' : 'Faça login para ver os seus eventos cadastrados.'}
                </p>
                <Button size="sm" className="bg-[#305BF2] hover:bg-[#2347c9]" onClick={() => navigate('/admin/criar-evento')}>
                  Cadastrar Evento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="flex flex-col gap-3 p-3">
                    <Link to={`/evento/${event.id}`} className="flex gap-3">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm mb-1 line-clamp-2">{event.title}</h3>
                        <p className="text-xs text-slate-500 mb-2">{event.category.charAt(0).toUpperCase() + event.category.slice(1)}</p>
                        <div className="text-xs text-slate-500">{new Date(event.date).toLocaleDateString('pt-BR')} • {event.time}</div>
                      </div>
                    </Link>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs border-slate-200 text-slate-700"
                        onClick={() => {
                          setEditingEvent(event);
                          setEditFormData(event);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteCreatedEvent(event.id)}
                      >
                        <Trash className="w-3.5 h-3.5" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
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
              {user?.role === 'ADMIN' && (
                <button onClick={handleAbrirAdmin} className="w-full flex items-center gap-3 p-3 rounded-lg active:bg-slate-50 transition-colors">
                  <Settings className="w-5 h-5 text-[#305BF2]" />
                  <span className="flex-1 text-left font-medium text-[#305BF2]">Painel Administrativo</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}
              <button onClick={handleAbrirLgpd} className="w-full flex items-center gap-3 p-3 rounded-lg active:bg-slate-50 transition-colors">
                <Shield className="w-5 h-5 text-slate-600" />
                <span className="flex-1 text-left">Privacidade e LGPD</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
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

      {/* Edit Event Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={(open) => { if (!open) setEditingEvent(null); }}>
        <DialogContent className="max-w-[95vw] w-full max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
          </DialogHeader>
          {editFormData ? (
            <form
              className="space-y-4 py-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!user || !editFormData) return;
                saveCreatedEventForUser(user.id, editFormData);
                setMyEvents((prev) => prev.map((event) => event.id === editFormData.id ? editFormData : event));
                setEditingEvent(null);
              }}
            >
              <div>
                <Label htmlFor="edit-title" className="text-sm font-semibold mb-2 block">
                  Nome do Evento
                </Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-sm font-semibold mb-2 block">
                  Descrição
                </Label>
                <textarea
                  id="edit-description"
                  rows={4}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#305BF2] outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-date" className="text-sm font-semibold mb-2 block">
                    Data
                  </Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-time" className="text-sm font-semibold mb-2 block">
                    Horário
                  </Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editFormData.time}
                    onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category" className="text-sm font-semibold mb-2 block">
                    Categoria
                  </Label>
                  <select
                    id="edit-category"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value as Event['category'] })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#305BF2] outline-none"
                  >
                    <option value="futebol">Futebol</option>
                    <option value="musica">Música</option>
                    <option value="teatro">Teatro</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-image" className="text-sm font-semibold mb-2 block">
                    URL da Imagem
                  </Label>
                  <Input
                    id="edit-image"
                    value={editFormData.image}
                    onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price" className="text-sm font-semibold mb-2 block">
                    Preço
                  </Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                    className="h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-totalTickets" className="text-sm font-semibold mb-2 block">
                    Total de Ingressos
                  </Label>
                  <Input
                    id="edit-totalTickets"
                    type="number"
                    min="0"
                    value={editFormData.totalTickets}
                    onChange={(e) => setEditFormData({ ...editFormData, totalTickets: Number(e.target.value) })}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingEvent(null)}
                  className="h-12"
                >
                  Cancelar
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    className="h-12"
                    onClick={() => editingEvent && handleDeleteCreatedEvent(editingEvent.id)}
                  >
                    Excluir
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 bg-[#305BF2] hover:bg-[#2347c9]"
                  >
                    Salvar alterações
                  </Button>
                </div>
              </div>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

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

      {/* Painel Administrativo */}
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="max-w-[95vw] w-full max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#305BF2]" />
              Painel Administrativo
            </DialogTitle>
          </DialogHeader>

          {/* Abas */}
          <div className="flex gap-2 border-b border-slate-200 mb-4">
            {(['sistema', 'fornecedores'] as const).map(aba => (
              <button
                key={aba}
                onClick={() => setAdminAba(aba)}
                className={`pb-2 px-1 text-sm font-medium capitalize border-b-2 transition-colors ${adminAba === aba ? 'border-[#305BF2] text-[#305BF2]' : 'border-transparent text-slate-500'}`}
              >
                {aba === 'sistema' ? 'Sistema & Backup' : 'Fornecedores'}
              </button>
            ))}
          </div>

          {adminAba === 'sistema' && (
            <div className="space-y-5">
              {/* Health Check */}
              <div>
                <h3 className="font-semibold text-sm text-slate-700 mb-2">Status do sistema</h3>
                {healthStatus ? (
                  <div className={`rounded-xl p-4 ${healthStatus.status === 'UP' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${healthStatus.status === 'UP' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={`font-bold text-sm ${healthStatus.status === 'UP' ? 'text-green-700' : 'text-red-700'}`}>
                        Sistema {healthStatus.status}
                      </span>
                    </div>
                    {healthStatus.componentes && Object.entries(healthStatus.componentes).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs text-slate-600 mt-1">
                        <span>{k === 'bancoDeDados' ? 'Banco de dados' : 'Aplicação'}:</span>
                        <span className={`font-semibold ${v === 'UP' ? 'text-green-600' : 'text-red-600'}`}>{String(v)}</span>
                      </div>
                    ))}
                    <p className="text-xs text-slate-400 mt-2">{healthStatus.timestamp}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Carregando...</p>
                )}
              </div>

              {/* Backup */}
              <div>
                <h3 className="font-semibold text-sm text-slate-700 mb-2">Backup do banco de dados</h3>
                <Button onClick={handleExecutarBackup} disabled={backupStatus === 'Executando...'} className="w-full h-11 bg-[#305BF2] hover:bg-[#2347c9] mb-3">
                  {backupStatus === 'Executando...' ? 'Executando backup...' : 'Executar backup agora'}
                </Button>
                {backupStatus && backupStatus !== 'Executando...' && (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-3">{backupStatus}</div>
                )}
                {backupLista.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Backups disponíveis:</p>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {backupLista.map(arquivo => (
                        <div key={arquivo} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-700">
                          <span>📦</span>{arquivo}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {adminAba === 'fornecedores' && (
            <div className="space-y-3">
              <Button onClick={() => setShowNovoFornecedor(!showNovoFornecedor)} className="w-full h-10 bg-[#305BF2] hover:bg-[#2347c9] text-sm">
                {showNovoFornecedor ? 'Cancelar' : '+ Novo fornecedor'}
              </Button>

              {showNovoFornecedor && (
                <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                  <h4 className="font-semibold text-sm text-slate-700">Cadastrar fornecedor</h4>
                  <Input placeholder="Nome *" value={novoFornecedor.nome} onChange={e => setNovoFornecedor({...novoFornecedor, nome: e.target.value})} className="h-10 text-sm" />
                  <Input placeholder="Tipo de serviço *" value={novoFornecedor.tipoServico} onChange={e => setNovoFornecedor({...novoFornecedor, tipoServico: e.target.value})} className="h-10 text-sm" />
                  <Input placeholder="CNPJ" value={novoFornecedor.cnpj} onChange={e => setNovoFornecedor({...novoFornecedor, cnpj: e.target.value})} className="h-10 text-sm" />
                  <Input placeholder="E-mail de contato" value={novoFornecedor.emailContato} onChange={e => setNovoFornecedor({...novoFornecedor, emailContato: e.target.value})} className="h-10 text-sm" />
                  <Input placeholder="Observações" value={novoFornecedor.observacoes} onChange={e => setNovoFornecedor({...novoFornecedor, observacoes: e.target.value})} className="h-10 text-sm" />
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="lgpdForn" checked={novoFornecedor.conformeLgpd} onChange={e => setNovoFornecedor({...novoFornecedor, conformeLgpd: e.target.checked})} className="accent-[#305BF2]" />
                    <label htmlFor="lgpdForn" className="text-xs text-slate-600">Fornecedor está em conformidade com a LGPD</label>
                  </div>
                  <Button onClick={handleCadastrarFornecedor} className="w-full h-10 bg-green-600 hover:bg-green-700 text-sm">Salvar fornecedor</Button>
                </div>
              )}

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {fornecedores.map(f => (
                  <div key={f.id} className="bg-white border border-slate-200 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-slate-800">{f.nome}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{f.status}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${f.conformeLgpd ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {f.conformeLgpd ? 'LGPD ✓' : 'LGPD pendente'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{f.tipoServico}</p>
                        {f.emailContato && <p className="text-xs text-slate-400">{f.emailContato}</p>}
                      </div>
                      {f.status === 'ATIVO' && (
                        <button onClick={() => handleDesativarFornecedor(f.id)} className="text-xs text-red-500 hover:text-red-700 flex-shrink-0 mt-1">Desativar</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão de Conta */}
      <Dialog open={showExclusaoConfirm} onOpenChange={setShowExclusaoConfirm}>
        <DialogContent className="max-w-[90vw] w-full rounded-2xl">
          <div className="flex flex-col items-center text-center pt-2 pb-1 gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Trash className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-1">Excluir minha conta</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tem certeza que deseja solicitar a exclusão da sua conta?
              </p>
            </div>
            <div className="w-full bg-red-50 border border-red-100 rounded-xl p-4 text-left space-y-2">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">O que vai acontecer:</p>
              <ul className="space-y-1.5">
                {[
                  'Sua conta será desativada imediatamente',
                  'Você perderá o acesso à plataforma',
                  'Seus dados serão removidos em até 15 dias úteis',
                  'Seus ingressos comprados não serão reembolsados',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-red-700">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2 w-full pt-1">
              <Button
                onClick={handleSolicitarExclusao}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Sim, solicitar exclusão
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowExclusaoConfirm(false)}
                className="w-full h-12"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* LGPD Dialog */}
      <Dialog open={showLgpdDialog} onOpenChange={setShowLgpdDialog}>
        <DialogContent className="max-w-[95vw] w-full max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#305BF2]" />
              Privacidade e LGPD
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Meus Dados */}
            <div>
              <h3 className="font-semibold text-sm text-slate-700 mb-2">Meus dados armazenados</h3>
              {lgpdLoading ? (
                <p className="text-sm text-slate-400">Carregando...</p>
              ) : lgpdData ? (
                <div className="bg-slate-50 rounded-xl p-3 space-y-2 text-sm">
                  {Object.entries(lgpdData).map(([chave, valor]) => (
                    <div key={chave} className="flex justify-between gap-2">
                      <span className="text-slate-500 capitalize">{chave.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-medium text-right">{String(valor)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-red-500">Não foi possível carregar os dados.</p>
              )}
            </div>

            {/* Política de Privacidade */}
            <div>
              <h3 className="font-semibold text-sm text-slate-700 mb-2">Política de Privacidade</h3>
              <Link
                to="/politica-privacidade"
                className="flex items-center justify-between w-full p-3 border border-slate-200 rounded-xl text-sm text-[#305BF2] hover:bg-slate-50 transition-colors"
              >
                <span>Ler Política de Privacidade completa</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Solicitar Exclusão */}
            <div>
              <h3 className="font-semibold text-sm text-slate-700 mb-1">Solicitar exclusão de conta</h3>
              <p className="text-xs text-slate-500 mb-3">
                Conforme a LGPD, você pode solicitar a exclusão dos seus dados. Sua conta será desativada e os dados removidos em até 15 dias.
              </p>
              {lgpdMensagem ? (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                  {lgpdMensagem}
                </div>
              ) : (
                <Button
                  onClick={() => setShowExclusaoConfirm(true)}
                  variant="outline"
                  className="w-full h-11 border-red-200 text-red-600 hover:bg-red-50"
                >
                  Solicitar exclusão da minha conta
                </Button>
              )}
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
