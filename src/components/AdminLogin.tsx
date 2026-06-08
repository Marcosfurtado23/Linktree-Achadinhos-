import React, { useState } from 'react';
import { firebaseUtils, isUsingMockDb } from '../firebase';
import { motion } from 'motion/react';
import { AlertCircle, KeyRound, Mail, Sparkles, UserPlus, LogIn, RefreshCw, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: (user: any) => void;
  onBackToSite: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export function AdminLogin({ onSuccess, onBackToSite }: AdminLoginProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const translateFirebaseError = (code: string) => {
    switch (code) {
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'E-mail ou Senha incorretos! Por favor, tente novamente.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está sendo utilizado por outro administrador.';
      case 'auth/weak-password':
        return 'A senha deve conter pelo menos 6 caracteres.';
      case 'auth/invalid-email':
        return 'Por favor, insira um endereço de e-mail válido.';
      default:
        return 'Erro ao tentar autenticar. Verifique sua conexão e tente novamente.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!email) {
      setErrorMsg('Por favor, preencha o e-mail.');
      setLoading(false);
      return;
    }

    if (mode !== 'forgot' && !password) {
      setErrorMsg('Por favor, preencha a senha.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const user = await firebaseUtils.signInUser(email, password);
        setSuccessMsg('Login realizado com sucesso! Redirecionando...');
        setTimeout(() => onSuccess(user), 1000);
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          setErrorMsg('As senhas digitadas não coincidem.');
          setLoading(false);
          return;
        }
        const user = await firebaseUtils.signUpUser(email, password);
        setSuccessMsg('Cadastro realizado com sucesso! Bem-vindo.');
        setTimeout(() => onSuccess(user), 1200);
      } else {
        await firebaseUtils.resetUserPassword(email);
        setSuccessMsg('E-mail de recuperação enviado com sucesso!');
      }
    } catch (err: any) {
      console.error(err);
      // Display error "todo laranja" (all orange style alert box)
      const msg = err.message || '';
      if (msg.includes('wrong-password') || msg.includes('user-not-found') || msg.includes('credential')) {
        setErrorMsg('E-mail ou Senha incorretos! Por favor, verifique seus dados.');
      } else {
        setErrorMsg(translateFirebaseError(err.code || msg));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F0] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Immersive Orange Geometric elements in background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-orange-500/20 z-10"
      >
        {/* Banner principal "todo laranja" (Shopee-like header theme color) */}
        <div className="bg-[#EE4D2D] p-8 text-white relative text-center">
          <div className="absolute top-4 left-4">
            <button 
              onClick={onBackToSite}
              className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao site</span>
            </button>
          </div>

          <div className="flex justify-center mb-2 mt-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 100 100" className="w-9 h-9 text-[#EE4D2D] font-extrabold">
                <path d="M50,15 C42,15 36,21 36,29 L36,32 L64,32 L64,29 C64,21 58,15 50,15 Z" fill="none" stroke="#EE4D2D" strokeWidth="6" />
                <rect x="18" y="32" width="64" height="54" rx="10" fill="#EE4D2D" />
                <text x="50" y="73" fill="white" fontSize="38" fontWeight="black" textAnchor="middle" fontFamily="Outfit">S</text>
              </svg>
            </div>
          </div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight">
            Achadinhos da Lu ADM
          </h2>
          <p className="text-orange-100/90 text-xs mt-1 font-medium">
            Gerenciamento geral da página de promoções
          </p>

          {isUsingMockDb && (
            <div className="mt-3 bg-amber-500/30 text-white text-[10px] px-2.5 py-1 rounded-full inline-flex items-center gap-1 mx-auto border border-white/20">
              <Sparkles className="w-3 h-3 fill-amber-200" />
              Modo Sandbox Local Ativo (Para testes rápidos)
            </div>
          )}
        </div>

        {/* Form area */}
        <div className="p-8 space-y-6">
          
          {/* USER WARNING BANNER "todo laranja" (All orange error alert badge when authentication fails) */}
          {errorMsg && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#FFEFE5] text-[#EE4D2D] border border-orange-500 p-4 rounded-2xl flex items-start gap-2.5 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold leading-relaxed">
                <div className="font-bold underline uppercase mb-0.5">Falha de Autenticação</div>
                {errorMsg}
              </div>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-50 text-emerald-800 border border-emerald-300 p-4 rounded-2xl flex items-start gap-2.5 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold leading-relaxed">
                {successMsg}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail Administrativo</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-orange-400" />
                <input 
                  type="email"
                  required
                  placeholder="Seu email cadastrado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border-2 border-orange-100 rounded-xl text-sm focus:outline-none focus:border-[#EE4D2D] font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Senha Secreta</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-orange-400" />
                  <input 
                    type="password"
                    required
                    placeholder="Sua senha secreta de acesso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border-2 border-orange-100 rounded-xl text-sm focus:outline-none focus:border-[#EE4D2D] font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmar Senha</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-orange-400" />
                  <input 
                    type="password"
                    required
                    placeholder="Confirme a senha securitária"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border-2 border-orange-100 rounded-xl text-sm focus:outline-none focus:border-[#EE4D2D] font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#EE4D2D] hover:bg-[#E33E1D] text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-500/20 active:translate-y-0.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Entrar no Painel</span>
                </>
              ) : mode === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Registrar Novo ADM</span>
                </>
              ) : (
                <span>Recuperar Minha Senha</span>
              )}
            </button>
          </form>

          {/* Navigation alternatives within form */}
          <div className="border-t border-dashed border-orange-100 pt-5 flex flex-col gap-2.5 items-center text-xs">
            {mode === 'login' && (
              <>
                <button 
                  onClick={() => { setMode('forgot'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-[#EE4D2D] hover:underline font-bold"
                >
                  Esqueceu sua senha? Clique aqui
                </button>
                <div className="text-slate-400 font-medium">
                  Não possui conta? {' '}
                  <button 
                    onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
                    className="text-[#EE4D2D] hover:underline font-bold ml-1"
                  >
                    Cadastre-se grátis
                  </button>
                </div>
              </>
            )}

            {mode === 'register' && (
              <div className="text-slate-400 font-medium">
                Já possui credenciais? {' '}
                <button 
                  onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-[#EE4D2D] hover:underline font-bold ml-1"
                >
                  Fazer Login
                </button>
              </div>
            )}

            {mode === 'forgot' && (
              <button 
                onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className="text-slate-400 hover:text-slate-600 underline font-semibold flex items-center gap-1.5"
              >
                Voltar ao Login administrativo
              </button>
            )}
          </div>

        </div>
      </motion.div>

      {/* Guide notice explaining console integration to client */}
      <div className="mt-8 text-center text-[11px] text-slate-500 max-w-sm leading-relaxed font-medium">
        Nota: Este painel se conecta ao Firebase. Caso use produção, certifique-se de habilitar o provedor de login por <strong>E-mail/Senha</strong> no console do menu de Authentication no seu Firebase.
      </div>

    </div>
  );
}
