import React, { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';
import { generateConfigLua, generateTfsSchemaSql, VOCATIONS } from '../data/tibia80Data';
import { AdminPlayerEditorModal } from './AdminPlayerEditorModal';
import { 
  ShieldAlert, 
  Database, 
  Terminal, 
  Settings, 
  Download, 
  Copy, 
  Check, 
  Play, 
  UserCheck, 
  UserX, 
  Crown,
  FileCode,
  Sparkles,
  RefreshCw,
  Edit3,
  Search
} from 'lucide-react';

export const AdminGodTab: React.FC = () => {
  const { 
    accounts, 
    allPlayers, 
    serverConfig, 
    updateServerConfig, 
    executeSql, 
    executeRealSql,
    isDbConnected,
    setIsDbModalOpen,
    togglePlayerBan, 
    setPlayerLevel,
    promotePlayerVocation,
    resetToDefaults,
    adminPlayersList,
    fetchAdminPlayers,
    saveAdminPlayer,
    customLogoUrl,
    setCustomLogoUrl,
  } = useServer();

  const [activeSubTab, setActiveSubTab] = useState<'database' | 'sql' | 'config' | 'schema' | 'branding'>('database');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM players;');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [isRunningSql, setIsRunningSql] = useState(false);
  const [copiedLua, setCopiedLua] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Search filter and GM editor modal
  const [playerSearch, setPlayerSearch] = useState('');
  const [selectedPlayerForEdit, setSelectedPlayerForEdit] = useState<any | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    fetchAdminPlayers();
  }, [fetchAdminPlayers, isDbConnected]);

  // Edit level modal
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [newLevelVal, setNewLevelVal] = useState<number>(100);

  // Generate configs
  const configLuaText = generateConfigLua(serverConfig);
  const schemaSqlText = generateTfsSchemaSql(serverConfig);

  const handleRunSql = async (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    if (isDbConnected) {
      setIsRunningSql(true);
      const res = await executeRealSql(q);
      setSqlResult(res);
      setIsRunningSql(false);
    } else {
      const res = executeSql(q);
      setSqlResult(res);
    }
  };

  const handleDownload = (filename: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, type: 'lua' | 'sql') => {
    navigator.clipboard.writeText(text);
    if (type === 'lua') {
      setCopiedLua(true);
      setTimeout(() => setCopiedLua(false), 2000);
    } else {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-[#C9A227]/10 border border-[#C9A227]/30 px-3 py-0.5 rounded-full text-xs font-semibold text-[#C9A227]">
              <ShieldAlert className="w-4 h-4 text-[#C9A227]" />
              Painel de Controle do Administrador (GOD)
            </div>
            <h2 className="text-2xl font-bold font-serif text-white">
              Gerenciamento do Servidor & Banco de Dados MySQL
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Gerencie contas, edite personagens, execute comandos SQL no banco MariaDB/MySQL 
              e exporte os arquivos <code>config.lua</code> e <code>schema.sql</code> para o servidor da Oracle Cloud.
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm('Deseja resetar o banco de dados simulado para o estado inicial?')) {
                resetToDefaults();
              }
            }}
            className="text-xs bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-[#333] transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex bg-[#0A0A0A] border border-[#222222] rounded-xl p-1 max-w-2xl shadow-md">
        <button
          onClick={() => setActiveSubTab('database')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'database' ? 'bg-[#1A1A1A] border border-[#333] text-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.15)]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Jogadores & Contas</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sql')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'sql' ? 'bg-[#1A1A1A] border border-[#333] text-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.15)]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Console SQL</span>
        </button>

        <button
          onClick={() => setActiveSubTab('config')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'config' ? 'bg-[#1A1A1A] border border-[#333] text-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.15)]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Gerador config.lua</span>
        </button>

        <button
          onClick={() => setActiveSubTab('schema')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'schema' ? 'bg-[#1A1A1A] border border-[#333] text-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.15)]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Exportar schema.sql</span>
        </button>

        <button
          onClick={() => setActiveSubTab('branding')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'branding' ? 'bg-[#1A1A1A] border border-[#333] text-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.15)]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Logo & Ícone</span>
        </button>
      </div>

      {/* TAB: DATABASE / PLAYERS & ACCOUNTS */}
      {activeSubTab === 'database' && (
        <div className="space-y-6">
          {/* Players Table */}
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#C9A227]/10 rounded-lg text-[#C9A227] border border-[#C9A227]/20">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-white">
                    Tabela de Personagens (players)
                  </h3>
                  <div className="text-xs text-gray-400">
                    {adminPlayersList.length > 0 ? (
                      <span className="text-emerald-400 font-semibold">
                        ● Conectado ao MySQL ({adminPlayersList.length} jogadores no banco)
                      </span>
                    ) : (
                      <span>{allPlayers.length} registros locais</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou conta..."
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    className="bg-[#0A0A0A] border border-[#262626] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A227] w-56"
                  />
                </div>
                <button
                  onClick={() => fetchAdminPlayers()}
                  className="p-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] rounded-lg text-gray-300 hover:text-white transition"
                  title="Recarregar jogadores do MySQL"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0A0A] text-gray-400 border-b border-[#222222]">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Nome</th>
                    <th className="p-3">Conta</th>
                    <th className="p-3">Prem Days</th>
                    <th className="p-3">Vocação</th>
                    <th className="p-3">Level</th>
                    <th className="p-3">Fist (Atk Spd)</th>
                    <th className="p-3">Grupo</th>
                    <th className="p-3 text-right">Ações de GM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]">
                  {(() => {
                    const baseList = adminPlayersList.length > 0 ? adminPlayersList : allPlayers;
                    const filtered = baseList.filter((p: any) => {
                      if (!playerSearch) return true;
                      const s = playerSearch.toLowerCase();
                      return (
                        String(p.name || '').toLowerCase().includes(s) ||
                        String(p.account_id || '').includes(s) ||
                        String(p.account_name || '').toLowerCase().includes(s)
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={9} className="p-6 text-center text-gray-500">
                            Nenhum personagem encontrado com os critérios de busca.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((p: any) => (
                      <tr key={p.id} className="hover:bg-[#161616] transition">
                        <td className="p-3 font-mono text-gray-500">#{p.id}</td>
                        <td className="p-3 font-bold text-gray-200 flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {p.group_id >= 4 && (
                            <Crown className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                          )}
                        </td>
                        <td className="p-3 font-mono text-gray-400">
                          {p.account_name ? `${p.account_name} (#${p.account_id})` : `#${p.account_id}`}
                        </td>
                        <td className="p-3 font-bold text-amber-400">
                          {p.account_premdays !== undefined ? `${p.account_premdays}d` : '-'}
                        </td>
                        <td className="p-3 text-gray-300">
                          {VOCATIONS[p.vocation]?.name || `Voc #${p.vocation}`}
                        </td>
                        <td className="p-3 font-bold text-[#C9A227]">{p.level}</td>
                        <td className="p-3 font-bold text-emerald-400">
                          {p.skill_fist ?? 10}
                        </td>
                        <td className="p-3">
                          {p.group_id === 0 ? (
                            <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-bold">
                              BANIDO (0)
                            </span>
                          ) : p.group_id >= 5 ? (
                            <span className="text-[10px] bg-[#C9A227]/15 text-[#C9A227] border border-[#C9A227]/30 px-1.5 py-0.5 rounded font-bold">
                              GOD ({p.group_id})
                            </span>
                          ) : p.group_id >= 2 ? (
                            <span className="text-[10px] bg-sky-500/15 text-sky-400 border border-sky-500/30 px-1.5 py-0.5 rounded font-bold">
                              GM / Staff ({p.group_id})
                            </span>
                          ) : (
                            <span className="text-[10px] bg-[#1A1A1A] border border-[#262626] text-gray-400 px-1.5 py-0.5 rounded">
                              Player (1)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedPlayerForEdit(p);
                              setIsEditorOpen(true);
                            }}
                            className="text-[11px] bg-[#C9A227]/15 hover:bg-[#C9A227]/25 border border-[#C9A227]/40 text-[#C9A227] px-2.5 py-1 rounded-md font-bold transition inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar Completo</span>
                          </button>

                          <button
                            onClick={() => togglePlayerBan(p.id)}
                            className={`text-[11px] px-2 py-1 rounded transition ${
                              p.group_id === 0
                                ? 'bg-green-500/15 text-green-300 border border-green-500/30 hover:bg-green-500/25'
                                : 'bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25'
                            }`}
                          >
                            {p.group_id === 0 ? 'Desbanir' : 'Banir'}
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[#C9A227]" />
              <span>Tabela de Contas (accounts) - {accounts.length} Registros</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0A0A] text-gray-400 border-b border-[#222222]">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Conta / Número</th>
                    <th className="p-3">E-mail</th>
                    <th className="p-3">Dias VIP</th>
                    <th className="p-3">Coins</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Qtd Personagens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]">
                  {accounts.map((a) => (
                    <tr key={a.id} className="hover:bg-[#161616] transition">
                      <td className="p-3 font-mono text-gray-500">#{a.id}</td>
                      <td className="p-3 font-bold text-gray-200">{a.name}</td>
                      <td className="p-3 text-gray-400">{a.email}</td>
                      <td className="p-3 text-[#C9A227] font-bold">{a.premdays} dias</td>
                      <td className="p-3 text-[#C9A227]">{a.coins}</td>
                      <td className="p-3">
                        {a.type >= 5 ? (
                          <span className="text-[#C9A227] font-bold">GOD (Tipo 5)</span>
                        ) : (
                          <span className="text-gray-400">Normal (Tipo 1)</span>
                        )}
                      </td>
                      <td className="p-3 font-mono">{a.characters.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SQL CONSOLE */}
      {activeSubTab === 'sql' && (
        <div className="space-y-6">
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-serif text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#C9A227]" />
                <span>Console SQL {isDbConnected ? '(MySQL yurots_db Online)' : '(Desconectado)'}</span>
              </h3>
              <button
                onClick={() => setIsDbModalOpen(true)}
                className={`text-xs px-2.5 py-1 rounded border transition cursor-pointer ${
                  isDbConnected 
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400' 
                    : 'bg-amber-950/60 border-amber-500/40 text-amber-400 hover:bg-amber-900/60'
                }`}
              >
                {isDbConnected ? 'MySQL Conectado' : 'Conectar MySQL'}
              </button>
            </div>

            {/* Quick Queries Buttons */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-gray-400 self-center text-[11px]">Queries Rápidas:</span>
              <button
                onClick={() => {
                  setSqlQuery('SELECT * FROM players;');
                  handleRunSql('SELECT * FROM players;');
                }}
                className="bg-[#0A0A0A] hover:bg-[#1A1A1A] text-gray-300 px-2.5 py-1 rounded border border-[#222222] transition"
              >
                SELECT * FROM players
              </button>
              <button
                onClick={() => {
                  setSqlQuery('SELECT * FROM accounts;');
                  handleRunSql('SELECT * FROM accounts;');
                }}
                className="bg-[#0A0A0A] hover:bg-[#1A1A1A] text-gray-300 px-2.5 py-1 rounded border border-[#222222] transition"
              >
                SELECT * FROM accounts
              </button>
              <button
                onClick={() => {
                  setSqlQuery('UPDATE accounts SET premdays = premdays + 30;');
                  handleRunSql('UPDATE accounts SET premdays = premdays + 30;');
                }}
                className="bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#C9A227] px-2.5 py-1 rounded border border-[#222222] transition"
              >
                +30 Dias VIP a Todos
              </button>
              <button
                onClick={() => {
                  setSqlQuery('UPDATE players SET level = 100;');
                  handleRunSql('UPDATE players SET level = 100;');
                }}
                className="bg-[#0A0A0A] hover:bg-[#1A1A1A] text-sky-300 px-2.5 py-1 rounded border border-[#222222] transition"
              >
                Setar Todos Level 100
              </button>
            </div>

            {/* SQL Input */}
            <div className="space-y-2">
              <textarea
                rows={3}
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                placeholder="Digite seu comando SQL compatível com TFS 1.2..."
                className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl p-3 text-xs font-mono text-[#E0E0E0] focus:outline-none focus:border-[#C9A227]"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => handleRunSql()}
                  className="bg-[#C9A227] hover:bg-[#b58f1f] text-[#0A0A0A] font-bold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5 shadow-[0_0_10px_rgba(201,162,39,0.2)]"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Executar Consulta</span>
                </button>
              </div>
            </div>

            {/* SQL Output Box */}
            {sqlResult && (
              <div className="space-y-2 pt-2 border-t border-[#222222]">
                <div className={`p-3 rounded-lg text-xs font-mono flex items-center justify-between ${
                  sqlResult.success ? 'bg-green-950/30 border border-green-500/40 text-green-300' : 'bg-red-950/30 border border-red-500/40 text-red-300'
                }`}>
                  <span>{sqlResult.message}</span>
                </div>

                {sqlResult.rows && sqlResult.rows.length > 0 && (
                  <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl overflow-x-auto max-h-64">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead className="bg-[#111111] text-gray-400 border-b border-[#222222]">
                        <tr>
                          {Object.keys(sqlResult.rows[0]).map((key) => (
                            <th key={key} className="p-2.5">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1F1F1F] text-gray-200">
                        {sqlResult.rows.map((row: any, rIdx: number) => (
                          <tr key={rIdx} className="hover:bg-[#161616]">
                            {Object.values(row).map((val: any, vIdx: number) => (
                              <td key={vIdx} className="p-2.5 whitespace-nowrap">{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: CONFIG.LUA GENERATOR */}
      {activeSubTab === 'config' && (
        <div className="space-y-6">
          {/* Settings inputs */}
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold font-serif text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#C9A227]" />
              <span>Ajustar Parâmetros do config.lua do Servidor</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Nome do Servidor (serverName):</label>
                <input
                  type="text"
                  value={serverConfig.serverName}
                  onChange={(e) => updateServerConfig({ serverName: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2 text-gray-100 font-mono focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">IP Público da Oracle (ip):</label>
                <input
                  type="text"
                  value={serverConfig.serverIp}
                  onChange={(e) => updateServerConfig({ serverIp: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2 text-[#C9A227] font-mono focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Senha do MySQL (sqlPass):</label>
                <input
                  type="text"
                  value={serverConfig.mysqlPass}
                  onChange={(e) => updateServerConfig({ mysqlPass: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2 text-gray-100 font-mono focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Taxa de EXP (rateExp):</label>
                <input
                  type="number"
                  value={serverConfig.rateExp}
                  onChange={(e) => updateServerConfig({ rateExp: Number(e.target.value) })}
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2 text-gray-100 font-mono focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Taxa de Skills (rateSkill):</label>
                <input
                  type="number"
                  value={serverConfig.rateSkill}
                  onChange={(e) => updateServerConfig({ rateSkill: Number(e.target.value) })}
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2 text-gray-100 font-mono focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Taxa de Magic (rateMagic):</label>
                <input
                  type="number"
                  value={serverConfig.rateMagic}
                  onChange={(e) => updateServerConfig({ rateMagic: Number(e.target.value) })}
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2 text-gray-100 font-mono focus:outline-none focus:border-[#C9A227]"
                />
              </div>
            </div>
          </div>

          {/* Generated Code Preview */}
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-serif text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#C9A227]" />
                <span>config.lua Gerado Pronto para Uso</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(configLuaText, 'lua')}
                  className="text-xs bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-gray-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                >
                  {copiedLua ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLua ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  onClick={() => handleDownload('config.lua', configLuaText)}
                  className="text-xs bg-[#C9A227] hover:bg-[#b58f1f] text-[#0A0A0A] px-3 py-1.5 rounded-lg transition flex items-center gap-1 font-bold shadow-[0_0_10px_rgba(201,162,39,0.2)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar config.lua</span>
                </button>
              </div>
            </div>

            <pre className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222] text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre leading-relaxed max-h-96">
              {configLuaText}
            </pre>
          </div>
        </div>
      )}

      {/* TAB: SCHEMA.SQL */}
      {activeSubTab === 'schema' && (
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-serif text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#C9A227]" />
              <span>schema.sql Oficial para YurOTS (Protocolo 7.72 Old School)</span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(schemaSqlText, 'sql')}
                className="text-xs bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-gray-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copiado!' : 'Copiar'}</span>
              </button>
              <button
                onClick={() => handleDownload('schema.sql', schemaSqlText)}
                className="text-xs bg-[#C9A227] hover:bg-[#b58f1f] text-[#0A0A0A] px-3 py-1.5 rounded-lg transition flex items-center gap-1 font-bold shadow-[0_0_10px_rgba(201,162,39,0.2)]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar schema.sql</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Importe este arquivo no seu MariaDB executando: 
            <code className="text-[#C9A227] bg-[#0A0A0A] px-2 py-0.5 rounded border border-[#222222] ml-1">
              mysql -u otserv -p otserv_db &lt; schema.sql
            </code>
          </p>

          <pre className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222] text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre leading-relaxed max-h-96">
            {schemaSqlText}
          </pre>
        </div>
      )}

      {/* TAB: BRANDING / LOGO & FAVICON */}
      {activeSubTab === 'branding' && (
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C9A227]/10 rounded-lg text-[#C9A227] border border-[#C9A227]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-white">
                Personalização do Logotipo & Ícone do Navegador
              </h3>
              <p className="text-xs text-gray-400">
                Envie o logotipo oficial do servidor. A imagem será exibida ao lado do nome no topo do portal e na aba/janela do navegador (favicon).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-[#0a0a0a] border border-[#222] p-6 rounded-xl">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#333] rounded-xl bg-black/40 gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#C9A227]/60 bg-[#1a1711] shadow-lg flex items-center justify-center">
                <img 
                  src={customLogoUrl} 
                  alt="Logo Preview" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-center">
                <div className="text-xs font-mono text-gray-300">Logotipo Atual</div>
                <div className="text-[10px] text-gray-500">Recomendado: PNG ou JPG quadrado (ex: 128x128px)</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-300 block">Enviar nova imagem de logotipo:</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (uploadEvent) => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const MAX_SIZE = 128;
                          let width = img.width;
                          let height = img.height;
                          if (width > height) {
                            if (width > MAX_SIZE) {
                              height *= MAX_SIZE / width;
                              width = MAX_SIZE;
                            }
                          } else {
                            if (height > MAX_SIZE) {
                              width *= MAX_SIZE / height;
                              height = MAX_SIZE;
                            }
                          }
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.drawImage(img, 0, 0, width, height);
                            const compressedDataUrl = canvas.toDataURL('image/png', 0.9);
                            setCustomLogoUrl(compressedDataUrl);
                            alert('Logotipo salvo e persistido com sucesso! Aplicado na aba do navegador e no topo do site.');
                          }
                        };
                        img.src = uploadEvent.target?.result as string;
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#C9A227] file:text-black hover:file:bg-[#b08d1f] file:cursor-pointer cursor-pointer bg-[#151515] border border-[#262626] rounded-xl p-2"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    setCustomLogoUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80");
                    alert('Logotipo restaurado para o padrão.');
                  }}
                  className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#252525] text-gray-300 border border-[#333] rounded-lg text-xs font-mono transition"
                >
                  Restaurar Padrão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GM Full Player Editor Modal */}
      {selectedPlayerForEdit && (
        <AdminPlayerEditorModal
          player={selectedPlayerForEdit}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedPlayerForEdit(null);
          }}
          onSave={saveAdminPlayer}
        />
      )}
    </div>
  );
};
