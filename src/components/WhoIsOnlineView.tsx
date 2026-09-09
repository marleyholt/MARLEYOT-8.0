import React, { useState } from 'react';
import { useServer } from '../context/ServerContext';
import { VOCATIONS } from '../data/tibia80Data';
import { Users, RefreshCw, Search, Shield, Zap, Flame, Crown, Swords, Clock } from 'lucide-react';

export const WhoIsOnlineView: React.FC = () => {
  const { onlinePlayers, onlineCount, isDbConnected, refreshAll, isRefreshing, setIsDbModalOpen, dbLastError } = useServer();
  const [filterVoc, setFilterVoc] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = onlinePlayers.filter((p) => {
    const matchesVoc = filterVoc === 'all' || String(p.vocation) === filterVoc;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVoc && matchesSearch;
  });

  const getVocationName = (vocId: number) => {
    const v = VOCATIONS[vocId as keyof typeof VOCATIONS];
    return v ? v.name : 'Sem Vocação';
  };

  const getGroupBadge = (groupId: number) => {
    if (groupId >= 5) {
      return (
        <span className="inline-flex items-center gap-1 bg-red-950/70 border border-red-500/50 text-red-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-[0_0_8px_rgba(239,68,68,0.3)]">
          <Crown className="w-3 h-3 text-red-400" />
          GOD
        </span>
      );
    }
    if (groupId === 4 || groupId === 3) {
      return (
        <span className="inline-flex items-center gap-1 bg-blue-950/70 border border-blue-500/50 text-blue-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-[0_0_8px_rgba(59,130,246,0.3)]">
          <Shield className="w-3 h-3 text-blue-400" />
          GM / Staff
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-700/60 text-zinc-400 text-[10px] uppercase px-1.5 py-0.5 rounded">
        Player
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Classic Dark Medieval Frame */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#14120e] via-[#1a1713] to-[#12100d] border-2 border-[#8C6B1C]/50 p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 border text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                isDbConnected 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {isDbConnected ? 'Ao Vivo no MySQL' : 'MySQL Desconectado'}
              </span>
              <button
                onClick={() => setIsDbModalOpen(true)}
                className="text-xs text-[#C9A227] hover:underline font-mono cursor-pointer"
              >
                {isDbConnected ? 'Base: yurots_db (MySQL / MariaDB)' : 'Clique para Conectar ao Banco'}
              </button>
            </div>
            <h2 className="text-2xl font-bold font-serif text-white tracking-wide flex items-center gap-2.5">
              <Users className="w-6 h-6 text-[#C9A227]" />
              Quem está Online (Who is Online)
            </h2>
            <p className="text-xs text-gray-400 max-w-xl">
              Lista atualizada em tempo real com todos os heróis, mestres de magia e aventureiros conectados ao MARLEYOT Yurots 7.72.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#0b0a09] border border-[#8C6B1C]/40 px-4 py-2.5 rounded-lg text-center shadow-inner">
              <div className="text-[10px] uppercase font-mono text-[#C9A227] tracking-wider font-semibold">
                Total Conectados
              </div>
              <div className="text-2xl font-bold text-white font-serif">
                {onlineCount} <span className="text-xs font-sans text-gray-400 font-normal">jogadores</span>
              </div>
            </div>

            <button
              onClick={() => refreshAll()}
              disabled={isRefreshing}
              className="bg-[#241e17] hover:bg-[#332a20] text-[#E0C068] border border-[#8C6B1C]/60 hover:border-[#C9A227] px-3.5 py-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-md disabled:opacity-50 select-none cursor-pointer"
              title="Atualizar lista do banco agora"
            >
              <RefreshCw className={`w-4 h-4 text-[#C9A227] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar jogador por nome..."
            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#C9A227]"
          />
        </div>

        {/* Vocation Pills */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-gray-500 text-[11px] mr-1 hidden md:inline">Filtrar:</span>
          {[
            { id: 'all', label: 'Todos' },
            { id: '1', label: 'Sorcerers' },
            { id: '2', label: 'Druids' },
            { id: '3', label: 'Paladins' },
            { id: '4', label: 'Knights' },
          ].map((voc) => (
            <button
              key={voc.id}
              onClick={() => setFilterVoc(voc.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer text-xs ${
                filterVoc === voc.id
                  ? 'bg-[#C9A227]/20 border border-[#C9A227] text-[#E0C068] font-bold shadow-[0_0_10px_rgba(201,162,39,0.2)]'
                  : 'bg-[#181818] border border-[#2a2a2a] text-gray-400 hover:text-gray-200 hover:bg-[#202020]'
              }`}
            >
              {voc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Online Players Table */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#181715] border-b border-[#2d2922] text-[#C9A227] uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Personagem</th>
                <th className="py-3 px-4">Vocação</th>
                <th className="py-3 px-4 text-center">Nível</th>
                <th className="py-3 px-4 text-center">Cargo / Grupo</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1d1a]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Users className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-gray-400">Nenhum jogador encontrado no momento.</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Conecte-se com seu OTClientV8 no IP <strong className="text-[#C9A227]">137.131.196.66:7171</strong> para aparecer aqui!
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((player, idx) => (
                  <tr key={player.id || idx} className="hover:bg-[#171614] transition">
                    <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-100 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#201d18] border border-[#8C6B1C]/40 flex items-center justify-center text-xs font-bold text-[#E0C068]">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="hover:text-[#C9A227] transition cursor-pointer">{player.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      <span className="inline-flex items-center gap-1 bg-[#1a1917] px-2 py-0.5 rounded border border-[#302c24] text-[11px]">
                        {getVocationName(player.vocation)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[#E0C068] font-mono">
                      {player.level}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getGroupBadge(player.group_id)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1.5 text-green-400 font-medium text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Online
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-[#0b0a09] border-t border-[#262626] px-4 py-2.5 flex items-center justify-between text-[11px] text-gray-500">
          <span>Mostrando {filtered.length} de {onlinePlayers.length} conectados</span>
          <span className="font-mono text-[#C9A227]/80">Servidor 137.131.196.66 • Porta 7172 Game</span>
        </div>
      </div>
    </div>
  );
};
