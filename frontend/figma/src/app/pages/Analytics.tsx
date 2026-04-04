import { DollarSign, Ticket, Calendar, Users, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { analyticsData } from '../data/mockData';

export default function Analytics() {
  const COLORS = ['#DC2626', '#1E40AF', '#F59E0B', '#64748b'];

  // Dados de crescimento
  const growthData = [
    { month: 'Jan', vendas: 4200, visitantes: 12000 },
    { month: 'Fev', vendas: 5100, visitantes: 14500 },
    { month: 'Mar', vendas: 6800, visitantes: 18200 },
    { month: 'Abr', vendas: 5900, visitantes: 16100 },
    { month: 'Mai', vendas: 7200, visitantes: 19800 },
    { month: 'Jun', vendas: 8500, visitantes: 22400 },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-[#394A7D] text-white px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Analytics</h1>
        <p className="text-blue-100 leading-relaxed">
          Acompanhe métricas e desempenho em tempo real
        </p>
      </div>

      <div className="p-4 space-y-4 pb-4">
        {/* Key Metrics - Grid 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-xs text-slate-600 mb-1">Receita</p>
                <p className="text-xl font-bold text-red-600">
                  R$ {(analyticsData.totalRevenue / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Ticket className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs text-slate-600 mb-1">Vendidos</p>
                <p className="text-xl font-bold text-blue-600">
                  {(analyticsData.ticketsSold / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +8%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs text-slate-600 mb-1">Eventos</p>
                <p className="text-xl font-bold text-purple-600">{analyticsData.totalEvents}</p>
                <p className="text-xs text-slate-500 mt-1">Este mês</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-xs text-slate-600 mb-1">Visitantes</p>
                <p className="text-xl font-bold text-orange-600">
                  {(analyticsData.uniqueVisitors / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +15%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparativo Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Crescimento Mensal</span>
              <Eye className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11 }}
                    stroke="#64748b"
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    stroke="#64748b"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="vendas" 
                    stroke="#DC2626" 
                    strokeWidth={3}
                    dot={{ fill: '#DC2626', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitantes" 
                    stroke="#1E40AF" 
                    strokeWidth={3}
                    dot={{ fill: '#1E40AF', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span className="text-xs text-slate-600">Vendas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-xs text-slate-600">Visitantes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vendas por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 11 }}
                    stroke="#64748b"
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    stroke="#64748b"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="vendas" fill="#DC2626" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.salesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.salesByCategory.map((entry, index) => (
                      <Cell key={`pie-cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topEvents.map((event, index) => (
                <div key={event.name} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    index === 0 ? 'bg-red-100' : index === 1 ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    <span className={`text-sm font-bold ${
                      index === 0 ? 'text-red-600' : index === 1 ? 'text-blue-600' : 'text-slate-600'
                    }`}>{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{event.name}</p>
                    <p className="text-xs text-slate-500">
                      {event.tickets.toLocaleString('pt-BR')} ingressos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-green-600">
                      R$ {event.revenue.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Statistics */}
        <Card className="bg-gradient-to-br from-slate-50 to-white">
          <CardHeader>
            <CardTitle className="text-base">Dispositivos de Acesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 font-medium">📱 Mobile</span>
                  <span className="text-sm font-bold text-red-600">50%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-red-600 h-full rounded-full" style={{ width: '50%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 font-medium">💻 Desktop</span>
                  <span className="text-sm font-bold text-blue-600">45%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 font-medium">📟 Tablet</span>
                  <span className="text-sm font-bold text-slate-600">5%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-600 h-full rounded-full" style={{ width: '5%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-blue-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Desempenho Excelente!</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Crescimento de <span className="font-bold text-red-600">+12%</span> em vendas e 
                <span className="font-bold text-blue-600"> +15%</span> em visitantes este mês
              </p>
              <div className="flex gap-2 justify-center">
                <div className="px-4 py-2 bg-red-100 rounded-lg">
                  <p className="text-xs text-slate-600">Taxa de Conversão</p>
                  <p className="text-lg font-bold text-red-600">8.5%</p>
                </div>
                <div className="px-4 py-2 bg-blue-100 rounded-lg">
                  <p className="text-xs text-slate-600">Ticket Médio</p>
                  <p className="text-lg font-bold text-blue-600">R$ 156</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}