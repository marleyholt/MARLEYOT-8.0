import React from 'react';
import { useServer } from '../context/ServerContext';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle,
  Crown,
  LogOut,
  User,
  Sparkles,
  Download
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    serverConfig, 
    onlineCount,
    currentAccount, 
    logoutAccount, 
    activeTab, 
    setActiveTab, 
    portalSubTab,
    setPortalSubTab,
    isDbConnected,
    setIsDbModalOpen,
    dbLastError,
    isStaff,
    customLogoUrl
  } = useServer();

  const isPortalActive = (sub: string) => activeTab === 'portal' && portalSubTab === sub;

  return (
    <header className="border-b border-[rgba(255,255,255,0.08)] bg-[#111111]/95 backdrop-blur-md sticky top-0 z-50">
      {/* Top Header Row from Variation 6 */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-5 flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.08)]">
        {/* Title Block with Logo */}
        <div 
          onClick={() => { setActiveTab('portal'); setPortalSubTab('news'); }}
          className="cursor-pointer group select-none flex items-center gap-3.5"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 border-[#f8d40d]/60 bg-[#1a1711] shadow-md flex-shrink-0 flex items-center justify-center">
            <img 
              src={customLogoUrl} 
              alt="Marley OT Logo" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="font-display font-black text-xl sm:text-2xl tracking-tight leading-none reggae-text-gradient group-hover:opacity-90 transition-opacity">
              MARLEYOT YUROTS 7.72
            </h1>
            <div className="meta-label mt-1 text-[#f8d40d] flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#f8d40d]"></span>
              <span>OLD SCHOOL RETRO • TIBIA 7.72</span>
            </div>
          </div>
        </div>

        {/* Right Status & Action Block */}
        <div className="flex flex-col items-end gap-2 text-right">
          <div className="flex items-center gap-3">
            {/* Server Online Status */}
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#3ea03c] tracking-wider uppercase">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3ea03c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#3ea03c]"></span>
              </span>
              <span>● SERVER_ONLINE</span>
            </div>

            {/* MySQL Status Chip */}
            {isStaff ? (
              <button
                onClick={() => setIsDbModalOpen(true)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border transition cursor-pointer ${
                  isDbConnected
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60'
                    : 'bg-amber-950/60 border-amber-500/40 text-amber-400 hover:bg-amber-900/60'
                }`}
                title={isDbConnected ? 'MySQL Conectado ao banco' : `MySQL: ${dbLastError || 'Clique para conectar'}`}
              >
                <Database className="w-3 h-3" />
                <span>{isDbConnected ? 'yurots_db' : 'MySQL OFF'}</span>
                {isDbConnected ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-amber-400 animate-pulse" />
                )}
              </button>
            ) : (
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                title="Banco de dados operacional"
              >
                <Database className="w-3 h-3" />
                <span>yurots_db</span>
              </div>
            )}
          </div>

          {/* Action Button & Account Status */}
          <div className="flex items-center gap-2">
            {currentAccount ? (
              <>
                <button
                  onClick={() => { setActiveTab('portal'); setPortalSubTab('download'); }}
                  className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#252525] text-emerald-400 border border-emerald-500/30 rounded text-xs font-mono transition flex items-center gap-1.5 cursor-pointer font-semibold"
                  title="Baixar Cliente 7.72"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Baixar Cliente</span>
                </button>
                <button
                  onClick={() => { setActiveTab('portal'); setPortalSubTab('account'); }}
                  className="btn-jamaica flex items-center gap-1.5"
                  title="Acessar painel de conta"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Conta: {currentAccount.name}</span>
                  {isStaff && <Crown className="w-3 h-3 text-yellow-300 ml-1 inline" />}
                </button>
                <button
                  onClick={() => logoutAccount()}
                  className="px-2.5 py-1.5 bg-[#1a1a1a] hover:bg-[#252525] text-gray-300 border border-[rgba(255,255,255,0.08)] rounded text-xs font-mono transition"
                  title="Desconectar"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setActiveTab('portal'); setPortalSubTab('download'); }}
                  className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#252525] text-emerald-400 border border-emerald-500/30 rounded text-xs font-mono transition flex items-center gap-1.5 cursor-pointer font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Cliente</span>
                </button>
                <button
                  onClick={() => { setActiveTab('portal'); setPortalSubTab('register'); }}
                  className="btn-jamaica"
                >
                  Criar Conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variation 6 Nav Grid */}
      <nav className={`grid w-full border-t border-[rgba(255,255,255,0.08)] bg-[#0d0d0d] ${
        isStaff 
          ? 'grid-cols-2 sm:grid-cols-5 md:grid-cols-10' 
          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6'
      }`}>
        {/* 01 Portal */}
        <button
          id="tab-portal-btn"
          onClick={() => { setActiveTab('portal'); setPortalSubTab('news'); }}
          className={`p-3 sm:px-4 sm:py-3.5 border-r border-[rgba(255,255,255,0.08)] border-b md:border-b-0 font-mono text-xs uppercase cursor-pointer transition-all flex flex-col gap-0.5 text-left ${
            isPortalActive('news')
              ? 'bg-[#f8d40d] text-black font-bold'
              : 'text-white/80 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className={`text-[10px] ${isPortalActive('news') ? 'text-black/70 font-extrabold' : 'text-white/40'}`}>01</span>
          <span className="truncate">Portal</span>
        </button>

        {/* 02 Account */}
        <button
          id="tab-account-btn"
          onClick={() => { setActiveTab('portal'); setPortalSubTab(currentAccount ? 'account' : 'login'); }}
          className={`p-3 sm:px-4 sm:py-3.5 border-r border-[rgba(255,255,255,0.08)] border-b md:border-b-0 font-mono text-xs uppercase cursor-pointer transition-all flex flex-col gap-0.5 text-left ${
            isPortalActive('account') || isPortalActive('login') || isPortalActive('register')
              ? 'bg-[#f8d40d] text-black font-bold'
              : 'text-white/80 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className={`text-[10px] ${isPortalActive('account') || isPortalActive('login') || isPortalActive('register') ? 'text-black/70 font-extrabold' : 'text-white/40'}`}>02</span>
          <span className="truncate">{currentAccount ? 'Minha Conta' : 'Account'}</span>
        </button>

        {/* 03 Download */}
        <button
          id="tab-download-btn"
          onClick={() => { setActiveTab('portal'); setPortalSubTab('download'); }}
          className={`p-3 sm:px-4 sm:py-3.5 border-r border-[rgba(255,255,255,0.08)] border-b md:border-b-0 font-mono text-xs uppercase cursor-pointer transition-all flex flex-col gap-0.5 text-left ${
            isPortalActive('download')
              ? 'bg-[#f8d40d] text-black font-bold'
              : 'text-white/80 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className={`text-[10px] ${isPortalActive('download') ? 'text-black/70 font-extrabold' : 'text-white/40'}`}>03</span>
          <span className="truncate">Download</span>
        </button>

        {/* 04 Highscores */}
        <button
          id="tab-highscores-btn"
          onClick={() => { setActiveTab('portal'); setPortalSubTab('highscores'); }}
          className={`p-3 sm:px-4 sm:py-3.5 border-r border-[rgba(255,255,255,0.08)] border-b md:border-b-0 font-mono text-xs uppercase cursor-pointer transition-all flex flex-col gap-0.5 text-left ${
            isPortalActive('highscores')
              ? 'bg-[#f8d40d] text-black font-bold'
              : 'text-white/80 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className={`text-[10px] ${isPortalActive('highscores') ? 'text-black/70 font-extrabold' : 'text-white/40'}`}>04</span>
          <span className="truncate">Highscores</span>
        </button>

        {/* 05 Online */}
        <button
          id="tab-online-btn"
          onClick={() => { setActiveTab('portal'); setPortalSubTab('online'); }}
          className={`p-3 sm:px-4 sm:py-3.5 border-r border-[rgba(255,255,255,0.08)] border-b md:border-b-0 font-mono text-xs uppercase cursor-pointer transition-all flex flex-col gap-0.5 text-left ${
            isPortalActive('online')
              ? 'bg-[#f8d40d] text-black font-bold'
              : 'text-white/80 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className={`text-[10px] ${isPortalActive('online') ? 'text-black/70 font-extrabold' : 'text-white/40'}`}>05</span>
          <span className="truncate">Online ({onlineCount})</span>
        </button>

        {/* 06 Library */}
        <button
          id="tab-library-btn"
          onClick={() => { setActiveTab('portal'); setPortalSubTab('library'); }}
          className={`p-3 sm:px-4 sm:py-3.5 border-r border-[rgba(255,255,255,0.08)] border-b md:border-b-0 font-mono text-xs uppercase cursor-pointer transition-all flex flex-col gap-0.5 text-left ${
            isPortalActive('library')
              ? 'bg-[#f8d40d] text-black font-bold'
              : 'text-white/80 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className={`text-[10px] ${isPortalActive('library') ? 'text-black/70 font-extrabold' : 'text-white/40'}`}>06</span>
          <span className="truncate">Library</span>
        </button>

        {/* 07 Last Deaths */}
        <button
          id="tab-deaths-btn"
          onClick={() => { setActiveTab('portal'); setPortalSubTab('deaths'); }}
          className={`p-3 sm:px-4 sm:py-3.5 border-r border-[rgba(255,255,255,0.08)] border-b md:border-b-0 font-mono text-xs uppercase cursor-pointer transition-all flex flex-col gap-0.5 text-left ${
            isPortalActive('deaths')
              ? 'bg-[#f8d40d] text-black font-bold'
              : 'text-white/80 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className={`text-[10px] ${isPortalActive('deaths') ? 'text-black/70 font-extrabold' : 'text-white/40'}`}>07</span>
          <span className="truncate">Last Deaths</span>
        </button>

        {/* GM & STAFF TABS (Slots 07-10) */}
        {isStaff && (
          <>
            <button
              id="tab-guide-btn"
              onClick={() => setActiveTab('guide')}
              className={`p-3 sm:px-4 sm:py-3.5 border-r border-[rgba(255,255,255,0.08)] border-b md:border-b-0 font-mono text-xs uppercase cursor-pointer transition-all flex flex-col gap-0.5 text-left ${
                activeTab === 'guide'
                  ? 'bg-[#f8d40d] text-black font-bold'
                  : 'text-amber-400/90 hover:bg-white/5 hover:text-amber-300'
              }`}
            >
              <span className={`text-[10px] ${activeTab === 'guide' ? 'text-black/70 font-extrabold' : 'text-amber-500/60'}`}>07</span>
              <span className="truncate">Guia VPS</span>
            </button>

            <button
              id="tab-client-btn"
              onClick={() => setActiveTab('client')}
              className={`p-3 sm:px-4 sm:py-3.5 border-r border-[rgba(255,255,255,0.08)] border-b md:border-b-0 font-mono text-xs uppercase cursor-pointer transition-all flex flex-col gap-0.5 text-left ${
                activeTab === 'client'
                  ? 'bg-[#f8d40d] text-black font-bold'
                  : 'text-amber-400/90 hover:bg-white/5 hover:text-amber-300'
              }`}
            >
              <span className={`text-[10px] ${activeTab === 'client' ? 'text-black/70 font-extrabold' : 'text-amber-500/60'}`}>08</span>
              <span className="truncate">Packager</span>
            </button>

            <button
              id="tab-god-btn"
              onClick={() => setActiveTab('god')}
              className={`p-3 sm:px-4 sm:py-3.5 border-r border-[rgba(255,255,255,0.08)] border-b md:border-b-0 font-mono text-xs uppercase cursor-pointer transition-all flex flex-col gap-0.5 text-left ${
                activeTab === 'god'
                  ? 'bg-[#f8d40d] text-black font-bold'
                  : 'text-amber-400/90 hover:bg-white/5 hover:text-amber-300'
              }`}
            >
              <span className={`text-[10px] ${activeTab === 'god' ? 'text-black/70 font-extrabold' : 'text-amber-500/60'}`}>09</span>
              <span className="truncate">GM / SQL</span>
            </button>

            <button
              id="tab-script-btn"
              onClick={() => setActiveTab('script')}
              className={`p-3 sm:px-4 sm:py-3.5 border-r border-[rgba(255,255,255,0.08)] border-b md:border-b-0 font-mono text-xs uppercase cursor-pointer transition-all flex flex-col gap-0.5 text-left ${
                activeTab === 'script'
                  ? 'bg-[#f8d40d] text-black font-bold'
                  : 'text-amber-400/90 hover:bg-white/5 hover:text-amber-300'
              }`}
            >
              <span className={`text-[10px] ${activeTab === 'script' ? 'text-black/70 font-extrabold' : 'text-amber-500/60'}`}>10</span>
              <span className="truncate">Scripts</span>
            </button>
          </>
        )}
      </nav>
    </header>
  );
};
