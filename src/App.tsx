import React from 'react';
import { ServerProvider, useServer } from './context/ServerContext';
import { Navbar } from './components/Navbar';
import { PortalTab } from './components/PortalTab';
import { OracleGuideTab } from './components/OracleGuideTab';
import { ClientPackagerTab } from './components/ClientPackagerTab';
import { AdminGodTab } from './components/AdminGodTab';
import { ScriptGeneratorTab } from './components/ScriptGeneratorTab';
import { DatabaseConfigModal } from './components/DatabaseConfigModal';

const MainContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    portalSubTab,
    setPortalSubTab,
    isDbModalOpen, 
    setIsDbModalOpen, 
    isDbConnected, 
    isStaff, 
    currentAccount,
    serverConfig,
    onlineCount,
    highscoresList 
  } = useServer();

  return (
    <main className="w-full flex-1 flex flex-col">
      {/* Database Setup / Config Modal - GM only */}
      {isStaff && (
        <DatabaseConfigModal 
          isOpen={isDbModalOpen} 
          onClose={() => setIsDbModalOpen(false)} 
        />
      )}

      {/* Main Container from Variation 6 (Content + Info Panel) */}
      <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] border-b border-[rgba(255,255,255,0.08)]">
        {/* Left / Main Content Column */}
        <div className="p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {/* Staff Admin Banner - ONLY DISPLAYED WHEN LOGGED IN AS GM */}
          {isStaff && (
            <div className="mb-6 bg-gradient-to-r from-[#17140e] via-[#221c11] to-[#15120d] border-2 border-[#f8d40d]/50 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f8d40d]/20 border border-[#f8d40d]/50 flex items-center justify-center shadow-inner">
                  <span className="text-xl">👑</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#f8d40d] font-serif flex items-center gap-2">
                    PAINEL DO ADMINISTRADOR (CONTA GM: #{currentAccount?.name})
                    <span className="bg-[#f8d40d] text-black text-[10px] font-mono px-2 py-0.5 rounded font-extrabold uppercase">
                      STAFF TOTAL
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Acesso completo a Guia de Servidor, Packager de Cliente, Painel GOD, Console SQL e Gerador de Scripts Linux.
                  </p>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
                <button
                  onClick={() => { setActiveTab('portal'); setPortalSubTab('download'); }}
                  className={`px-3 py-1.5 rounded border transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'portal' && portalSubTab === 'download'
                      ? 'bg-[#f8d40d] text-black border-[#f8d40d] font-bold'
                      : 'bg-[#1e190e] border-[#f8d40d]/40 text-[#f8d40d] hover:text-white hover:border-[#f8d40d]'
                  }`}
                  title="Configurar Link de Download para Jogadores"
                >
                  <span>Link Download</span>
                </button>
                <button
                  onClick={() => setActiveTab('god')}
                  className={`px-3 py-1.5 rounded border transition cursor-pointer ${
                    activeTab === 'god'
                      ? 'bg-[#f8d40d] text-black border-[#f8d40d] font-bold'
                      : 'bg-[#151515] border-[#333] text-gray-300 hover:text-white hover:border-[#f8d40d]/40'
                  }`}
                >
                  Painel GOD & SQL
                </button>
                <button
                  onClick={() => setActiveTab('guide')}
                  className={`px-3 py-1.5 rounded border transition cursor-pointer ${
                    activeTab === 'guide'
                      ? 'bg-[#f8d40d] text-black border-[#f8d40d] font-bold'
                      : 'bg-[#151515] border-[#333] text-gray-300 hover:text-white hover:border-[#f8d40d]/40'
                  }`}
                >
                  Guia Oracle
                </button>
                <button
                  onClick={() => setActiveTab('client')}
                  className={`px-3 py-1.5 rounded border transition cursor-pointer ${
                    activeTab === 'client'
                      ? 'bg-[#f8d40d] text-black border-[#f8d40d] font-bold'
                      : 'bg-[#151515] border-[#333] text-gray-300 hover:text-white hover:border-[#f8d40d]/40'
                  }`}
                >
                  Cliente OT
                </button>
                <button
                  onClick={() => setActiveTab('script')}
                  className={`px-3 py-1.5 rounded border transition cursor-pointer ${
                    activeTab === 'script'
                      ? 'bg-[#f8d40d] text-black border-[#f8d40d] font-bold'
                      : 'bg-[#151515] border-[#333] text-gray-300 hover:text-white hover:border-[#f8d40d]/40'
                  }`}
                >
                  Scripts VPS
                </button>
              </div>
            </div>
          )}

          {/* Main Views */}
          {activeTab === 'portal' && <PortalTab />}
          {isStaff && activeTab === 'guide' && <OracleGuideTab />}
          {isStaff && activeTab === 'client' && <ClientPackagerTab />}
          {isStaff && activeTab === 'god' && <AdminGodTab />}
          {isStaff && activeTab === 'script' && <ScriptGeneratorTab />}
        </div>

        {/* Right Column: Info Panel in order: online > top 5 > daily monster > information */}
        <aside className="border-t lg:border-t-0 lg:border-l border-[rgba(255,255,255,0.08)] p-6 bg-black/25 flex flex-col gap-6">
          {/* 1. Stat Grid (Online Players & Uptime) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card-v6">
              <div className="stat-val-v6">{onlineCount}</div>
              <div className="font-mono text-[10px] text-white/50 uppercase mt-1 tracking-wider">ONLINE PLAYERS</div>
            </div>
            <div className="stat-card-v6">
              <div className="stat-val-v6">100%</div>
              <div className="font-mono text-[10px] text-white/50 uppercase mt-1 tracking-wider">UPTIME RECORD</div>
            </div>
          </div>

          {/* 2. Top 5 Players */}
          <div className="space-y-2">
            <div className="meta-label text-[#f8d40d] flex items-center justify-between">
              <span>Top 5 Players</span>
              <span className="text-[10px] text-gray-400">Level / Exp</span>
            </div>
            <div className="bg-black/40 border border-[rgba(255,255,255,0.08)] rounded p-2.5 space-y-1.5 font-mono text-xs">
              {highscoresList && highscoresList.length > 0 ? (
                highscoresList.slice(0, 5).map((p, idx) => (
                  <div key={p.id || idx} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        idx === 0 ? 'bg-[#f8d40d] text-black' : idx === 1 ? 'bg-gray-300 text-black' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-black/60 text-gray-400'
                      }`}>{idx + 1}</span>
                      <span className="text-white truncate">{p.name}</span>
                    </div>
                    <div className="text-[#f8d40d] font-bold">Lvl {p.level}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-2 text-[11px]">Nenhum player registrado ainda.</div>
              )}
            </div>
          </div>

          {/* 3. Daily Monster (Monstro Rotativo Diário) */}
          <div className="bg-gradient-to-br from-[#1b170e] via-[#14110b] to-[#111111] border-2 border-[#f8d40d]/40 rounded-xl p-4 space-y-2 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#f8d40d]/20 border border-[#f8d40d]/40 flex items-center justify-center text-[#f8d40d]">
                  <span className="text-xs">🔥</span>
                </div>
                <div>
                  <div className="text-[10px] text-[#f8d40d] font-mono font-extrabold uppercase tracking-widest">Rotativo Diário</div>
                  <h4 className="text-xs font-bold text-white font-serif">Monstro do Dia</h4>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                +100% EXP
              </span>
            </div>
            <div className="bg-black/50 border border-[#2a2312] p-2.5 rounded flex items-center justify-between text-xs font-mono">
              <span className="text-gray-300">Dragon / Rotativo</span>
              <span className="text-green-400 font-bold">2x EXP</span>
            </div>
          </div>

          {/* 4. Server Information Table */}
          <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 space-y-4">
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                <span className="text-xs font-bold text-white font-serif uppercase tracking-wider">Informações do Servidor</span>
                <span className="bg-green-500/20 text-green-400 border border-green-500/40 text-[9px] px-2 py-0.5 rounded font-mono font-bold">
                  ONLINE
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                  <span className="text-gray-400">IP de Conexão:</span>
                  <strong className="text-white font-mono">{serverConfig.serverIp}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                  <span className="text-gray-400">Portas:</span>
                  <span className="text-gray-300 font-mono">7171 (Login) / 7172 (Game)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                  <span className="text-gray-400">Cliente / Protocolo:</span>
                  <span className="text-gray-300">7.72 (OTClient / Tibia)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                  <span className="text-gray-400">Taxa de Experiência:</span>
                  <span className="text-[#f8d40d] font-bold">{serverConfig.rateExp}x</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                  <span className="text-gray-400">Taxa de Skills:</span>
                  <span className="text-gray-300 font-bold">{serverConfig.rateSkill}x</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                  <span className="text-gray-400">Taxa de Magic Level:</span>
                  <span className="text-gray-300 font-bold">{serverConfig.rateMagic}x</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                  <span className="text-gray-400">Taxa de Loot:</span>
                  <span className="text-gray-300 font-bold">3x</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Tipo de Mundo:</span>
                  <span className="text-[#f8d40d] uppercase font-bold">open-pvp</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveTab('portal');
                  setPortalSubTab('library');
                }}
                className="w-full text-xs bg-[#1a1a1a] hover:bg-[#252525] text-gray-200 py-2.5 rounded-lg transition text-center font-medium border border-[#333] cursor-pointer font-mono"
              >
                Ver Tabela Completa de Magias & Monstros
              </button>
            </div>

            {/* Discord Community Button Under Rates */}
            <div>
              <a
                href="https://discord.gg/V4yKQRC8"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/50 text-[#5865F2] font-mono text-xs uppercase px-4 py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-sm font-bold"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>Comunidade Discord</span>
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* Variation 6 Footer */}
      <footer className="p-4 sm:px-6 py-4 flex flex-wrap justify-between items-center text-xs font-mono text-white/50 bg-[#0d0d0d] gap-3 border-t border-[rgba(255,255,255,0.08)]">
        <div className="tracking-wider">ROOT@MARLEYOT:~# ACCESS_PORTAL</div>
        <div className="flex items-center gap-4 text-xs font-bold tracking-wider">
          <span className="text-[#3ea03c]">GREEN_LION</span>
          <span className="text-[#f8d40d]">GOLD_SUN</span>
          <span className="text-[#da291c]">RED_EARTH</span>
        </div>
      </footer>
    </main>
  );
};

export default function App() {
  return (
    <ServerProvider>
      <div className="min-h-screen bg-[#111111] text-white selection:bg-[#f8d40d] selection:text-black font-sans antialiased flex flex-col">
        <Navbar />
        <MainContent />
      </div>
    </ServerProvider>
  );
}
