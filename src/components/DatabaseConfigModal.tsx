import React, { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Copy, 
  Check, 
  RefreshCw, 
  Server, 
  Lock, 
  Terminal,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { 
    isDbConnected, 
    dbConnectionInfo, 
    connectDatabase, 
    refreshAll,
    dbLastError
  } = useServer();

  const [host, setHost] = useState(dbConnectionInfo?.host || '137.131.196.66');
  const [port, setPort] = useState(String(dbConnectionInfo?.port || 3306));
  const [user, setUser] = useState(dbConnectionInfo?.user || 'root');
  const [password, setPassword] = useState('MARLEY22@@##');
  const [database, setDatabase] = useState(dbConnectionInfo?.database || 'yurots_db');
  
  const [isLoading, setIsLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [showCommands, setShowCommands] = useState(!isDbConnected);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  useEffect(() => {
    if (dbConnectionInfo) {
      if (dbConnectionInfo.host) setHost(dbConnectionInfo.host);
      if (dbConnectionInfo.port) setPort(String(dbConnectionInfo.port));
      if (dbConnectionInfo.user) setUser(dbConnectionInfo.user);
      if (dbConnectionInfo.database) setDatabase(dbConnectionInfo.database);
    }
  }, [dbConnectionInfo]);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResultMsg(null);

    const res = await connectDatabase({
      host: host.trim(),
      port: Number(port) || 3306,
      user: user.trim(),
      password: password,
      database: database.trim(),
    });

    setIsLoading(false);
    setResultMsg({
      success: res.success,
      text: res.message,
    });

    if (res.success) {
      await refreshAll();
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const setupCommands = [
    {
      id: 'bind',
      title: '1. Liberar MySQL para conexões externas (bind-address = 0.0.0.0)',
      cmd: `sudo sed -i 's/^bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf\nsudo systemctl restart mysql`,
    },
    {
      id: 'grant',
      title: '2. Criar usuário ou dar permissão remota ao banco yurots_db',
      cmd: `sudo mysql -u root -p yurots_db -e "CREATE USER IF NOT EXISTS '${user || 'otserv_web'}'@'%' IDENTIFIED BY '${password || 'SUA_SENHA'}'; GRANT ALL PRIVILEGES ON yurots_db.* TO '${user || 'otserv_web'}'@'%'; FLUSH PRIVILEGES;"`,
    },
    {
      id: 'firewall',
      title: '3. Liberar porta 3306 no firewall do Ubuntu (UFW e Oracle Cloud)',
      cmd: `sudo ufw allow 3306/tcp`,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#121212] border border-[#2A2A2A] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#181818] border-b border-[#2A2A2A] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDbConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif">
                Conexão com o Banco de Dados MySQL
              </h3>
              <p className="text-xs text-gray-400">
                Conecte este site diretamente ao banco <code className="text-[#C9A227]">yurots_db</code> da sua VPS Ubuntu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#252525] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-gray-200 text-xs">
          {/* Status Alert Banner */}
          {isDbConnected ? (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-emerald-300 text-sm">
                  MySQL Conectado com Sucesso!
                </div>
                <div className="text-emerald-400/90 text-xs mt-0.5">
                  O site está lendo e gravando contas e personagens diretamente no banco <strong>{database}</strong> em <strong>{host}:{port}</strong>.
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-300 text-sm">
                  Banco MySQL Desconectado
                </div>
                <div className="text-amber-400/90 text-xs mt-0.5">
                  {dbLastError 
                    ? `Erro: ${dbLastError}`
                    : 'Preencha os dados de acesso da sua VPS abaixo para que o site puxe e salve as contas reais.'}
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-1">
                  IP / Host da VPS
                </label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="ex: 137.131.196.66"
                  required
                  className="w-full bg-[#181818] border border-[#333] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-1">
                  Porta MySQL
                </label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="3306"
                  required
                  className="w-full bg-[#181818] border border-[#333] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#C9A227]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-1">
                  Usuário MySQL
                </label>
                <input
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="root ou otserv_web"
                  required
                  className="w-full bg-[#181818] border border-[#333] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-1">
                  Senha do MySQL
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha do MySQL"
                    className="w-full bg-[#181818] border border-[#333] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#C9A227]"
                  />
                  <Lock className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-1">
                  Nome do Banco
                </label>
                <input
                  type="text"
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  placeholder="yurots_db"
                  required
                  className="w-full bg-[#181818] border border-[#333] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#C9A227]"
                />
              </div>
            </div>

            {resultMsg && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                resultMsg.success 
                  ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300' 
                  : 'bg-red-950/60 border border-red-500/50 text-red-300'
              }`}>
                {resultMsg.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{resultMsg.text}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowCommands(!showCommands)}
                className="text-gray-400 hover:text-[#C9A227] flex items-center gap-1.5 transition text-xs"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Como liberar o MySQL no Ubuntu?</span>
                {showCommands ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#C9A227] hover:bg-[#b58f1f] disabled:opacity-50 text-black font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 text-xs shadow-lg transition select-none cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Testando Conexão...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Conectar e Sincronizar MySQL</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Ubuntu Instructions Accordion */}
          {showCommands && (
            <div className="bg-[#161616] border border-[#282828] rounded-xl p-4 space-y-3 mt-4">
              <div className="flex items-center gap-2 text-[#C9A227] font-semibold text-xs">
                <Terminal className="w-4 h-4" />
                <span>Passo a Passo no Ubuntu da sua VPS:</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                Por padrão, o MySQL do Ubuntu só aceita conexões locais (<code>127.0.0.1</code>). Para o site poder se conectar, execute os comandos abaixo no terminal do servidor:
              </p>

              <div className="space-y-3 pt-1">
                {setupCommands.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="text-[11px] font-semibold text-gray-300">{item.title}</div>
                    <div className="relative group">
                      <pre className="bg-[#0D0D0D] border border-[#222] rounded-lg p-2.5 text-green-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                        {item.cmd}
                      </pre>
                      <button
                        onClick={() => copyText(item.cmd, item.id)}
                        className="absolute right-2 top-2 bg-[#222] hover:bg-[#333] text-gray-300 px-2 py-1 rounded text-[10px] flex items-center gap-1 transition"
                        title="Copiar comando"
                      >
                        {copiedCmd === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-green-400">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#181818] border-t border-[#2A2A2A] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Suas credenciais são usadas exclusivamente pelo servidor para consultar o banco.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#222] hover:bg-[#2c2c2c] text-gray-300 text-xs transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
