import { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Search,
  Play,
  Loader2,
  ShieldCheck,
  UserPlus,
  KeyRound,
  UserCog,
  Settings2,
  Download,
  Upload,
  AlertTriangle,
  X,
  LogOut,
  Sun,
  Moon
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { cn } from "../lib/utils";

interface ScriptField {
  name: string;
  label: string;
  type: "text" | "password" | "email" | "select" | "user_select" | "file";
  required: boolean;
  options?: string[];
}

interface AdminScript {
  id: string;
  name: string;
  description: string;
  fields: ScriptField[];
}

interface UserSummary {
  id: string;
  email: string;
  profile: {
    fullName: string;
    username: string;
  };
}

const Dashboard = () => {
  const [scripts, setScripts] = useState<AdminScript[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedScript, setSelectedScript] = useState<AdminScript | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const { logout, user: currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchScripts();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const fetchScripts = async () => {
    try {
      const response = await api.get("/maintenance/scripts");
      setScripts(response.data);
      setStatusMessage("Ferramentas carregadas com sucesso.");
      setStatusType("success");
    } catch (error) {
      setStatusMessage("Erro ao carregar scripts. Verifique a conexão com o backend.");
      setStatusType("error");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/maintenance/users");
      setUsers(response.data);
    } catch (error) {
      setStatusMessage("Não foi possível carregar a lista de usuários.");
      setStatusType("error");
    }
  };

  const handleScriptSelect = (script: AdminScript) => {
    setSelectedScript(script);
    setFormData({});
    setOutput([]);
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Lógica "Smart" para facilitar o preenchimento (Consistente com Mergulho Connect)
      if (selectedScript?.id === 'create-user') {
        if (name === 'fullName' && value && !prev.username) {
          const suggestedUsername = value.trim().toLowerCase().split(' ')[0].replace(/\s+/g, ".");
          newData.username = suggestedUsername;
          if (!prev.email || prev.email.endsWith('@ccmergulho.com')) {
            newData.email = suggestedUsername + "@ccmergulho.com";
          }
        }

        if (name === 'username' && value) {
          const cleanUser = value.trim().toLowerCase().replace(/\s+/g, ".");
          if (!prev.email || prev.email.endsWith('@ccmergulho.com')) {
            newData.email = cleanUser + "@ccmergulho.com";
          }
        }
      }

      return newData;
    });
  };

  const handleFileUpload = async (fieldName: string, file: File) => {
    setUploading(fieldName);
    const fd = new FormData();
    fd.append("file", file);

    try {
      addLog(`Enviando arquivo: ${file.name}...`);
      const response = await api.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      handleInputChange(fieldName, response.data.url);
      addLog(`Arquivo enviado com sucesso: ${response.data.url}`);
    } catch (error) {
      addLog(`Erro no upload: ${file.name}`);
    } finally {
      setUploading(null);
    }
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setOutput(prev => [...prev, `[${time}] ${msg}`]);
  };

  const executeScript = async () => {
    if (!selectedScript) return;

    // Garante que campos de email/login sem @ sejam completados antes de enviar
    const submissionData = { ...formData };
    selectedScript.fields.forEach(field => {
      const isEmailLike = field.type === 'email' || field.name.toLowerCase() === 'email' || field.name.toLowerCase() === 'login';
      if (isEmailLike && submissionData[field.name] && !submissionData[field.name].includes('@')) {
        submissionData[field.name] = submissionData[field.name].trim().toLowerCase() + "@ccmergulho.com";
      }
    });

    setConfirmOpen(false);
    setLoading(true);
    addLog(`Iniciando execução de: ${selectedScript.name}...`);

    try {
      const response = await api.post(`/maintenance/run/${selectedScript.id}`, submissionData);
      addLog(`SUCESSO: ${response.data.message || "Script concluído"}`);
      if (selectedScript.id === 'create-user') setFormData({});
      setStatusMessage("Operação concluída com sucesso.");
      setStatusType("success");
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Erro desconhecido";
      addLog(`ERRO: ${errMsg}`);
      setStatusMessage(`Falha na execução: ${errMsg}`);
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleExportLogs = async () => {
    try {
      const response = await api.get("/maintenance/logs/export", { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'maintenance_audit_log.txt');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setStatusMessage("Auditoria exportada com sucesso.");
      setStatusType("success");
    } catch (error) {
      setStatusMessage("Erro ao exportar logs.");
      setStatusType("error");
    }
  };

  const filteredScripts = scripts.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScriptIcon = (id: string) => {
    switch (id) {
      case 'create-user': return <UserPlus className="h-5 w-5" />;
      case 'change-password': return <KeyRound className="h-5 w-5" />;
      case 'update-profile': return <UserCog className="h-5 w-5" />;
      case 'update-role': return <ShieldCheck className="h-5 w-5" />;
      default: return <Terminal className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-2 rounded-xl">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground uppercase">CCM Manager</h1>
              <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">Portal Administrativo</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary transition-all border border-border"
              title="Alternar Tema"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-foreground">{currentUser?.profile?.fullName || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-3 rounded-xl bg-secondary hover:bg-destructive/10 hover:text-destructive transition-all border border-border"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Buscar ferramenta..."
              className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
            {filteredScripts.map((script) => (
              <button
                key={script.id}
                onClick={() => handleScriptSelect(script)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all duration-300 group",
                  selectedScript?.id === script.id
                    ? "bg-primary border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                    : "bg-card hover:bg-secondary border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl transition-colors",
                    selectedScript?.id === script.id ? "bg-white/20 text-white" : "bg-primary/5 text-primary group-hover:bg-primary/10"
                  )}>
                    {getScriptIcon(script.id)}
                  </div>
                  <div>
                    <h3 className={cn(
                      "font-bold transition-colors",
                      selectedScript?.id === script.id ? "text-white" : "text-foreground"
                    )}>
                      {script.name}
                    </h3>
                    <p className={cn(
                      "text-xs mt-1 line-clamp-1 transition-colors",
                      selectedScript?.id === script.id ? "text-white/80" : "text-muted-foreground"
                    )}>
                      {script.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleExportLogs}
            className="w-full flex items-center justify-center gap-3 p-4 bg-card border border-border rounded-2xl hover:bg-secondary transition-all text-sm font-bold text-muted-foreground hover:text-foreground group shadow-sm"
          >
            <Download className="h-5 w-5 group-hover:translate-y-0.5 transition-transform" />
            Exportar Auditoria (TXT)
          </button>
        </aside>

        {/* Content */}
        <section className="lg:col-span-8 space-y-8">
          {statusMessage && (
            <div
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-300",
                statusType === "error"
                  ? "border-destructive/20 bg-destructive/5 text-destructive"
                  : statusType === "success"
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
                    : "border-primary/20 bg-primary/5 text-primary"
              )}
            >
              {statusMessage}
            </div>
          )}
          {selectedScript ? (
            <div className="animate-in slide-in-from-right-8 duration-500 space-y-8">
              <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
                <div className="p-8 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                        {getScriptIcon(selectedScript.id)}
                        {selectedScript.name}
                      </h2>
                      <p className="text-muted-foreground mt-2">{selectedScript.description}</p>
                    </div>
                    <Badge>{selectedScript.id}</Badge>
                  </div>
                </div>

                <div className="p-8">
                  <form onSubmit={(e) => { e.preventDefault(); setConfirmOpen(true); }} className="space-y-8" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedScript.fields.map((field) => (
                        <div key={field.name} className={`space-y-2 ${field.type === 'password' ? 'md:col-span-2' : ''}`}>
                          <label className="text-sm font-bold text-muted-foreground ml-1">
                            {field.label} {field.required && <span className="text-primary">*</span>}
                          </label>

                          {field.type === "user_select" ? (
                            <select
                              className="w-full h-14 px-4 bg-secondary/50 border border-border rounded-xl focus:border-primary outline-none text-foreground transition-all"
                              value={formData[field.name] || ""}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              required={field.required}
                            >
                              <option value="">Selecione um membro...</option>
                              {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.profile?.fullName || u.email} ({u.email})
                                </option>
                              ))}
                            </select>
                          ) : field.type === "select" ? (
                            <select
                              className="w-full h-14 px-4 bg-secondary/50 border border-border rounded-xl focus:border-primary outline-none text-foreground transition-all"
                              value={formData[field.name] || ""}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              required={field.required}
                            >
                              <option value="">Selecione...</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : field.type === "file" ? (
                            <div className="flex gap-4">
                              <input
                                type="text"
                                className="flex-1 h-14 px-4 bg-secondary/30 border border-border rounded-xl text-muted-foreground"
                                value={formData[field.name] || ""}
                                readOnly
                                placeholder="Nenhum arquivo enviado"
                              />
                              <button
                                type="button"
                                className="h-14 px-6 bg-secondary hover:bg-muted rounded-xl transition-all border border-border flex items-center justify-center"
                                disabled={!!uploading}
                                onClick={() => document.getElementById(`file-${field.name}`)?.click()}
                              >
                                {uploading === field.name ? <Loader2 className="animate-spin h-5 w-5" /> : <Upload className="h-5 w-5" />}
                              </button>
                              <input
                                id={`file-${field.name}`}
                                type="file"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(field.name, e.target.files[0])}
                              />
                            </div>
                          ) : (
                            <div className="relative flex items-center">
                              <input
                                type={(field.type === 'email' || field.name === 'email') ? 'text' : field.type}
                                required={field.required}
                                className={cn(
                                  "w-full h-14 px-4 bg-secondary/50 border border-border rounded-xl focus:border-primary outline-none text-foreground placeholder:text-muted-foreground/50 transition-all",
                                  (field.type === 'email' || field.name === 'email') && !formData[field.name]?.includes('@') && formData[field.name]?.length > 0 && "pr-[140px]"
                                )}
                                placeholder={field.label}
                                value={formData[field.name] || ""}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                onBlur={(e) => {
                                  const val = e.target.value;
                                  const isEmailField = field.type === 'email' || field.name === 'email';
                                  if (isEmailField && val && !val.includes('@')) {
                                    handleInputChange(field.name, val.trim().toLowerCase() + "@ccmergulho.com");
                                  }
                                }}
                              />
                              {(field.type === 'email' || field.name === 'email') && !formData[field.name]?.includes('@') && formData[field.name]?.length > 0 && (
                                <span className="absolute right-3 text-muted-foreground pointer-events-none font-medium">
                                  @ccmergulho.com
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground italic">* Campos obrigatórios</p>
                      <button
                        type="submit"
                        disabled={loading || !!uploading}
                        className="h-14 px-12 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-3"
                      >
                        {loading ? <Loader2 className="animate-spin h-6 w-6" /> : <Play className="h-5 w-5 fill-current" />}
                        EXECUTAR SCRIPT
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Terminal */}
              <div className="bg-muted/30 rounded-3xl border border-border shadow-inner overflow-hidden">
                <div className="px-6 py-4 bg-card border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Logs</span>
                  </div>
                  <button onClick={() => setOutput([])} className="p-1 hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div
                  ref={terminalRef}
                  className="h-60 overflow-y-auto p-6 font-mono text-sm custom-scrollbar"
                >
                  {output.length > 0 ? (
                    output.map((line, i) => (
                      <div key={`${line}-${i}`} className={cn(
                        "mb-1 flex gap-3",
                        line.includes("ERRO") ? "text-destructive" :
                          line.includes("SUCESSO") ? "text-emerald-600" : "text-muted-foreground"
                      )}>
                        <span className="opacity-40">❯</span>
                        <span>{line}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground/30 italic">Ready for commands...</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 border-4 border-dashed border-muted rounded-[3rem] bg-card/50 space-y-6">
              <div className="p-10 rounded-full bg-muted shadow-inner text-muted-foreground/20">
                <Settings2 className="h-24 w-24" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-foreground">Central de Operações</h3>
                <p className="text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed font-medium">
                  Bem-vindo ao Portal de Manutenção do Mergulho Connect. Escolha uma ferramenta na barra lateral para interagir diretamente com os dados do sistema.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-[2rem] shadow-2xl max-w-md w-full p-8 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 text-amber-500">
              <div className="p-3 bg-amber-500/10 rounded-2xl">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black">Confirmar Operação</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed font-medium">
              Você está prestes a executar o script <strong>{selectedScript?.name}</strong>. Esta ação terá efeito imediato e permanente no banco de dados.
            </p>
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 h-14 bg-secondary hover:bg-muted text-foreground font-bold rounded-2xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={executeScript}
                className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="px-3 py-1 bg-secondary border border-border text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-full">
    {children}
  </span>
);

export default Dashboard;
