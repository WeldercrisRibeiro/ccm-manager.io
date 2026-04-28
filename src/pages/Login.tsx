import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, User, Loader2, ChevronRight, AlertCircle, Sun, Moon } from 'lucide-react';
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden text-foreground">
      {/* Decorative background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-8 right-8 p-4 rounded-2xl bg-card border border-border shadow-xl hover:bg-secondary transition-all z-50"
      >
        {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
      </button>

      <div className="w-full max-w-[450px] z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex p-5 rounded-[2rem] bg-primary shadow-2xl shadow-primary/20 mb-6 animate-bounce">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">
            Mergulho <span className="text-primary">Portal</span>
          </h1>
          <p className="text-muted-foreground font-bold tracking-widest text-xs mt-2 uppercase">Administração Independente</p>
        </div>

        <div className="bg-card border border-border p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}
            {!error && (
              <div className="p-4 bg-primary/10 border border-primary/20 text-primary text-sm rounded-2xl">
                Use seu usuário administrador. Se o login não responder, confirme a URL da API em <code>VITE_API_URL</code>.
                <div className="mt-2 text-xs opacity-70 break-all">
                  API ativa: <code>{getApiBaseUrl()}</code>
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
  );
};

export default Login;
