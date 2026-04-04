import { useState } from 'react';
import { Link } from 'react-router';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import logoImage from '@/assets/65b9ba7a0a782428c87c0147cf8dad9bd71e4a3c.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulação de envio de e-mail - em produção, fazer chamada à API real
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err) {
      setError('Erro ao enviar e-mail de recuperação');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#394A7D] via-[#2d3b63] to-[#394A7D] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">E-mail enviado!</h2>
          <p className="text-slate-600 mb-8">
            Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada e
            spam.
          </p>
          <Link
            to="/login"
            className="w-full bg-[#305BF2] text-white py-4 rounded-xl font-medium hover:bg-[#2749c9] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#394A7D] via-[#2d3b63] to-[#394A7D] flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 px-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-white mb-8 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </Link>
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl mx-auto p-3 mb-4">
            <img src={logoImage} alt="ConectArena" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Esqueceu a senha?</h1>
          <p className="text-slate-200 text-sm">
            Não se preocupe! Enviaremos um link de recuperação
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white rounded-t-3xl shadow-2xl p-6">
        <div className="max-w-md mx-auto">
          <p className="text-slate-600 mb-8">
            Digite seu e-mail cadastrado e enviaremos instruções para redefinir sua senha.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#305BF2] focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#305BF2] text-white py-4 rounded-xl font-medium hover:bg-[#2749c9] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar link de recuperação'
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Dica:</strong> O e-mail pode levar alguns minutos para chegar. Não se esqueça de
              verificar a pasta de spam!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
