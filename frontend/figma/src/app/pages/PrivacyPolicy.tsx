import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Shield, Eye, Trash2, Download, Mail, FileText } from 'lucide-react';

interface PoliticaData {
  titulo: string;
  versao: string;
  dataVigencia: string;
  dadosColetados: string;
  finalidade: string;
  compartilhamento: string;
  direitos: string;
  contato: string;
}

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [politica, setPolitica] = useState<PoliticaData | null>(null);

  useEffect(() => {
    fetch('/api/lgpd/politica-privacidade')
      .then((res) => res.json())
      .then(setPolitica)
      .catch(() => setPolitica(null));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#394A7D] text-white px-4 pt-10 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{politica?.titulo ?? 'Política de Privacidade'}</h1>
            {politica && (
              <p className="text-blue-200 text-xs mt-0.5">
                Versão {politica.versao} • Em vigor desde {politica.dataVigencia}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-4">
        {/* Introdução */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-600 leading-relaxed">
            A <strong>ConectArena</strong> respeita sua privacidade e está comprometida com a proteção dos seus dados
            pessoais, em conformidade com a{' '}
            <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
          </p>
        </div>

        {/* Dados coletados */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-slate-800">Dados que coletamos</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {politica?.dadosColetados ?? '—'}
          </p>
        </div>

        {/* Finalidade */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="font-semibold text-slate-800">Para que usamos seus dados</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {politica?.finalidade ?? '—'}
          </p>
        </div>

        {/* Compartilhamento */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="font-semibold text-slate-800">Compartilhamento de dados</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {politica?.compartilhamento ?? '—'}
          </p>
        </div>

        {/* Direitos */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="font-semibold text-slate-800">Seus direitos (LGPD)</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {politica?.direitos ?? '—'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Acessar seus dados',
              'Corrigir informações',
              'Portabilidade',
              'Solicitar exclusão',
            ].map((direito) => (
              <div
                key={direito}
                className="flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                <span className="text-xs text-orange-800 font-medium">{direito}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exclusão */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="font-semibold text-slate-800">Exclusão de dados</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Você pode solicitar a exclusão da sua conta e de todos os seus dados pessoais a qualquer momento,
            diretamente pelo seu perfil na plataforma. A solicitação será processada em até 15 dias úteis.
          </p>
        </div>

        {/* Contato */}
        <div className="bg-[#394A7D] rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-blue-200" />
            <h2 className="font-semibold">Dúvidas sobre privacidade?</h2>
          </div>
          <p className="text-sm text-blue-200 leading-relaxed">
            Entre em contato com nosso Encarregado de Proteção de Dados (DPO):
          </p>
          <p className="text-white font-medium mt-1">{politica?.contato ?? 'privacidade@conectarena.com.br'}</p>
        </div>
      </div>
    </div>
  );
}
