import { useState, useEffect } from 'react';
import { DollarSign, Ticket, Calendar, Users, TrendingUp, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { fetchAnalytics, type AnalyticsData } from '../services/api';

const EMPTY_ANALYTICS: AnalyticsData = {
  eventMetrics: [],
  totalRevenue: 0,
  ticketsSold: 0,
  totalEvents: 0,
  ticketMedio: 0,
  salesByCategory: [
    { name: 'Futebol', value: 0 },
    { name: 'Música', value: 0 },
    { name: 'Teatro', value: 0 },
    { name: 'Outros', value: 0 },
  ],
  topEvents: [],
  salesByDay: [
    { day: 'Seg', vendas: 0 },
    { day: 'Ter', vendas: 0 },
    { day: 'Qua', vendas: 0 },
    { day: 'Qui', vendas: 0 },
    { day: 'Sex', vendas: 0 },
    { day: 'Sáb', vendas: 0 },
    { day: 'Dom', vendas: 0 },
  ],
  salesByMonth: [],
};

export default function Analytics() {
  const COLORS = ['#DC2626', '#1E40AF', '#F59E0B', '#64748b'];
  const [data, setData] = useState<AnalyticsData>(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .catch(() => {/* mantém EMPTY_ANALYTICS */})
      .finally(() => setLoading(false));
  }, []);

  const formatRevenue = (v: number) =>
    v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v.toFixed(2)}`;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-[#394A7D] text-white px-4 py-8 relative">
        <h1 className="text-2xl font-bold mb-2">Analytics</h1>
        <p className="text-blue-100 leading-relaxed mb-4">
          Acompanhe métricas e desempenho em tempo real
        </p>
      </div>

      {loading ? (
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="p-4 space-y-4 pb-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
              <CardContent className="pt-4 pb-4">
                <div className="text-center">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-xs text-slate-600 mb-1">Receita</p>
                  <p className="text-xl font-bold text-red-600">{formatRevenue(data.totalRevenue)}</p>
                  <p className="text-xs text-slate-400 mt-1">total acumulado</p>
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
                  <p className="text-xl font-bold text-blue-600">{data.ticketsSold.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-slate-400 mt-1">ingressos</p>
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
                  <p className="text-xl font-bold text-purple-600">{data.totalEvents}</p>
                  <p className="text-xs text-slate-400 mt-1">no sistema</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="pt-4 pb-4">
                <div className="text-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-xs text-slate-600 mb-1">Ticket Médio</p>
                  <p className="text-xl font-bold text-orange-600">
                    {data.ticketMedio > 0 ? `R$ ${data.ticketMedio.toFixed(0)}` : 'R$ —'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">por compra</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vendas por Dia */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Vendas por Dia da Semana</span>
                <Eye className="w-4 h-4 text-slate-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.salesByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#64748b" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(v) => [`${v} ingressos`, 'Vendas']}
                    />
                    <Bar dataKey="vendas" fill="#DC2626" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Crescimento Mensal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Crescimento Mensal</span>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.salesByMonth.every(m => m.vendas === 0) ? (
                <p className="text-center text-slate-400 py-8 text-sm">Nenhuma venda registrada ainda</p>
              ) : (
                <div className="h-[250px] -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.salesByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#64748b" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#64748b" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(v) => [`${v} ingressos`, 'Vendas']}
                      />
                      <Line type="monotone" dataKey="vendas" stroke="#305BF2" strokeWidth={2} dot={{ fill: '#305BF2', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribuição por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Receita por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {data.salesByCategory.every(c => c.value === 0) ? (
                <p className="text-center text-slate-400 py-8 text-sm">Nenhuma compra registrada ainda</p>
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.salesByCategory.filter(c => c.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {data.salesByCategory.filter(c => c.value > 0).map((entry, index) => (
                          <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(v: number) => [`R$ ${v.toFixed(2)}`, 'Receita']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topEvents.length === 0 ? (
                <p className="text-center text-slate-400 py-4 text-sm">Nenhuma venda registrada ainda</p>
              ) : (
                <div className="space-y-3">
                  {data.topEvents.map((ev, index) => (
                    <div key={ev.name} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        index === 0 ? 'bg-red-100' : index === 1 ? 'bg-blue-100' : 'bg-slate-100'
                      }`}>
                        <span className={`text-sm font-bold ${
                          index === 0 ? 'text-red-600' : index === 1 ? 'text-blue-600' : 'text-slate-600'
                        }`}>{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{ev.name}</p>
                        <p className="text-xs text-slate-500">{ev.tickets.toLocaleString('pt-BR')} ingressos</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-green-600">
                          R$ {ev.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Métricas Detalhadas (História 04.1 e 04.2) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Estatísticas Detalhadas dos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.eventMetrics.length === 0 ? (
                <p className="text-center text-slate-400 py-4 text-sm">Nenhum evento registrado ainda</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b">
                      <tr>
                        <th className="px-4 py-3">Evento</th>
                        <th className="px-4 py-3">Data Prevista</th>
                        <th className="px-4 py-3 text-center">Visualizações</th>
                        <th className="px-4 py-3 text-center">Interesse</th>
                        <th className="px-4 py-3 text-center">Vendidos</th>
                        <th className="px-4 py-3 text-center">Ocupação (Estimada)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.eventMetrics.map((ev) => (
                        <tr key={ev.id} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800 border-r">{ev.name}</td>
                          <td className="px-4 py-3 text-slate-600 border-r">
                            {ev.date.substring(0, 10).split('-').reverse().join('/')}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600 border-r">
                            <span className="flex items-center justify-center gap-1">
                              <Eye className="w-3 h-3 text-blue-500" />
                              {ev.views.toLocaleString('pt-BR')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center border-r">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              ev.interest === 'Alto' ? 'bg-green-100 text-green-700' :
                              ev.interest === 'Médio' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {ev.interest}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600 border-r">
                            {ev.ticketsSold.toLocaleString('pt-BR')} <span className="text-xs text-slate-400">/ {ev.totalCapacity.toLocaleString('pt-BR')}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="w-full bg-slate-200 rounded-full h-2.5 mb-1 max-w-[80px] mx-auto overflow-hidden">
                              <div className={`h-2.5 rounded-full ${
                                ev.occupancyRate > 80 ? 'bg-green-500' : ev.occupancyRate > 40 ? 'bg-amber-500' : 'bg-blue-500'
                              }`} style={{ width: `${ev.occupancyRate}%` }}></div>
                            </div>
                            <span className="text-xs font-semibold text-slate-600">{ev.occupancyRate}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo */}
          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-blue-50">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">
                  {data.ticketsSold > 0 ? 'Vendas em andamento!' : 'Aguardando primeiras vendas'}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {data.ticketsSold > 0
                    ? `${data.ticketsSold} ingresso${data.ticketsSold > 1 ? 's' : ''} vendido${data.ticketsSold > 1 ? 's' : ''} com receita total de R$ ${data.totalRevenue.toFixed(2)}`
                    : 'Os dados aparecerão aqui conforme as compras forem realizadas.'}
                </p>
                <div className="flex gap-2 justify-center">
                  <div className="px-4 py-2 bg-red-100 rounded-lg">
                    <p className="text-xs text-slate-600">Total de Eventos</p>
                    <p className="text-lg font-bold text-red-600">{data.totalEvents}</p>
                  </div>
                  <div className="px-4 py-2 bg-blue-100 rounded-lg">
                    <p className="text-xs text-slate-600">Ticket Médio</p>
                    <p className="text-lg font-bold text-blue-600">
                      {data.ticketMedio > 0 ? `R$ ${data.ticketMedio.toFixed(0)}` : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
