import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Image as ImageIcon, MapPin, Clock, DollarSign, Tag, Users, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { createEvent, saveCreatedEventForUser, type ApiEvent } from '../services/api';
import { warnIfOffline } from '../utils/offline';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    data: '', // Will be mapped to YYYY-MM-DDTHH:mm:ss for backend
    horario: '',
    local: 'Arena Pernambuco',
    categoria: 'futebol',
    preco: 0,
    totalIngressos: 46000,
    imagemUrl: 'https://images.unsplash.com/photo-1556816214-ddfb6be60ce6?q=80&w=1080&auto=format&fit=crop',
    destaque: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // If user is not admin theoretically... we just show it anyway for demo purposes.
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (warnIfOffline('publicar evento')) {
      setLoading(false);
      return;
    }
    
    try {
      // Backend expects: 2026-06-15T18:00:00
      const formattedData = `${formData.data}T${formData.horario || '00:00'}:00`;
      
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        data: formattedData,
        horario: formData.horario,
        local: formData.local,
        categoria: formData.categoria,
        preco: Number(formData.preco),
        totalIngressos: Number(formData.totalIngressos),
        ingressosDisponiveis: Number(formData.totalIngressos),
        imagemUrl: formData.imagemUrl,
        destaque: formData.destaque
      };

      const savedEvent = await createEvent(payload);
      if (user?.id) {
        saveCreatedEventForUser(user.id, {
          id: String(savedEvent.id),
          title: savedEvent.nome,
          category: savedEvent.categoria ?? 'outros',
          date: savedEvent.data ? savedEvent.data.substring(0, 10) : '',
          time: savedEvent.horario ?? '',
          image: savedEvent.imagemUrl ?? '',
          price: savedEvent.preco ?? 0,
          availableTickets: savedEvent.ingressosDisponiveis ?? 0,
          totalTickets: savedEvent.totalIngressos ?? 0,
          description: savedEvent.descricao ?? '',
          featured: savedEvent.destaque ?? false,
          featuredUntil: savedEvent.destaqueExpiraEm ?? undefined,
        });
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2500);
      
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Erro ao criar o evento');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center py-10 shadow-lg border-green-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <CardTitle className="text-2xl mb-2 text-slate-800">Evento Criado!</CardTitle>
          <CardDescription className="text-base text-slate-600">O seu evento foi publicado com sucesso.</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-[#394A7D] text-white px-4 py-8">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold mb-1">Publicar Novo Evento</h1>
            <p className="text-blue-100 text-sm">Dashboard Administrativo</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-6 px-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <Tag className="w-5 h-5 text-[#305BF2]" />
                  Informações Básicas
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Evento</label>
                  <input
                    type="text"
                    name="nome"
                    required
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#305BF2] focus:border-transparent outline-none transition-all"
                    placeholder="Ex: Show de Rock, Final do Campeonato..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                  <textarea
                    name="descricao"
                    rows={4}
                    required
                    value={formData.descricao}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#305BF2] focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Detalhes completos sobre o evento..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">Categoria</label>
                    <select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#305BF2] focus:border-transparent outline-none"
                    >
                      <option value="futebol">Futebol</option>
                      <option value="musica">Música</option>
                      <option value="teatro">Teatro</option>
                      <option value="palestras">Palestras</option>
                      <option value="religiosos">Encontros Religiosos</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center justify-between">Imagem URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="url"
                        name="imagemUrl"
                        value={formData.imagemUrl}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#305BF2] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b pb-2 pt-4">
                  <Calendar className="w-5 h-5 text-[#305BF2]" />
                  Data e Agenda
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data (Validação de Conflitos)</label>
                    <input
                      type="date"
                      name="data"
                      required
                      value={formData.data}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#305BF2] text-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Horário de Início</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="time"
                        name="horario"
                        required
                        value={formData.horario}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#305BF2] text-slate-700 outline-none"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Localização</label>
                   <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        name="local"
                        value={formData.local}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 outline-none"
                        readOnly
                      />
                    </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b pb-2 pt-4">
                  <DollarSign className="w-5 h-5 text-[#305BF2]" />
                  Acessibilidade e Financeiro
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor do Ingresso (R$)</label>
                    <input
                      type="number"
                      name="preco"
                      min="0"
                      step="0.01"
                      required
                      value={formData.preco}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#305BF2] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Users className="w-4 h-4"/> Carga de Ingressos</label>
                    <input
                      type="number"
                      name="totalIngressos"
                      min="1"
                      required
                      value={formData.totalIngressos}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#305BF2] outline-none"
                    />
                  </div>
                </div>
              </div>
              
              {/* Promoção Option */}
               <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mt-6">
                 <div className="pt-1">
                   <input
                     type="checkbox"
                     id="destaque"
                     name="destaque"
                     checked={formData.destaque}
                     onChange={handleChange}
                     className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                   />
                 </div>
                 <div>
                   <label htmlFor="destaque" className="font-semibold text-amber-900 cursor-pointer block mb-1">
                     Promover Evento
                   </label>
                   <p className="text-sm text-amber-700">
                     O seu evento aparecerá na aba "Destaques" e no topo das pesquisas por 7 dias. Você aceita o repasse da taxa de impulsionamento em suas métricas?
                   </p>
                 </div>
               </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-medium bg-[#305BF2] hover:bg-[#2347c9] shadow-lg shadow-blue-500/30"
                  disabled={loading}
                >
                  {loading ? 'Validando e Publicando...' : 'Publicar Evento Oficial'}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}