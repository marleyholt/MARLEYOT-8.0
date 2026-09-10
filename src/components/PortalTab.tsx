import React, { useState } from 'react';
import { useServer } from '../context/ServerContext';
import { VOCATIONS, SPELLS_80, MONSTERS_80, YUROTS_LOCATIONS, YUROTS_REPO_DATA } from '../data/tibia80Data';
import { VocationId, PlayerCharacter } from '../types';
import { WhoIsOnlineView } from './WhoIsOnlineView';
import { HighscoresView } from './HighscoresView';
import { AccountManagerView } from './AccountManagerView';
import { ServerHostingGuideView } from './ServerHostingGuideView';
import { ClientDownloadView } from './ClientDownloadView';
import { LastDeathsView } from './LastDeathsView';
import { ShopView } from './ShopView';
import { 
  Sparkles, 
  Shield, 
  Flame, 
  Search, 
  Trophy, 
  BookOpen, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Sword, 
  Target, 
  Heart, 
  Zap, 
  Crown,
  Key,
  Trash2,
  Lock,
  GitFork,
  ExternalLink,
  Gem,
  Store,
  ArrowUpRight,
  Users,
  Download,
  Database,
  RefreshCw
} from 'lucide-react';

export const PortalTab: React.FC = () => {
  const { 
    currentAccount, 
    allPlayers, 
    registerAccount, 
    loginAccount, 
    createCharacter, 
    deleteCharacter, 
    changePassword,
    serverConfig, 
    portalSubTab, 
    setPortalSubTab,
    setActiveTab,
    onlineCount,
    isDbConnected,
    isStaff,
    librarySpells,
    libraryMonsters,
    libraryLocations,
    libraryRates,
    librarySource,
    isLibraryLoading,
    refreshLibraryFromDb,
    syncLibraryToDb,
    newsList,
    saveNewsItem,
  } = useServer();

  const [editingNews, setEditingNews] = useState<any | null>(null);
  const [isNewsEditorOpen, setIsNewsEditorOpen] = useState(false);
  const [newsSaveMsg, setNewsSaveMsg] = useState<string | null>(null);

  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMsg, setRegMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Login Form State
  const [logName, setLogName] = useState('');
  const [logPass, setLogPass] = useState('');
  const [logMsg, setLogMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Create Character Modal / Form
  const [charName, setCharName] = useState('');
  const [charSex, setCharSex] = useState<0 | 1>(1);
  const [charVoc, setCharVoc] = useState<VocationId>(1);
  const [charMsg, setCharMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [showCreateCharModal, setShowCreateCharModal] = useState(false);

  // Change Password Form
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Player search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerCharacter | null>(null);

  // Highscore category
  const [highscoreCategory, setHighscoreCategory] = useState<'level' | 'maglevel' | 'sword' | 'dist' | 'shield'>('level');

  // Library category
  const [libTab, setLibTab] = useState<'map' | 'spells' | 'monsters' | 'rates' | 'repo'>('map');
  const [spellFilterVoc, setSpellFilterVoc] = useState<string>('all');
  const [monsterSearch, setMonsterSearch] = useState('');

  // Handle register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const res = registerAccount(regName, regPass, regEmail);
    setRegMsg({ success: res.success, text: res.message });
    if (res.success) {
      setRegName('');
      setRegPass('');
      setRegEmail('');
      setTimeout(() => setPortalSubTab('account'), 1000);
    }
  };

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginAccount(logName, logPass);
    setLogMsg({ success: res.success, text: res.message });
    if (res.success) {
      setLogName('');
      setLogPass('');
      setTimeout(() => setPortalSubTab('account'), 600);
    }
  };

  // Handle create character
  const handleCreateChar = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createCharacter(charName, charSex, charVoc);
    setCharMsg({ success: res.success, text: res.message });
    if (res.success) {
      setCharName('');
      setTimeout(() => {
        setShowCreateCharModal(false);
        setCharMsg(null);
      }, 1500);
    }
  };

  // Handle change password
  const handleChangePass = (e: React.FormEvent) => {
    e.preventDefault();
    const res = changePassword(newPassword);
    setPassMsg({ success: res.success, text: res.message });
    if (res.success) setNewPassword('');
  };

  // Highscores sorted
  const sortedPlayers = [...allPlayers].sort((a, b) => {
    if (highscoreCategory === 'level') return b.level - a.level || b.experience - a.experience;
    if (highscoreCategory === 'maglevel') return b.maglevel - a.maglevel;
    if (highscoreCategory === 'sword') return b.skills.sword - a.skills.sword;
    if (highscoreCategory === 'dist') return b.skills.dist - a.skills.dist;
    if (highscoreCategory === 'shield') return b.skills.shield - a.skills.shield;
    return b.level - a.level;
  });

  // Filtered spells (Dynamic from Database / 7.72)
  const spellsToFilter = (librarySpells && librarySpells.length > 0) ? librarySpells : SPELLS_80;
  const filteredSpells = spellsToFilter.filter((s) => {
    if (spellFilterVoc === 'all') return true;
    return s.vocations.includes(spellFilterVoc);
  });

  // Filtered monsters (Dynamic from Database / 7.72)
  const monstersToFilter = (libraryMonsters && libraryMonsters.length > 0) ? libraryMonsters : MONSTERS_80;
  const filteredMonsters = monstersToFilter.filter((m) => {
    return m.name.toLowerCase().includes(monsterSearch.toLowerCase()) || 
      m.location.toLowerCase().includes(monsterSearch.toLowerCase()) ||
      m.loot.some(l => l.toLowerCase().includes(monsterSearch.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      {/* VIEW: NEWS & OVERVIEW */}
      {portalSubTab === 'news' && (() => {
        const latestNews = newsList[0] || {
          id: 'news-1',
          title: 'Beta Teste Aberto: Servidor em Teste e Implementações',
          date: 'Hoje',
          badge: 'BETA ABERTO',
          content: 'Servidor em teste e implementações de rotinas e funções, qualquer bug favor reportar no discord https://discord.gg/V4yKQRC8.',
          textColor: '#d1d5db',
          textSize: 'text-base',
        };
        return (
          <div className="space-y-6">
            {/* Prominent News Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1711] via-[#14120e] to-[#111111] border-l-4 border-l-[#f8d40d] border border-[#332a15] p-6 sm:p-8 shadow-2xl rounded-xl space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f8d40d] animate-pulse"></span>
                  <span className="meta-label text-[#f8d40d] font-bold">Últimas Notícias • Servidor Online</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-[#f8d40d]/20 text-[#f8d40d] border border-[#f8d40d]/40 text-xs px-2.5 py-0.5 rounded font-mono font-bold">
                    {latestNews.badge}
                  </span>
                  <button
                    onClick={() => setPortalSubTab('newshistory')}
                    className="bg-[#1a1a1a] hover:bg-[#252525] text-gray-300 border border-[#333] text-xs font-mono px-3 py-1 rounded transition cursor-pointer"
                  >
                    Histórico de Notícias →
                  </button>
                  {isStaff && (
                    <button
                      onClick={() => {
                        setEditingNews({ ...latestNews });
                        setIsNewsEditorOpen(true);
                      }}
                      className="bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold text-xs font-mono px-3 py-1 rounded transition flex items-center gap-1 shadow cursor-pointer"
                      title="Editar Notícia (GM)"
                    >
                      <span>✏️ Editar Notícia</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight leading-snug">
                  {latestNews.title}
                </h2>
                {latestNews.imageUrl && (
                  <div className="my-3 overflow-hidden rounded-lg border border-[#332a15] max-h-96">
                    <img src={latestNews.imageUrl} alt={latestNews.title} className="w-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className={`leading-relaxed ${latestNews.textSize || 'text-base'}`} style={{ color: latestNews.textColor || '#d1d5db' }}>
                  <p className="whitespace-pre-line">{latestNews.content}</p>
                </div>
              </div>

              {/* Action Buttons in Evidence */}
              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  id="hero-download-client-btn"
                  onClick={() => setPortalSubTab('download')}
                  className="btn-jamaica flex items-center gap-2 px-6 py-3 text-sm font-bold shadow-lg"
                >
                  <Download className="w-5 h-5 text-white" />
                  <span>Baixar Cliente Oficial</span>
                </button>

                <button
                  onClick={() => {
                    if (currentAccount) {
                      setPortalSubTab('account');
                    } else {
                      setPortalSubTab('register');
                    }
                  }}
                  className="bg-[#1e1e1e] hover:bg-[#2a2a2a] text-gray-100 border-2 border-[#f8d40d]/60 font-mono text-xs uppercase px-6 py-3 transition flex items-center gap-2 cursor-pointer font-bold rounded-lg shadow-md"
                >
                  <UserPlus className="w-4 h-4 text-[#f8d40d]" />
                  <span>{currentAccount ? 'Ver Minha Conta' : 'Criar Conta Grátis'}</span>
                </button>

                {isStaff && (
                  <button
                    onClick={() => setActiveTab('guide')}
                    className="bg-[#151515] hover:bg-[#202020] text-gray-300 border border-[#f8d40d]/40 font-mono text-xs uppercase px-4 py-3 transition flex items-center gap-2 rounded-lg"
                  >
                    <Crown className="w-4 h-4 text-[#f8d40d]" />
                    <span>Guia Servidor Oracle (GM)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* VIEW: NEWS HISTORY (Aba de Histórico de Notícias) */}
      {portalSubTab === 'newshistory' && (
        <div className="space-y-6">
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#222222] pb-4 flex-wrap gap-3">
              <div>
                <h3 className="text-xl font-bold text-white font-serif flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#f8d40d]" />
                  <span>Histórico de Notícias e Atualizações</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Acompanhe todas as atualizações, notas de patch e manutenções anteriores do MARLEYOT 7.72.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {isStaff && (
                  <button
                    onClick={() => {
                      setEditingNews({
                        id: 'news-' + Date.now(),
                        title: 'Nova Nota de Atualização do Servidor',
                        date: new Date().toLocaleDateString('pt-BR'),
                        badge: 'PATCH',
                        content: 'Escreva aqui os detalhes da nova atualização...',
                        textColor: '#ffffff',
                        textSize: 'text-base',
                      });
                      setIsNewsEditorOpen(true);
                    }}
                    className="bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold text-xs font-mono px-3 py-2 rounded transition flex items-center gap-1 shadow cursor-pointer"
                  >
                    <span>➕ Criar Nova Notícia</span>
                  </button>
                )}
                <button
                  onClick={() => setPortalSubTab('news')}
                  className="bg-[#1a1a1a] hover:bg-[#252525] text-gray-300 border border-[#333] text-xs font-mono px-4 py-2 rounded transition cursor-pointer"
                >
                  ← Voltar ao Início
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {newsList.map((item, idx) => (
                <div key={item.id} className="bg-[#151515] border border-[#2a2a2a] rounded-lg p-5 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-[#f8d40d] font-mono">{item.date} • {item.badge}</span>
                    <div className="flex items-center gap-2">
                      {idx === 0 && (
                        <span className="bg-[#f8d40d]/20 text-[#f8d40d] text-[10px] px-2 py-0.5 rounded font-mono font-bold">Última</span>
                      )}
                      {isStaff && (
                        <button
                          onClick={() => {
                            setEditingNews({ ...item });
                            setIsNewsEditorOpen(true);
                          }}
                          className="bg-[#222] hover:bg-[#333] text-[#f8d40d] text-xs font-mono px-2.5 py-1 rounded border border-[#444] transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>✏️ Editar</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-white">{item.title}</h4>
                  {item.imageUrl && (
                    <div className="my-2 overflow-hidden rounded border border-[#333] max-h-48">
                      <img src={item.imageUrl} alt={item.title} className="w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className={`leading-relaxed ${item.textSize || 'text-xs'}`} style={{ color: item.textColor || '#d1d5db' }}>
                    <p className="whitespace-pre-line">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GM News Editor Modal */}
      {isNewsEditorOpen && editingNews && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border-2 border-[#C9A227] rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#C9A227]" />
                <span>Gerenciador de Notícia (GM / GOD)</span>
              </h3>
              <button
                onClick={() => setIsNewsEditorOpen(false)}
                className="text-gray-400 hover:text-white font-mono text-sm px-2 py-1 rounded bg-[#1a1a1a]"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1 font-mono">Título da Notícia:</label>
                <input
                  type="text"
                  value={editingNews.title}
                  onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#333] text-white px-3 py-2 rounded font-sans text-sm focus:border-[#C9A227] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1 font-mono">Badge / Categoria:</label>
                  <input
                    type="text"
                    value={editingNews.badge}
                    onChange={(e) => setEditingNews({ ...editingNews, badge: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white px-3 py-2 rounded font-mono text-xs focus:border-[#C9A227] outline-none"
                    placeholder="BETA ABERTO"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1 font-mono">Data / Período:</label>
                  <input
                    type="text"
                    value={editingNews.date}
                    onChange={(e) => setEditingNews({ ...editingNews, date: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white px-3 py-2 rounded font-mono text-xs focus:border-[#C9A227] outline-none"
                    placeholder="Hoje / 01/09/2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1 font-mono">Cor do Texto:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingNews.textColor || '#d1d5db'}
                      onChange={(e) => setEditingNews({ ...editingNews, textColor: e.target.value })}
                      className="w-10 h-8 bg-transparent rounded cursor-pointer border border-[#333]"
                    />
                    <input
                      type="text"
                      value={editingNews.textColor || '#d1d5db'}
                      onChange={(e) => setEditingNews({ ...editingNews, textColor: e.target.value })}
                      className="flex-1 bg-[#1a1a1a] border border-[#333] text-white px-2 py-1.5 rounded font-mono text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1 font-mono">Tamanho da Fonte:</label>
                  <select
                    value={editingNews.textSize || 'text-base'}
                    onChange={(e) => setEditingNews({ ...editingNews, textSize: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white px-3 py-2 rounded font-mono text-xs outline-none"
                  >
                    <option value="text-sm">Pequeno (sm)</option>
                    <option value="text-base">Normal (base)</option>
                    <option value="text-lg">Grande (lg)</option>
                    <option value="text-xl">Extra Grande (xl)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1 font-mono">Upload de Imagem para a Notícia:</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] text-gray-300 px-4 py-2.5 rounded text-xs font-mono flex items-center justify-center gap-2 transition">
                    <span>📁 Escolher Imagem do Computador</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (uploadEvent) => {
                            setEditingNews({ ...editingNews, imageUrl: uploadEvent.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {editingNews.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setEditingNews({ ...editingNews, imageUrl: '' })}
                      className="px-3 py-2 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 rounded text-xs font-mono"
                    >
                      Remover Imagem
                    </button>
                  )}
                </div>
                {editingNews.imageUrl && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-[#333] max-h-36">
                    <img src={editingNews.imageUrl} alt="Preview" className="w-full h-auto object-cover max-h-36" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1 font-mono">Conteúdo da Notícia:</label>
                <textarea
                  rows={6}
                  value={editingNews.content}
                  onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#333] text-white p-3 rounded font-sans text-xs focus:border-[#C9A227] outline-none leading-relaxed"
                  placeholder="Digite aqui o texto da notícia, links do discord, etc..."
                />
              </div>

              {newsSaveMsg && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded font-mono text-xs">
                  {newsSaveMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
                <button
                  onClick={() => setIsNewsEditorOpen(false)}
                  className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] text-gray-300 rounded font-mono text-xs"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    saveNewsItem(editingNews);
                    setNewsSaveMsg('✅ Notícia salva com sucesso! O servidor aplicou as alterações instantaneamente.');
                    setTimeout(() => {
                      setNewsSaveMsg(null);
                      setIsNewsEditorOpen(false);
                    }, 1200);
                  }}
                  className="px-6 py-2 bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold rounded font-mono text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Salvar & Atualizar Servidor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: ACCOUNT MANAGER (REGISTER / LOGIN / CHARACTER CREATOR) */}
      {(portalSubTab === 'register' || portalSubTab === 'login' || portalSubTab === 'account') && (
        <AccountManagerView />
      )}

      {/* VIEW: WHO IS ONLINE */}
      {portalSubTab === 'online' && (
        <WhoIsOnlineView />
      )}

      {/* VIEW: SERVER HOSTING GUIDE (LINUX VPS) - GM / STAFF ONLY */}
      {isStaff && portalSubTab === 'hosting' && (
        <ServerHostingGuideView />
      )}

      {/* VIEW: LOGGED-IN ACCOUNT DASHBOARD (Legacy - superseded by AccountManagerView) */}
      {false && currentAccount && (portalSubTab === 'account' || portalSubTab === 'register' || portalSubTab === 'login') && (
        <div className="space-y-6">
          {/* Top Account Header Card */}
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-[#C9A227] shadow-[0_0_12px_rgba(201,162,39,0.2)]">
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-serif text-white">
                    Conta: {currentAccount.name}
                  </h2>
                  {currentAccount.type >= 5 ? (
                    <span className="bg-red-500/15 text-red-400 text-xs font-bold px-2 py-0.5 rounded border border-red-500/30">
                      ADMINISTRADOR / GOD
                    </span>
                  ) : (
                    <span className="bg-green-500/15 text-green-400 text-xs font-bold px-2 py-0.5 rounded border border-green-500/30">
                      JOGADOR
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  E-mail: <span className="text-gray-300">{currentAccount.email}</span> • ID no Banco: #{currentAccount.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-[#0A0A0A] px-4 py-2 rounded-xl border border-[#222222] text-center">
                <div className="text-[10px] text-gray-500 uppercase font-semibold">Status VIP</div>
                <div className="text-sm font-bold text-[#C9A227]">{currentAccount.premdays} Dias Restantes</div>
              </div>

              <div className="bg-[#0A0A0A] px-4 py-2 rounded-xl border border-[#222222] text-center">
                <div className="text-[10px] text-gray-500 uppercase font-semibold">Tibia Coins</div>
                <div className="text-sm font-bold text-gray-200">{currentAccount.coins} Coins</div>
              </div>

              <button
                onClick={() => setShowCreateCharModal(true)}
                className="bg-[#C9A227] hover:bg-[#b58f1f] text-[#0A0A0A] font-bold px-4 py-2.5 rounded-xl text-sm transition flex items-center gap-2 shadow-[0_0_15px_rgba(201,162,39,0.25)]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Criar Personagem</span>
              </button>
            </div>
          </div>

          {/* Characters Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
                <Sword className="w-5 h-5 text-[#C9A227]" />
                <span>Personagens desta Conta ({currentAccount.characters.length}/10)</span>
              </h3>
            </div>

            {currentAccount.characters.length === 0 ? (
              <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 text-center space-y-3">
                <div className="text-gray-400 text-sm">Você ainda não possui personagens nesta conta.</div>
                <button
                  onClick={() => setShowCreateCharModal(true)}
                  className="bg-[#C9A227] hover:bg-[#b58f1f] text-[#0A0A0A] font-bold px-4 py-2 rounded-lg text-xs transition"
                >
                  Criar Primeiro Personagem
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentAccount.characters.map((char) => {
                  const voc = VOCATIONS[char.vocation] || VOCATIONS[0];
                  return (
                    <div
                      key={char.id}
                      className="bg-[#111111] border border-[#222222] hover:border-[#C9A227]/40 rounded-xl p-5 space-y-4 transition shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-white text-base flex items-center gap-2">
                            <span>{char.name}</span>
                            {char.group_id >= 5 && (
                              <span className="text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">
                                GOD
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#C9A227] font-medium">
                            {voc.name} • {char.sex === 1 ? 'Masculino' : 'Feminino'}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-bold text-[#C9A227]">Lvl {char.level}</div>
                          <div className="text-[10px] text-gray-500">ML {char.maglevel}</div>
                        </div>
                      </div>

                      {/* Vital stats bar */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span className="flex items-center gap-1 text-red-400">
                            <Heart className="w-3 h-3" /> Vida
                          </span>
                          <span>{char.health} / {char.healthmax}</span>
                        </div>
                        <div className="w-full bg-[#0A0A0A] h-1.5 rounded-full overflow-hidden border border-[#222222]">
                          <div className="bg-red-500 h-full rounded-full w-full"></div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                          <span className="flex items-center gap-1 text-sky-400">
                            <Zap className="w-3 h-3" /> Mana
                          </span>
                          <span>{char.mana} / {char.manamax}</span>
                        </div>
                        <div className="w-full bg-[#0A0A0A] h-1.5 rounded-full overflow-hidden border border-[#222222]">
                          <div className="bg-sky-500 h-full rounded-full w-full"></div>
                        </div>
                      </div>

                      {/* Skills Grid */}
                      <div className="grid grid-cols-4 gap-1 pt-2 border-t border-[#1A1A1A] text-center text-[10px]">
                        <div className="bg-[#0A0A0A] p-1 rounded border border-[#222222]">
                          <div className="text-gray-500">Sword</div>
                          <div className="font-bold text-gray-200">{char.skills.sword}</div>
                        </div>
                        <div className="bg-[#0A0A0A] p-1 rounded border border-[#222222]">
                          <div className="text-gray-500">Axe</div>
                          <div className="font-bold text-gray-200">{char.skills.axe}</div>
                        </div>
                        <div className="bg-[#0A0A0A] p-1 rounded border border-[#222222]">
                          <div className="text-gray-500">Dist</div>
                          <div className="font-bold text-gray-200">{char.skills.dist}</div>
                        </div>
                        <div className="bg-[#0A0A0A] p-1 rounded border border-[#222222]">
                          <div className="text-gray-500">Shield</div>
                          <div className="font-bold text-gray-200">{char.skills.shield}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#1A1A1A] text-xs">
                        <span className="text-gray-500 text-[11px]">Cidade: {char.town_name}</span>
                        <button
                          onClick={() => {
                            if (confirm(`Tem certeza que deseja excluir ${char.name}?`)) {
                              deleteCharacter(char.id);
                            }
                          }}
                          className="text-gray-500 hover:text-red-400 transition flex items-center gap-1 text-[11px]"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Account Security & Password Change */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 space-y-4 max-w-md">
            <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#C9A227]" />
              <span>Alterar Senha da Conta</span>
            </h3>

            <form onSubmit={handleChangePass} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#E0E0E0] placeholder-gray-600 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>

              {passMsg && (
                <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  passMsg.success ? 'bg-green-500/10 text-green-300 border border-green-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'
                }`}>
                  {passMsg.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{passMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                className="bg-[#1A1A1A] hover:bg-[#252525] text-gray-200 border border-[#333] font-semibold px-4 py-2 rounded-lg text-xs transition"
              >
                Atualizar Senha
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CHARACTER MODAL (Legacy - superseded by AccountManagerView) */}
      {false && showCreateCharModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#333333] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#C9A227]" />
                <span>Criar Novo Personagem</span>
              </h3>
              <button
                onClick={() => setShowCreateCharModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Nome do Personagem (Tibia 7.72)
                </label>
                <input
                  type="text"
                  required
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  placeholder="Ex: Yurots Master"
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#E0E0E0] placeholder-gray-600 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>

              {/* Sex */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Gênero
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCharSex(1)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition ${
                      charSex === 1
                        ? 'bg-[#1A1A1A] border-[#C9A227] text-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.15)]'
                        : 'bg-[#0A0A0A] border-[#222222] text-gray-400 hover:text-white'
                    }`}
                  >
                    Masculino (Male)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCharSex(0)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition ${
                      charSex === 0
                        ? 'bg-[#1A1A1A] border-[#C9A227] text-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.15)]'
                        : 'bg-[#0A0A0A] border-[#222222] text-gray-400 hover:text-white'
                    }`}
                  >
                    Feminino (Female)
                  </button>
                </div>
              </div>

              {/* Vocation Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Escolha sua Vocação
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[1, 2, 3, 4].map((id) => {
                    const voc = VOCATIONS[id];
                    const isSelected = charVoc === id;
                    return (
                      <div
                        key={id}
                        onClick={() => setCharVoc(id as VocationId)}
                        className={`p-3 rounded-xl border cursor-pointer transition select-none ${
                          isSelected
                            ? 'bg-[#1A1A1A] border-[#C9A227] text-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.15)]'
                            : 'bg-[#0A0A0A] border-[#222222] text-gray-400 hover:border-[#333] hover:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                          {id === 1 && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                          {id === 2 && <Zap className="w-3.5 h-3.5 text-green-400" />}
                          {id === 3 && <Target className="w-3.5 h-3.5 text-sky-400" />}
                          {id === 4 && <Shield className="w-3.5 h-3.5 text-red-400" />}
                          <span>{voc.name}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 leading-tight">
                          {voc.description.slice(0, 55)}...
                        </div>
                        <div className="mt-1.5 text-[9px] text-[#C9A227]/80 font-mono">
                          +{voc.hpGain} HP / +{voc.manaGain} MP por lvl
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#0A0A0A] p-3 rounded-xl border border-[#222222] text-xs text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Cidade Inicial:</span>
                  <span className="font-semibold text-gray-200">Templo de Yurots (PZ)</span>
                </div>
                <div className="flex justify-between">
                  <span>Nível Inicial:</span>
                  <span className="font-semibold text-[#C9A227]">Nível 8 (Pronto para Main)</span>
                </div>
              </div>

              {charMsg && (
                <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  charMsg.success ? 'bg-green-500/10 text-green-300 border border-green-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'
                }`}>
                  {charMsg.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{charMsg.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCharModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#C9A227] hover:bg-[#b58f1f] text-[#0A0A0A] font-bold px-5 py-2 rounded-lg text-xs transition shadow-[0_0_15px_rgba(201,162,39,0.25)]"
                >
                  Confirmar e Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW: CHARACTERS SEARCH & VIEW */}
      {portalSubTab === 'characters' && (
        <div className="space-y-6">
          {/* Search Input */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 shadow-md">
            <h3 className="text-sm font-bold text-white font-serif mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-[#C9A227]" />
              <span>Pesquisar Personagem no Banco de Dados</span>
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite o nome do personagem (ex: GOD Yurots, Eternal, Lady Bubble)..."
                className="flex-1 bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#E0E0E0] placeholder-gray-600 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
              />
            </div>
          </div>

          {/* Player details if selected or searched */}
          {selectedPlayer ? (
            <div className="bg-[#111111] border border-[#333333] rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-start justify-between border-b border-[#222222] pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold font-serif text-white">
                      {selectedPlayer.name}
                    </h2>
                    {selectedPlayer.group_id >= 5 && (
                      <span className="bg-red-500/15 text-red-400 text-xs px-2 py-0.5 rounded border border-red-500/30 font-bold">
                        GOD / GAMEMASTER
                      </span>
                    )}
                    {selectedPlayer.online ? (
                      <span className="text-xs text-green-400 flex items-center gap-1 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        ONLINE
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">OFFLINE</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {VOCATIONS[selectedPlayer.vocation]?.name} • {selectedPlayer.sex === 1 ? 'Masculino' : 'Feminino'} • Residência: {selectedPlayer.town_name}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Voltar para a Lista
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222] space-y-2">
                  <div className="text-xs text-gray-400">Nível & Experiência</div>
                  <div className="text-2xl font-bold text-[#C9A227]">Level {selectedPlayer.level}</div>
                  <div className="text-xs text-gray-500 font-mono">
                    {selectedPlayer.experience.toLocaleString('pt-BR')} EXP
                  </div>
                </div>

                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222] space-y-2">
                  <div className="text-xs text-gray-400">Magic Level</div>
                  <div className="text-2xl font-bold text-sky-400">ML {selectedPlayer.maglevel}</div>
                  <div className="text-xs text-gray-500 font-mono">
                    Mana Máxima: {selectedPlayer.manamax}
                  </div>
                </div>

                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222] space-y-2">
                  <div className="text-xs text-gray-400">Pontos de Vida</div>
                  <div className="text-2xl font-bold text-red-400">{selectedPlayer.healthmax} HP</div>
                  <div className="text-xs text-gray-500 font-mono">
                    Cidade: Templo de Yurots
                  </div>
                </div>
              </div>

              {/* Skills Table */}
              <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222]">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
                  Tabela de Habilidades (Skills 7.72)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center">
                  <div className="bg-[#111111] p-2.5 rounded-lg border border-[#222222]">
                    <div className="text-[10px] text-gray-500">Sword</div>
                    <div className="text-base font-bold text-gray-200">{selectedPlayer.skills.sword}</div>
                  </div>
                  <div className="bg-[#111111] p-2.5 rounded-lg border border-[#222222]">
                    <div className="text-[10px] text-gray-500">Axe</div>
                    <div className="text-base font-bold text-gray-200">{selectedPlayer.skills.axe}</div>
                  </div>
                  <div className="bg-[#111111] p-2.5 rounded-lg border border-[#222222]">
                    <div className="text-[10px] text-gray-500">Club</div>
                    <div className="text-base font-bold text-gray-200">{selectedPlayer.skills.club}</div>
                  </div>
                  <div className="bg-[#111111] p-2.5 rounded-lg border border-[#222222]">
                    <div className="text-[10px] text-gray-500">Distance</div>
                    <div className="text-base font-bold text-gray-200">{selectedPlayer.skills.dist}</div>
                  </div>
                  <div className="bg-[#111111] p-2.5 rounded-lg border border-[#222222]">
                    <div className="text-[10px] text-gray-500">Shielding</div>
                    <div className="text-base font-bold text-gray-200">{selectedPlayer.skills.shield}</div>
                  </div>
                  <div className="bg-[#111111] p-2.5 rounded-lg border border-[#222222]">
                    <div className="text-[10px] text-gray-500">Fishing</div>
                    <div className="text-base font-bold text-gray-200">{selectedPlayer.skills.fish}</div>
                  </div>
                  <div className="bg-[#111111] p-2.5 rounded-lg border border-[#222222]">
                    <div className="text-[10px] text-gray-500">Fist</div>
                    <div className="text-base font-bold text-gray-200">{selectedPlayer.skills.fist}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0A0A] text-gray-400 border-b border-[#222222]">
                  <tr>
                    <th className="p-3">Nome</th>
                    <th className="p-3">Vocação</th>
                    <th className="p-3">Level</th>
                    <th className="p-3">Magic Level</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]">
                  {allPlayers
                    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-[#151515] transition">
                        <td className="p-3 font-semibold text-gray-200 flex items-center gap-1.5">
                          {p.name}
                          {p.group_id >= 5 && (
                            <span className="text-[9px] bg-red-500/15 text-red-400 px-1 rounded border border-red-500/30">GOD</span>
                          )}
                        </td>
                        <td className="p-3 text-gray-400">{VOCATIONS[p.vocation]?.name}</td>
                        <td className="p-3 font-bold text-[#C9A227]">{p.level}</td>
                        <td className="p-3 text-sky-400">{p.maglevel}</td>
                        <td className="p-3">
                          {p.online ? (
                            <span className="text-green-400 font-semibold">Online</span>
                          ) : (
                            <span className="text-gray-500">Offline</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedPlayer(p)}
                            className="text-[#C9A227] hover:underline font-semibold"
                          >
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW: SHOP / MARLEY SHOP */}
      {portalSubTab === 'shop' && (
        <ShopView />
      )}

      {/* VIEW: HIGHSCORES / RANKINGS */}
      {portalSubTab === 'highscores' && (
        <HighscoresView />
      )}

      {/* VIEW: DOWNLOAD CLIENT */}
      {portalSubTab === 'download' && (
        <ClientDownloadView />
      )}

      {/* VIEW: LAST DEATHS */}
      {portalSubTab === 'deaths' && (
        <LastDeathsView />
      )}

      {/* VIEW: SERVER HOSTING GUIDE (GM ONLY) */}
      {isStaff && portalSubTab === 'hosting' && (
        <ServerHostingGuideView />
      )}

      {/* VIEW: LIBRARY & YUROTS GAME INFO */}
      {portalSubTab === 'library' && (
        <div className="space-y-6">
          {/* Dynamic Database Source & Sync Banner */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                librarySource === 'mysql' 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                  : 'bg-[#C9A227]/10 border-[#C9A227]/30 text-[#C9A227]'
              }`}>
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white font-serif">Biblioteca do Protocolo 7.72</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    librarySource === 'mysql'
                      ? 'bg-green-500/10 text-green-400 border-green-500/30'
                      : 'bg-[#C9A227]/10 text-[#C9A227] border-[#C9A227]/30'
                  }`}>
                    {librarySource === 'mysql' ? 'MySQL: yurots_db' : 'Cache 7.72'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {librarySpells.length} Magias & Runas • {libraryMonsters.length} Criaturas/Bosses • {libraryLocations.length} Locais Yurots
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => refreshLibraryFromDb()}
                disabled={isLibraryLoading}
                className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLibraryLoading ? 'animate-spin text-[#C9A227]' : ''}`} />
                <span>{isLibraryLoading ? 'Carregando...' : 'Recarregar'}</span>
              </button>

              {isStaff && (
                <button
                  onClick={async () => {
                    setIsSyncing(true);
                    setSyncFeedback(null);
                    try {
                      const res = await syncLibraryToDb();
                      setSyncFeedback({ success: res.success, text: res.message });
                      setTimeout(() => setSyncFeedback(null), 5000);
                    } catch (err: any) {
                      setSyncFeedback({ success: false, text: err?.message || 'Falha ao sincronizar' });
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                  disabled={isSyncing}
                  className="px-3 py-1.5 bg-[#C9A227]/10 hover:bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#C9A227] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar no MySQL'}</span>
                </button>
              )}
            </div>
          </div>

          {syncFeedback && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              syncFeedback.success ? 'bg-green-500/10 text-green-300 border border-green-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'
            }`}>
              {syncFeedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{syncFeedback.text}</span>
            </div>
          )}

          {/* Library Sub-nav */}
          <div className="flex flex-wrap bg-[#0A0A0A] border border-[#222222] rounded-xl p-1 max-w-3xl gap-1">
            <button
              onClick={() => setLibTab('map')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                libTab === 'map' ? 'bg-[#1A1A1A] border border-[#333] text-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.15)]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Mapa Yurots & Quests
            </button>
            <button
              onClick={() => setLibTab('spells')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                libTab === 'spells' ? 'bg-[#1A1A1A] border border-[#333] text-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.15)]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Magias & Runas 7.72
            </button>
            <button
              onClick={() => setLibTab('monsters')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                libTab === 'monsters' ? 'bg-[#1A1A1A] border border-[#333] text-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.15)]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monstros & Bosses
            </button>
            <button
              onClick={() => setLibTab('rates')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                libTab === 'rates' ? 'bg-[#1A1A1A] border border-[#333] text-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.15)]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Regras & Rates
            </button>
            <button
              onClick={() => setLibTab('repo')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                libTab === 'repo' ? 'bg-[#1A1A1A] border border-[#333] text-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.15)]' : 'text-[#C9A227]/70 hover:text-[#C9A227]'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Sistemas Marley OT</span>
            </button>
          </div>

          {/* TAB: MAP YUROTS */}
          {libTab === 'map' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {((libraryLocations && libraryLocations.length > 0) ? libraryLocations : YUROTS_LOCATIONS).map((loc) => (
                <div
                  key={loc.id}
                  className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base font-serif">{loc.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-[#C9A227]/10 text-[#C9A227] px-2 py-0.5 rounded border border-[#C9A227]/30 font-semibold">
                          {loc.category}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">{loc.coordinates}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded">
                      {loc.recommendedLevel}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {loc.description}
                  </p>

                  <div className="pt-2 border-t border-[#1A1A1A] space-y-1">
                    <div className="text-[10px] uppercase font-bold text-gray-400">Destaques:</div>
                    <ul className="text-xs text-gray-300 space-y-1">
                      {loc.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: SPELLS 8.0 */}
          {libTab === 'spells' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Filtrar por vocação:</span>
                {['all', 'Sorcerer', 'Druid', 'Paladin', 'Knight'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setSpellFilterVoc(v)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      spellFilterVoc === v
                        ? 'bg-[#1A1A1A] border border-[#333] text-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.15)]'
                        : 'bg-[#0A0A0A] text-gray-400 hover:text-white border border-[#222222]'
                    }`}
                  >
                    {v === 'all' ? 'Todas' : v}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSpells.map((s) => (
                  <div
                    key={s.id}
                    className="bg-[#111111] border border-[#222222] rounded-xl p-4 space-y-2.5 shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{s.name}</h4>
                        <div className="font-mono text-xs text-[#C9A227] font-semibold">{s.words}</div>
                      </div>
                      <span className="text-[10px] bg-[#0A0A0A] text-gray-400 px-2 py-0.5 rounded border border-[#222222]">
                        {s.type}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      {s.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-[#1A1A1A] font-mono">
                      <span>Nível: <strong className="text-[#C9A227]">{s.level}</strong></span>
                      <span>Mana: <strong className="text-sky-300">{s.mana}</strong></span>
                      <span>{s.vocations.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MONSTERS & BOSSES */}
          {libTab === 'monsters' && (
            <div className="space-y-4">
              <input
                type="text"
                value={monsterSearch}
                onChange={(e) => setMonsterSearch(e.target.value)}
                placeholder="Buscar monstro por nome, drop ou localização..."
                className="w-full max-w-md bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-[#E0E0E0] placeholder-gray-600 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMonsters.map((m) => (
                  <div
                    key={m.id}
                    className="bg-[#111111] border border-[#222222] rounded-xl p-4 space-y-3 shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-base font-serif">{m.name}</h4>
                        <span className="text-xs text-gray-500 font-mono">
                          {m.experience} EXP • {m.health} HP
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        m.difficulty === 'Boss' || m.difficulty === 'Lendário'
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : m.difficulty === 'Difícil'
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : 'bg-green-500/15 text-green-300 border-green-500/30'
                      }`}>
                        {m.difficulty}
                      </span>
                    </div>

                    <div className="text-xs text-gray-300">
                      <strong className="text-gray-400">Onde Encontrar:</strong> {m.location}
                    </div>

                    <div className="pt-2 border-t border-[#1A1A1A] space-y-1">
                      <div className="text-[10px] uppercase font-bold text-[#C9A227]">Drops Notáveis:</div>
                      <div className="flex flex-wrap gap-1">
                        {m.loot.map((item, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-[#0A0A0A] text-gray-300 px-1.5 py-0.5 rounded border border-[#222222]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: RATES */}
          {libTab === 'rates' && (
            <div className="max-w-2xl bg-[#111111] border border-[#222222] rounded-xl p-6 space-y-4">
              <h4 className="font-bold text-white text-base font-serif">Configuração de Rates do Servidor (7.72)</h4>
              <div className="space-y-2 text-xs">
                {libraryRates && libraryRates.length > 0 ? (
                  libraryRates.map((r) => (
                    <div key={r.id || r.name} className="flex items-center justify-between p-2.5 bg-[#0A0A0A] rounded-lg border border-[#222222]">
                      <div>
                        <span className="text-gray-300 font-medium">{r.name}:</span>
                        {r.description && <span className="block text-[10px] text-gray-500">{r.description}</span>}
                      </div>
                      <span className="font-bold text-[#C9A227]">{r.value}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between p-2.5 bg-[#0A0A0A] rounded-lg border border-[#222222]">
                      <span className="text-gray-300">Taxa de Experiência (rateExp):</span>
                      <span className="font-bold text-[#C9A227]">{serverConfig.rateExp}x</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-[#0A0A0A] rounded-lg border border-[#222222]">
                      <span className="text-gray-300">Taxa de Habilidades (rateSkill):</span>
                      <span className="font-bold text-gray-200">{serverConfig.rateSkill}x</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-[#0A0A0A] rounded-lg border border-[#222222]">
                      <span className="text-gray-300">Taxa de Magic Level (rateMagic):</span>
                      <span className="font-bold text-sky-400">{serverConfig.rateMagic}x</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-[#0A0A0A] rounded-lg border border-[#222222]">
                      <span className="text-gray-300">Taxa de Loot dos Monstros (rateLoot):</span>
                      <span className="font-bold text-green-400">{serverConfig.rateLoot}x</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between p-2.5 bg-[#0A0A0A] rounded-lg border border-[#222222]">
                  <span className="text-gray-300">Frags para Red Skull:</span>
                  <span className="font-bold text-red-400">5 Frags diários</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REPO FEATURES (MARLEYOT 7.72 Exclusive Systems) */}
          {libTab === 'repo' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 shadow-md space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                          Mecânicas & Sistemas
                        </span>
                        <span className="bg-[#C9A227]/15 text-[#C9A227] border border-[#C9A227]/30 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                          MARLEYOT 7.72
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white font-serif">
                        Sistemas Exclusivos do MARLEYOT 7.72
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Protocolo 7.72 Old School • Fast Attack Balanceado • Gemas de Encantamento
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-2 border-t border-[#1A1A1A]">
                  O <strong>MARLEYOT 7.72</strong> foi calibrado para entregar a mais autêntica e dinâmica experiência de Yurots Old School. Com a engine de alta performance em C++, o servidor combina o mapa clássico YurOTS com o inovador sistema de Fast Attack proporcional ao Fist Fighting (1% a mais de velocidade de ataque por skill), sistema de gemas com até 100 encantamentos e mercado offline.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {YUROTS_REPO_DATA.features.map((feat, index) => (
                  <div
                    key={index}
                    className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-3 shadow-md hover:border-[#333] transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Gem className="w-5 h-5 text-[#C9A227]" />}
                        {index === 1 && <Store className="w-5 h-5 text-sky-400" />}
                        {index === 2 && <Flame className="w-5 h-5 text-green-400" />}
                        {index === 3 && <Target className="w-5 h-5 text-amber-400" />}
                        {index === 4 && <Sword className="w-5 h-5 text-purple-400" />}
                        {index === 5 && <MapPin className="w-5 h-5 text-red-400" />}
                        <h4 className="font-bold text-white text-sm font-serif">
                          {feat.title}
                        </h4>
                      </div>
                      <span className="text-[10px] bg-[#0A0A0A] text-[#C9A227] px-2 py-0.5 rounded border border-[#C9A227]/25 font-mono">
                        {feat.tag}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      {feat.description}
                    </p>

                    {/* Technical details specific to each feature */}
                    {index === 0 && (
                      <div className="bg-[#0A0A0A] p-3 rounded-lg border border-[#222] text-[11px] text-gray-400 space-y-1">
                        <div className="font-semibold text-gray-300">Como usar no servidor:</div>
                        <div>1. Dê <strong>Use</strong> na Slot Stone (drop de Bosses/Quests).</div>
                        <div>2. Clique na arma ou armadura no inventário.</div>
                        <div>3. O item ganha +1 slot de atributo (Crítico, Mana Leech ou Life Leech).</div>
                      </div>
                    )}

                    {index === 1 && (
                      <div className="bg-[#0A0A0A] p-3 rounded-lg border border-[#222] text-[11px] text-gray-400 space-y-1">
                        <div className="font-semibold text-gray-300">Funcionamento do Mercado:</div>
                        <div>1. Vá até o Depot de Yurots.</div>
                        <div>2. Use o comando de lojista para cadastrar o item e o valor de venda.</div>
                        <div>3. O seu lojista permanece vendendo mesmo com você offline!</div>
                      </div>
                    )}

                    {index === 2 && (
                      <div className="bg-[#0A0A0A] p-3 rounded-lg border border-[#222] text-[11px] text-gray-400 space-y-1">
                        <div className="font-semibold text-gray-300">Comandos & Configuração:</div>
                        <div>• Ativação rápida: configurável via <code>config.lua</code> ou comando de GOD.</div>
                        <div>• Bônus de 4 vocações diferentes na mesma party: +30% EXP dividida.</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Repository Files Tree Guide */}
              <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-3">
                <h4 className="font-bold text-white text-sm font-serif flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#C9A227]" />
                  <span>Estrutura de Pastas do Servidor MARLEYOT 7.72</span>
                </h4>
                <div className="bg-[#0A0A0A] p-3.5 rounded-lg border border-[#222] font-mono text-xs text-gray-300 space-y-1.5 overflow-x-auto">
                  <div>📁 <strong className="text-white">~/otserv/</strong></div>
                  <div className="pl-4">├── 📄 <span className="text-[#C9A227]">config.lua</span> <span className="text-gray-500">← Configurações de IP da Oracle, rates e banco MariaDB</span></div>
                  <div className="pl-4">├── 📄 <span className="text-[#C9A227]">schema.sql</span> <span className="text-gray-500">← Estrutura do banco de dados (tabelas players, accounts, player_storage)</span></div>
                  <div className="pl-4">├── ⚙️ <span className="text-green-400">yurOTS / tfs</span> <span className="text-gray-500">← Executável compilado C++</span></div>
                  <div className="pl-4">├── 📁 <strong className="text-white">data/</strong></div>
                  <div className="pl-8">├── 📁 <span className="text-sky-300">world/</span> → <span className="text-gray-400">yurots.otbm (Mapa clássico com spawns e houses)</span></div>
                  <div className="pl-8">├── 📁 <span className="text-sky-300">spells/</span> → <span className="text-gray-400">Magias 7.72 e runas clássicas (UH, SD, GFB, HMM, Explosion)</span></div>
                  <div className="pl-8">├── 📁 <span className="text-sky-300">monster/</span> → <span className="text-gray-400">Monstros clássicos (Dragon, Demon, Behemoth, Warlock, Dragon Lord)</span></div>
                  <div className="pl-8">├── 📁 <span className="text-sky-300">actions/</span> → <span className="text-gray-400">Sistema de Gemas, Quests (Annihilator, Demon Helmet) e baús</span></div>
                  <div className="pl-8">└── 📁 <span className="text-sky-300">npc/</span> → <span className="text-gray-400">Vendedores de runas em voz aberta no canal Default e barqueiros</span></div>
                  <div className="pl-4">└── 📁 <strong className="text-white">src/</strong> <span className="text-gray-500">← Código-fonte C++ do servidor para compilar com CMake</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
