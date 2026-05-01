import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, User, Loader2, ChevronRight, AlertCircle, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const finalEmail = email.includes('@') ? email : `${email}@ccmergulho.com`;
      await login(finalEmail, password);
      navigate('/');
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message;
      setError(message || 'Falha na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden transition-colors duration-500">
      {/* Left Side: Large Logo Section */}
      <div className={cn(
        "hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden transition-all duration-700",
        theme === 'light' 
          ? "bg-gradient-to-br from-[#1e40af] via-[#1d4ed8] to-[#1e3a8a]" 
          : "bg-gradient-to-br from-[#09090b] via-[#111827] to-black"
      )}>
        {/* Background Patterns - Enhanced for better contrast */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-left-12 duration-1000">
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-2xl mb-8">
            <img
              src="/idvmergulho/logo-white.png"
              alt="Logo Mergulho"
              className="w-48 h-48 md:w-64 md:h-64 object-contain hover:scale-105 transition-transform duration-700"
            />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase text-center">
            Mergulho <span className="opacity-60">Portal</span>
          </h1>
          <p className="text-white/70 font-bold tracking-[0.3em] text-sm mt-4 uppercase text-center leading-relaxed">Administração Independente</p>
        </div>

        {/* Decorative Gradient overlay */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Right Side: Login Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Mobile decorative background - Updated for better consistency */}
        <div className="lg:hidden absolute inset-0 -z-10 overflow-hidden">
          <div className={cn(
            "absolute inset-0 transition-colors duration-700",
            theme === 'light' ? "bg-blue-50/50" : "bg-black"
          )} />
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[120px]" />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-8 right-8 p-4 rounded-2xl bg-card border border-border shadow-xl hover:bg-secondary transition-all z-50"
        >
          {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
        </button>

        <div className="w-full max-w-[450px] z-10 animate-in fade-in zoom-in-95 duration-700">
          {/* Mobile-only logo header */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex p-4 rounded-[2rem] bg-white/10 dark:bg-black/20 backdrop-blur-md border border-border shadow-2xl mb-6">
              <img
                src={theme === 'dark' ? "/idvmergulho/logo-white.png" : "/idvmergulho/logo.png"}
                alt="Logo Mergulho"
                className="h-16 w-16"
              />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">
              Mergulho <span className="text-primary">Portal</span>
            </h1>
          </div>

          <div className="bg-card border border-border p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5">
            <h2 className="text-2xl font-black mb-8 lg:block hidden">Acesse sua conta</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}
              {!error && (
                <div className="p-4 bg-primary/10 border border-primary/20 text-primary text-sm rounded-2xl">
                  Use seu usuário administrador.
                  <div className="mt-1 text-xs opacity-70">
                    API: <code>{getApiBaseUrl()}</code>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Acesso</label>
                <div className="relative group flex items-center">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    required
                    className={cn(
                      "block w-full h-14 pl-12 pr-4 bg-secondary/50 border border-border rounded-2xl text-foreground outline-none focus:border-primary transition-all",
                      email && !email.includes('@') && "pr-[140px]"
                    )}
                    placeholder="Usuário"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {email && !email.includes('@') && (
                    <span className="absolute right-4 text-muted-foreground font-medium pointer-events-none">
                      @ccmergulho.com
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    required
                    className="block w-full h-14 pl-12 pr-4 bg-secondary/50 border border-border rounded-2xl text-foreground outline-none focus:border-primary transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Entrar no Portal <ChevronRight className="h-5 w-5" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
