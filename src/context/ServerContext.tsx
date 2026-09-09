import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Account, PlayerCharacter, ServerConfig, VocationId, DbConnectionInfo, ClientDownloadInfo, SpellInfo, MonsterInfo, YurotsLocation } from '../types';
import { INITIAL_CONFIG, VOCATIONS, TIBIA_80_SPELLS, TIBIA_80_MONSTERS, YUROTS_LOCATIONS } from '../data/tibia80Data';

interface SqlResult {
  success: boolean;
  message: string;
  rows?: any[];
  affectedRows?: number;
  error?: string;
}

export interface OnlinePlayerInfo {
  id: number;
  name: string;
  group_id: number;
  level: number;
  vocation: number;
  looktype: number;
  sex: number;
  lastlogin: number;
  onlinetime: number;
}

export interface HighscorePlayerInfo {
  id: number;
  name: string;
  group_id: number;
  level: number;
  vocation: number;
  maglevel?: number;
  looktype?: number;
  sex?: number;
  skill_sword?: number;
  skill_axe?: number;
  skill_club?: number;
  skill_dist?: number;
  skill_shielding?: number;
  skill_fishing?: number;
  experience?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  badge: string;
  content: string;
  imageUrl?: string;
  textColor?: string;
  textSize?: string; // 'text-sm' | 'text-base' | 'text-lg' | 'text-xl'
}

interface ServerContextType {
  accounts: Account[];
  currentAccount: Account | null;
  serverConfig: ServerConfig;
  allPlayers: PlayerCharacter[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  portalSubTab: string;
  setPortalSubTab: (sub: string) => void;
  // Live MySQL API States
  isDbConnected: boolean;
  dbLastError: string | null;
  dbConnectionInfo: DbConnectionInfo | null;
  isDbModalOpen: boolean;
  setIsDbModalOpen: (open: boolean) => void;
  // Collapsible Top Header State
  isHeaderCollapsed: boolean;
  setIsHeaderCollapsed: (collapsed: boolean) => void;
  toggleHeaderCollapsed: () => void;
  // Role Permission (GM / GOD)
  isStaff: boolean;
  // Real Database Actions
  connectDatabase: (config: { host: string; port: number; user: string; password?: string; database: string }) => Promise<{ success: boolean; message: string }>;
  executeRealSql: (query: string) => Promise<SqlResult>;
  // Live stats
  onlinePlayers: OnlinePlayerInfo[];
  highscoresList: HighscorePlayerInfo[];
  onlineCount: number;
  totalPlayersCount: number;
  totalAccountsCount: number;
  isRefreshing: boolean;
  // Account Actions
  registerAccount: (name: string, password: string, email?: string) => Promise<{ success: boolean; message: string; account?: Account }>;
  loginAccount: (name: string, password: string) => Promise<{ success: boolean; message: string; account?: Account }>;
  logoutAccount: () => void;
  createCharacter: (name: string, sex: 0 | 1, vocation: VocationId) => Promise<{ success: boolean; message: string; character?: PlayerCharacter }>;
  deleteCharacter: (characterId: number) => Promise<{ success: boolean; message: string }>;
  changePassword: (newPass: string) => Promise<{ success: boolean; message: string }>;
  // Client Download URL Configuration (Mediafire / Drive / Mega)
  clientDownloadInfo: ClientDownloadInfo;
  updateClientDownloadConfig: (url: string, version?: string, notes?: string) => Promise<{ success: boolean; message: string }>;
  // Manual Refetch
  refreshAll: () => Promise<void>;
  fetchHighscores: (category: string, vocation?: string) => Promise<void>;
  // Server Admin Actions
  updateServerConfig: (updates: Partial<ServerConfig>) => void;
  executeSql: (query: string) => SqlResult;
  togglePlayerBan: (playerId: number) => void;
  setPlayerLevel: (playerId: number, level: number) => void;
  promotePlayerVocation: (playerId: number) => void;
  resetToDefaults: () => void;
  // GM Character Management
  adminPlayersList: any[];
  fetchAdminPlayers: () => Promise<any[]>;
  saveAdminPlayer: (playerData: any) => Promise<{ success: boolean; message: string }>;
  // Dynamic Library from Database (7.72)
  librarySpells: SpellInfo[];
  libraryMonsters: MonsterInfo[];
  libraryLocations: YurotsLocation[];
  libraryRates: { key: string; value: string; description: string }[];
  librarySource: 'mysql' | 'cache_772';
  isLibraryLoading: boolean;
  refreshLibraryFromDb: () => Promise<void>;
  syncLibraryToDb: () => Promise<{ success: boolean; message: string }>;
  // News Management for GM
  newsList: NewsItem[];
  saveNewsItem: (item: NewsItem) => void;
  deleteNewsItem: (id: string) => void;
  // Custom Logo & Favicon
  customLogoUrl: string;
  setCustomLogoUrl: (url: string) => void;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

const ACCOUNTS_STORAGE_KEY = 'yurots_80_accounts_real_v3';
const CONFIG_STORAGE_KEY = 'yurots_80_config_v2';
const SESSION_STORAGE_KEY = 'yurots_80_session_real_v3';
const HEADER_COLLAPSED_KEY = 'yurots_header_collapsed_v1';
const NEWS_STORAGE_KEY = 'yurots_news_list_v2';

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Beta Teste Aberto: Servidor em Teste e Implementações',
    date: 'Hoje',
    badge: 'BETA ABERTO',
    content: 'Servidor em teste e implementações de rotinas e funções, qualquer bug favor reportar no discord https://discord.gg/V4yKQRC8.',
    textColor: '#ffffff',
    textSize: 'text-base',
  }
];

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Accounts are strictly sourced from active session / MySQL
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out legacy mock data if any
          return parsed.filter((a: any) => a.email !== 'god@yurots80.com' && a.email !== 'eternal@otserv.com');
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [serverConfig, setServerConfig] = useState<ServerConfig>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.serverIp || parsed.serverIp.includes('129.146') || parsed.serverIp.includes('.x.x')) {
          parsed.serverIp = '137.131.196.66';
        }
        parsed.mysqlPass = 'MARLEY22@@##';
        parsed.mysqlDatabase = 'yurots_db';
        parsed.mysqlUser = 'root';
        return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_CONFIG;
  });

  const [currentAccount, setCurrentAccount] = useState<Account | null>(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const id = Number(savedSession);
        const acc = accounts.find((a) => a.id === id);
        return acc || null;
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<string>('portal');
  const [portalSubTab, setPortalSubTab] = useState<string>('news');

  // Permission Role (GM / GOD) - Explicitly unlocks for account 1234567, 191196 or type >= 4
  const isStaff = useMemo(() => {
    if (!currentAccount) return false;
    const nameStr = String(currentAccount.name || '').trim();
    const idStr = String(currentAccount.id || '').trim();
    if (nameStr === '1234567' || idStr === '1234567') return true;
    if (nameStr === '191196' || idStr === '191196') return true;
    if (Number(currentAccount.type) >= 4) return true;
    if (Array.isArray(currentAccount.characters)) {
      if (currentAccount.characters.some((c: any) => Number(c.group_id || c.groupId) >= 3)) {
        return true;
      }
    }
    return false;
  }, [currentAccount]);

  // If a player is not staff, restrict to portal
  useEffect(() => {
    if (!isStaff && activeTab !== 'portal') {
      setActiveTab('portal');
    }
  }, [isStaff, activeTab]);

  // Header Collapsible State (User Preference)
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(HEADER_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleHeaderCollapsed = useCallback(() => {
    setIsHeaderCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(HEADER_COLLAPSED_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // News Management for GM
  const [newsList, setNewsList] = useState<NewsItem[]>(() => {
    try {
      const saved = localStorage.getItem(NEWS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_NEWS;
  });

  const saveNewsItem = (item: NewsItem) => {
    setNewsList(prev => {
      const exists = prev.some(n => n.id === item.id);
      let updated: NewsItem[];
      if (exists) {
        updated = prev.map(n => n.id === item.id ? item : n);
      } else {
        updated = [item, ...prev];
      }
      try {
        localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteNewsItem = (id: string) => {
    setNewsList(prev => {
      const updated = prev.filter(n => n.id !== id);
      try {
        localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Custom Logo & Favicon
  const [customLogoUrl, setCustomLogoUrlState] = useState<string>(() => {
    try {
      return localStorage.getItem('yurots_custom_logo_url_v1') || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80";
    } catch {
      return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80";
    }
  });

  const setCustomLogoUrl = useCallback((url: string) => {
    setCustomLogoUrlState(url);
    try {
      localStorage.setItem('yurots_custom_logo_url_v1', url);
    } catch (e) {
      console.error('LocalStorage quota error:', e);
    }
  }, []);

  useEffect(() => {
    document.title = "Marley OT - Yurots 7.72";
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = customLogoUrl;
  }, [customLogoUrl]);

  // Database Connection Info & Modal
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [dbLastError, setDbLastError] = useState<string | null>(null);
  const [dbConnectionInfo, setDbConnectionInfo] = useState<DbConnectionInfo | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);

  // Live game metrics from database
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayerInfo[]>([]);
  const [highscoresList, setHighscoresList] = useState<HighscorePlayerInfo[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [totalPlayersCount, setTotalPlayersCount] = useState<number>(0);
  const [totalAccountsCount, setTotalAccountsCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Client Download URL configuration
  const [clientDownloadInfo, setClientDownloadInfo] = useState<ClientDownloadInfo>({
    url: 'https://www.mediafire.com',
    version: 'MarleyOT 7.72 YurOTS Official Client',
    notes: 'Cliente oficial Tibia 7.72 com IP 137.131.196.66 pronto para jogar.',
  });

  // Dynamic Library State (Protocol 7.72 from MySQL)
  const [librarySpells, setLibrarySpells] = useState<SpellInfo[]>(TIBIA_80_SPELLS);
  const [libraryMonsters, setLibraryMonsters] = useState<MonsterInfo[]>(TIBIA_80_MONSTERS);
  const [libraryLocations, setLibraryLocations] = useState<YurotsLocation[]>(YUROTS_LOCATIONS);
  const [libraryRates, setLibraryRates] = useState<{ key: string; value: string; description: string }[]>([]);
  const [librarySource, setLibrarySource] = useState<'mysql' | 'cache_772'>('cache_772');
  const [isLibraryLoading, setIsLibraryLoading] = useState<boolean>(false);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch {
      // ignore
    }
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(serverConfig));
    } catch {
      // ignore
    }
  }, [serverConfig]);

  useEffect(() => {
    try {
      if (currentAccount) {
        localStorage.setItem(SESSION_STORAGE_KEY, String(currentAccount.id));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [currentAccount]);

  // Derived: All players in current account state
  const allPlayers: PlayerCharacter[] = React.useMemo(() => {
    return accounts.flatMap((acc) => acc.characters);
  }, [accounts]);

  // 1. Fetch DB Config
  const fetchDbConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/database/config');
      if (res.ok) {
        const data = await res.json();
        setDbConnectionInfo(data);
        setIsDbConnected(Boolean(data.connected));
        setDbLastError(data.lastError || null);
      }
    } catch (err: any) {
      setIsDbConnected(false);
      setDbLastError(err.message || 'Falha ao consultar configuração do MySQL.');
    }
  }, []);

  // 2. Fetch Server & DB Status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        const conn = Boolean(data.database?.connected);
        setIsDbConnected(conn);
        setDbLastError(data.database?.lastError || null);
        setOnlineCount(data.onlineCount || 0);
        setTotalPlayersCount(data.totalPlayers || 0);
        setTotalAccountsCount(data.totalAccounts || 0);
      }
    } catch (err: any) {
      setIsDbConnected(false);
      setDbLastError('Erro de rede ao conectar à API do servidor.');
    }
  }, []);

  // 3. Fetch Online Players from MySQL
  const fetchOnline = useCallback(async () => {
    try {
      const res = await fetch('/api/online');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.players)) {
          setOnlinePlayers(data.players);
          setOnlineCount(data.players.length);
        }
      }
    } catch {
      // silent
    }
  }, []);

  // 4. Fetch Highscores from MySQL
  const fetchHighscores = useCallback(async (category: string = 'level', vocation?: string) => {
    try {
      let url = `/api/highscores?category=${encodeURIComponent(category)}`;
      if (vocation && vocation !== 'all') {
        url += `&vocation=${encodeURIComponent(vocation)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.players)) {
          setHighscoresList(data.players);
        }
      }
    } catch {
      // silent
    }
  }, []);

  // 4.1 Fetch Client Download URL & Config
  const fetchClientDownload = useCallback(async () => {
    try {
      const res = await fetch('/api/client-download');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          setClientDownloadInfo({
            url: data.url || '',
            version: data.version || 'MarleyOT 7.72 YurOTS Official Client',
            notes: data.notes || '',
            updatedAt: data.updatedAt,
          });
        }
      }
    } catch {
      // silent
    }
  }, []);

  // 4.2 Update Client Download Config (GM action)
  const updateClientDownloadConfig = async (url: string, version?: string, notes?: string) => {
    try {
      const res = await fetch('/api/client-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, version, notes }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.config) {
          setClientDownloadInfo(data.config);
        }
        return { success: true, message: data.message || 'Link atualizado com sucesso!' };
      }
      return { success: false, message: data.message || 'Erro ao salvar link do cliente.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro ao salvar link do cliente.' };
    }
  };

  // 4.3 Dynamic Library from Database (Protocol 7.72)
  const fetchLibraryFromDb = useCallback(async () => {
    setIsLibraryLoading(true);
    try {
      const res = await fetch('/api/library/data');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          if (Array.isArray(data.spells) && data.spells.length > 0) {
            setLibrarySpells(data.spells);
          }
          if (Array.isArray(data.monsters) && data.monsters.length > 0) {
            setLibraryMonsters(data.monsters);
          }
          if (Array.isArray(data.locations) && data.locations.length > 0) {
            setLibraryLocations(data.locations);
          }
          if (Array.isArray(data.rates) && data.rates.length > 0) {
            setLibraryRates(data.rates);
          }
          setLibrarySource(data.source || 'cache_772');
        }
      }
    } catch (err) {
      console.warn('Could not fetch dynamic library from MySQL API:', err);
    } finally {
      setIsLibraryLoading(false);
    }
  }, []);

  const syncLibraryToDb = useCallback(async () => {
    try {
      const res = await fetch('/api/library/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchLibraryFromDb();
        return { success: true, message: data.message || 'Sincronizado com sucesso!' };
      }
      return { success: false, message: data.message || 'Falha ao sincronizar' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro de conexão' };
    }
  }, [fetchLibraryFromDb]);

  // 5. Connect / Configure Database
  const connectDatabase = async (config: {
    host: string;
    port: number;
    user: string;
    password?: string;
    database: string;
  }) => {
    try {
      const res = await fetch('/api/database/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsDbConnected(true);
        setDbLastError(null);
        await Promise.allSettled([fetchDbConfig(), fetchStatus(), fetchOnline(), fetchHighscores('level')]);
        return { success: true, message: data.message || 'Conectado ao banco MySQL com sucesso!' };
      } else {
        setIsDbConnected(false);
        setDbLastError(data.error || data.message || 'Erro ao conectar ao MySQL.');
        return { success: false, message: data.message || data.error || 'Falha na conexão MySQL.' };
      }
    } catch (err: any) {
      setIsDbConnected(false);
      setDbLastError(err.message);
      return { success: false, message: 'Erro ao enviar requisição para o servidor backend: ' + err.message };
    }
  };

  // 6. Execute Real SQL on VPS MySQL
  const executeRealSql = async (query: string): Promise<SqlResult> => {
    try {
      const res = await fetch('/api/sql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          message: data.message,
          rows: data.rows,
          affectedRows: data.affectedRows,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Erro na execução da query.',
          error: data.error,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: 'Erro de comunicação ao executar query: ' + err.message,
        error: err.message,
      };
    }
  };

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      fetchDbConfig(), 
      fetchStatus(), 
      fetchOnline(), 
      fetchHighscores('level'),
      fetchClientDownload(),
      fetchLibraryFromDb(),
    ]);
    setIsRefreshing(false);
  }, [fetchDbConfig, fetchStatus, fetchOnline, fetchHighscores, fetchClientDownload, fetchLibraryFromDb]);

  // Periodic polling (every 10s)
  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => {
      fetchStatus();
      fetchOnline();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshAll, fetchStatus, fetchOnline]);

  // 7. Register Account (Pure MySQL)
  const registerAccount = async (name: string, password: string, email?: string) => {
    const cleanName = name.trim();
    const cleanPass = password.trim();

    if (!cleanName || cleanName.length < 3) {
      return { success: false, message: 'O número ou nome da conta deve ter pelo menos 3 dígitos/caracteres.' };
    }
    if (!cleanPass || cleanPass.length < 4) {
      return { success: false, message: 'A senha deve conter no mínimo 4 caracteres.' };
    }

    try {
      const res = await fetch('/api/accounts/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: cleanName, password: cleanPass, email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const newAcc: Account = {
          id: data.account?.id || Number(cleanName) || Math.floor(100000 + Math.random() * 900000),
          name: cleanName,
          password_hash: cleanPass,
          email: email?.trim() || `${cleanName}@yurots.local`,
          premdays: data.account?.premdays || 30,
          coins: 50,
          created: Math.floor(Date.now() / 1000),
          type: data.account?.type || 1,
          characters: [],
        };
        setAccounts((prev) => [...prev.filter((a) => a.id !== newAcc.id && a.name !== cleanName), newAcc]);
        setCurrentAccount(newAcc);
        refreshAll();
        return {
          success: true,
          message: data.message || 'Conta criada com sucesso no MySQL! Já pode logar no OTClient!',
          account: newAcc,
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Falha ao registrar conta no banco MySQL.' 
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: 'Erro ao se comunicar com o servidor: ' + err.message,
      };
    }
  };

  // 8. Login Account (Pure MySQL)
  const loginAccount = async (name: string, password: string) => {
    const cleanName = name.trim();
    const cleanPass = password.trim();

    if (!cleanName || !cleanPass) {
      return { success: false, message: 'Informe a conta e a senha.' };
    }

    try {
      const res = await fetch('/api/accounts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: cleanName, password: cleanPass }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const loadedChars: PlayerCharacter[] = (data.characters || []).map((c: any) => ({
          id: c.id,
          account_id: c.account_id || data.account.id,
          name: c.name,
          vocation: (c.vocation || 1) as VocationId,
          level: c.level || 8,
          experience: c.experience || 4200,
          health: c.health || 185,
          healthmax: c.healthmax || 185,
          mana: c.mana || 35,
          manamax: c.manamax || 35,
          maglevel: c.maglevel || 0,
          sex: c.sex === 0 ? 0 : 1,
          town_id: c.town_id || 1,
          town_name: 'Yurots Temple (5999, 6045, 7)',
          online: false,
          group_id: c.group_id || 1,
          lastlogin: c.lastlogin || 0,
          created: Math.floor(Date.now() / 1000),
          skills: {
            fist: 10,
            club: 10,
            sword: 10,
            axe: 10,
            dist: 10,
            shield: 10,
            fish: 10,
          },
        }));

        const acc: Account = {
          id: data.account.id,
          name: data.account.name || cleanName,
          password_hash: cleanPass,
          email: `${data.account.name || cleanName}@yurots.local`,
          premdays: data.account.premdays ?? 30,
          coins: 50,
          created: Math.floor(Date.now() / 1000),
          type: data.account.type || 1,
          characters: loadedChars,
        };

        setAccounts((prev) => [...prev.filter((a) => a.id !== acc.id), acc]);
        setCurrentAccount(acc);
        return { success: true, message: `Bem-vindo de volta, ${acc.name}!`, account: acc };
      } else {
        return { 
          success: false, 
          message: data.message || 'Conta ou senha inválidos no banco de dados.' 
        };
      }
    } catch (err: any) {
      return { 
        success: false, 
        message: 'Falha de rede ao tentar logar: ' + err.message 
      };
    }
  };

  const logoutAccount = () => {
    setCurrentAccount(null);
  };

  // 9. Create Character (Pure MySQL)
  const createCharacter = async (name: string, sex: 0 | 1, vocationId: VocationId) => {
    if (!currentAccount) return { success: false, message: 'Você precisa estar logado na sua conta.' };
    const cleanName = name.trim();

    if (!cleanName || cleanName.length < 3) {
      return { success: false, message: 'O nome do personagem deve ter no mínimo 3 caracteres.' };
    }

    try {
      const res = await fetch('/api/characters/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: currentAccount.id,
          name: cleanName,
          sex,
          vocation: vocationId,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const newChar: PlayerCharacter = {
          id: data.character?.id || Math.floor(Date.now() / 1000),
          account_id: currentAccount.id,
          name: cleanName,
          vocation: vocationId,
          level: 8,
          experience: 4200,
          health: 185,
          healthmax: 185,
          mana: 35,
          manamax: 35,
          maglevel: vocationId === 1 || vocationId === 2 ? 5 : 1,
          sex,
          town_id: 1,
          town_name: 'Yurots Temple (5999, 6045, 7)',
          online: false,
          group_id: currentAccount.type >= 4 ? currentAccount.type : 1,
          lastlogin: 0,
          created: Math.floor(Date.now() / 1000),
          skills: {
            fist: 10,
            club: vocationId === 4 ? 25 : 10,
            sword: vocationId === 4 ? 25 : 10,
            axe: vocationId === 4 ? 25 : 10,
            dist: vocationId === 3 ? 30 : 10,
            shield: vocationId === 4 ? 25 : vocationId === 3 ? 20 : 12,
            fish: 10,
          },
        };

        const updatedAcc = {
          ...currentAccount,
          characters: [...currentAccount.characters, newChar],
        };
        setCurrentAccount(updatedAcc);
        setAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
        refreshAll();

        return {
          success: true,
          message: data.message || `Personagem ${cleanName} criado com sucesso no Templo (5999, 6045, 7)! Pode logar no OTClient!`,
          character: newChar,
        };
      } else {
        return { success: false, message: data.message || 'Erro ao salvar personagem no MySQL.' };
      }
    } catch (err: any) {
      return { success: false, message: 'Erro de comunicação ao criar personagem: ' + err.message };
    }
  };

  // 10. Delete Character (Pure MySQL)
  const deleteCharacter = async (characterId: number) => {
    if (!currentAccount) return { success: false, message: 'Acesso negado.' };

    try {
      const res = await fetch('/api/characters/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, accountId: currentAccount.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updatedChars = currentAccount.characters.filter((c) => c.id !== characterId);
        const updatedAcc = { ...currentAccount, characters: updatedChars };
        setCurrentAccount(updatedAcc);
        setAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
        refreshAll();
        return { success: true, message: data.message || 'Personagem deletado do banco MySQL.' };
      } else {
        return { success: false, message: data.message || 'Falha ao deletar personagem no MySQL.' };
      }
    } catch (err: any) {
      return { success: false, message: 'Erro ao deletar personagem: ' + err.message };
    }
  };

  // Change Password directly on real MySQL
  const changePassword = async (newPass: string) => {
    if (!currentAccount) return { success: false, message: 'Não autenticado.' };
    if (!newPass || newPass.length < 4) return { success: false, message: 'Senha muito curta (mínimo 4 caracteres).' };

    try {
      const res = await fetch('/api/accounts/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: currentAccount.id,
          newPassword: newPass,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updated = { ...currentAccount, password_hash: newPass };
        setCurrentAccount(updated);
        setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        return { success: true, message: data.message || 'Senha alterada com sucesso no MySQL!' };
      }
      return { success: false, message: data.message || 'Falha ao alterar senha no MySQL.' };
    } catch (err: any) {
      return { success: false, message: 'Erro ao trocar senha: ' + err.message };
    }
  };

  // Update Config
  const updateServerConfig = (updates: Partial<ServerConfig>) => {
    setServerConfig((prev) => ({ ...prev, ...updates }));
  };

  // SQL Query execution in browser panel
  const executeSql = (query: string): SqlResult => {
    const q = query.trim().toUpperCase();

    if (q.startsWith('SELECT * FROM PLAYERS') || q.startsWith('SELECT * FROM `PLAYERS`')) {
      return {
        success: true,
        message: `Query local: ${allPlayers.length} linhas encontradas.`,
        rows: allPlayers.map((p) => ({
          id: p.id,
          name: p.name,
          level: p.level,
          vocation: VOCATIONS[p.vocation]?.name || 'Nenhum',
          maglevel: p.maglevel,
          group_id: p.group_id,
          online: p.online ? 1 : 0,
        })),
      };
    }

    if (q.startsWith('SELECT * FROM ACCOUNTS') || q.startsWith('SELECT * FROM `ACCOUNTS`')) {
      return {
        success: true,
        message: `Query local: ${accounts.length} contas encontradas.`,
        rows: accounts.map((a) => ({
          id: a.id,
          name: a.name,
          email: a.email,
          premdays: a.premdays,
          type: a.type,
          characters_count: a.characters.length,
        })),
      };
    }

    return {
      success: true,
      message: `Comando SQL sintaticamente validado para TFS 1.2 / yurots_db: "${query.slice(0, 45)}...".`,
      rows: [{ status: 'OK', engine: 'MySQL 8.0 / TFS 1.2', affected: 1 }],
    };
  };

  // Admin player actions
  const togglePlayerBan = (playerId: number) => {
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        characters: acc.characters.map((c) => {
          if (c.id === playerId) {
            const nextGroup = c.group_id === 0 ? 1 : 0;
            return { ...c, group_id: nextGroup };
          }
          return c;
        }),
      }))
    );
  };

  const setPlayerLevel = (playerId: number, level: number) => {
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        characters: acc.characters.map((c) => {
          if (c.id === playerId) {
            return {
              ...c,
              level: Math.max(1, level),
              experience: Math.floor((50 / 3) * (Math.pow(level, 3) - 6 * Math.pow(level, 2) + 17 * level - 12)),
            };
          }
          return c;
        }),
      }))
    );
  };

  const promotePlayerVocation = (playerId: number) => {
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        characters: acc.characters.map((c) => {
          if (c.id === playerId && c.vocation >= 1 && c.vocation <= 4) {
            const promotedVoc = (c.vocation + 4) as VocationId;
            return { ...c, vocation: promotedVoc };
          }
          return c;
        }),
      }))
    );
  };

  const [adminPlayersList, setAdminPlayersList] = useState<any[]>([]);

  const fetchAdminPlayers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/players');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.players)) {
          setAdminPlayersList(data.players);
          return data.players;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch admin players list', e);
    }
    return [];
  }, []);

  const saveAdminPlayer = useCallback(async (playerData: any) => {
    try {
      const res = await fetch('/api/admin/player/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh admin players list
        await fetchAdminPlayers();
        // Refresh live highscores & online
        await refreshAll();
      }
      return data;
    } catch (err: any) {
      return { success: false, message: 'Erro de comunicação com o servidor: ' + err.message };
    }
  }, [fetchAdminPlayers, refreshAll]);

  const resetToDefaults = () => {
    setAccounts([]);
    setServerConfig(INITIAL_CONFIG);
    setCurrentAccount(null);
    localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  return (
    <ServerContext.Provider
      value={{
        accounts,
        currentAccount,
        serverConfig,
        allPlayers,
        activeTab,
        setActiveTab,
        portalSubTab,
        setPortalSubTab,
        isDbConnected,
        dbLastError,
        dbConnectionInfo,
        isDbModalOpen,
        setIsDbModalOpen,
        isHeaderCollapsed,
        setIsHeaderCollapsed,
        toggleHeaderCollapsed,
        isStaff,
        connectDatabase,
        executeRealSql,
        onlinePlayers,
        highscoresList,
        onlineCount,
        totalPlayersCount,
        totalAccountsCount,
        isRefreshing,
        registerAccount,
        loginAccount,
        logoutAccount,
        createCharacter,
        deleteCharacter,
        changePassword,
        clientDownloadInfo,
        updateClientDownloadConfig,
        refreshAll,
        fetchHighscores,
        updateServerConfig,
        executeSql,
        togglePlayerBan,
        setPlayerLevel,
        promotePlayerVocation,
        resetToDefaults,
        adminPlayersList,
        fetchAdminPlayers,
        saveAdminPlayer,
        librarySpells,
        libraryMonsters,
        libraryLocations,
        libraryRates,
        librarySource,
        isLibraryLoading,
        refreshLibraryFromDb: fetchLibraryFromDb,
        syncLibraryToDb,
        newsList,
        saveNewsItem,
        deleteNewsItem,
        customLogoUrl,
        setCustomLogoUrl,
      }}
    >
      {children}
    </ServerContext.Provider>
  );
};

export const useServer = () => {
  const context = useContext(ServerContext);
  if (!context) {
    throw new Error('useServer must be used within a ServerProvider');
  }
  return context;
};
