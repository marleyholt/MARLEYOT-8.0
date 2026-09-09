import React, { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';
import { VOCATIONS } from '../data/tibia80Data';
import { Trophy, Crown, RefreshCw, Sparkles, Sword, Shield, Target, Zap, Fish, Axe } from 'lucide-react';

export const HighscoresView: React.FC = () => {
  const { highscoresList, fetchHighscores, isRefreshing, isDbConnected, setIsDbModalOpen } = useServer();
  const [category, setCategory] = useState<string>('level');
  const [vocation, setVocation] = useState<string>('all');

  useEffect(() => {
    fetchHighscores(category, vocation);
  }, [category, vocation, fetchHighscores]);

  const categories = [
    { id: 'level', label: 'Nível / Experiência', icon: Trophy },
    { id: 'maglevel', label: 'Magic Level', icon: Zap },
    { id: 'sword', label: 'Sword Fighting', icon: Sword },
    { id: 'axe', label: 'Axe Fighting', icon: Axe },
    { id: 'club', label: 'Club Fighting', icon: Sparkles },
    { id: 'dist', label: 'Distance', icon: Target },
    { id: 'shield', label: 'Shielding', icon: Shield },
    { id: 'fishing', label: 'Fishing', icon: Fish },
  ];

  const getVocationName = (vocId: number) => {
    const v = VOCATIONS[vocId as keyof typeof VOCATIONS];
    return v ? v.name : 'Sem Vocação';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-6 h-6 rounded-full bg-gradient-to-b from-[#FFE885] to-[#C9A227] text-black font-extrabold flex items-center justify-center text-xs shadow-[0_0_10px_rgba(201,162,39,0.5)]">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-6 h-6 rounded-full bg-gradient-to-b from-gray-200 to-gray-400 text-black font-extrabold flex items-center justify-center text-xs shadow-md">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-6 h-6 rounded-full bg-gradient-to-b from-[#E29C68] to-[#9C5824] text-black font-extrabold flex items-center justify-center text-xs shadow-md">
          3
        </span>
      );
    }
    return (
      <span className="w-6 h-6 rounded flex items-center justify-center text-xs text-gray-500 font-mono font-semibold">
        {rank}
      </span>
    );
  };

  const getScoreValue = (player: any) => {
    if (category === 'level') {
      return (
        <div className="text-right">
          <div className="font-bold text-[#E0C068] font-mono text-sm">{player.level}</div>
          <div className="text-[10px] text-gray-500 font-mono">
            {Number(player.experience || 0).toLocaleString()} exp
          </div>
        </div>
      );
    }
    if (category === 'maglevel') {
      return (
        <div className="text-right font-bold text-sky-400 font-mono text-sm">
          ML {player.maglevel || 0}
        </div>
      );
    }
    const skillKey = `skill_${category}` as keyof typeof player;
    const val = player[skillKey] ?? 10;
    return (
      <div className="text-right font-bold text-amber-300 font-mono text-sm">
        {val}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Highscores Hero */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#17140f] via-[#1d1913] to-[#14120e] border-2 border-[#8C6B1C]/50 p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#E0C068] text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full">
                <Crown className="w-3.5 h-3.5 text-[#C9A227]" />
                Hall da Fama Oficial
              </span>
              <button
                onClick={() => setIsDbModalOpen(true)}
                className="text-xs text-[#C9A227] hover:underline font-mono cursor-pointer"
              >
                {isDbConnected ? 'Leitura Direta: yurots_db' : 'MySQL Desconectado - Clique para Conectar'}
              </button>
            </div>
            <h2 className="text-2xl font-bold font-serif text-white tracking-wide flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-[#C9A227]" />
              Rankings & Highscores
            </h2>
            <p className="text-xs text-gray-400 max-w-xl">
              Os guerreiros mais lendários de MARLEYOT. Disputas de Level, Magic Level e habilidades de combate.
            </p>
          </div>

          <button
            onClick={() => fetchHighscores(category, vocation)}
            disabled={isRefreshing}
            className="bg-[#241e17] hover:bg-[#332a20] text-[#E0C068] border border-[#8C6B1C]/60 hover:border-[#C9A227] px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-md disabled:opacity-50 select-none cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#C9A227] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar Ranking</span>
          </button>
        </div>
      </div>

      {/* Category Pills Selector */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-3 space-y-3 shadow-lg">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? 'bg-[#C9A227] text-black font-bold shadow-[0_0_12px_rgba(201,162,39,0.35)]'
                    : 'bg-[#181818] border border-[#2d2d2d] text-gray-300 hover:text-white hover:bg-[#222]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-black' : 'text-[#C9A227]'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Vocation Filter Bar */}
        <div className="pt-2 border-t border-[#222] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 text-[11px]">Filtrar Vocação:</span>
            {[
              { id: 'all', label: 'Todas' },
              { id: '1', label: 'Sorcerers' },
              { id: '2', label: 'Druids' },
              { id: '3', label: 'Paladins' },
              { id: '4', label: 'Knights' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setVocation(v.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  vocation === v.id
                    ? 'bg-[#2b241a] text-[#E0C068] border border-[#8C6B1C]/80 font-semibold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-gray-500 font-mono">
            Exibindo Top 50 • Atualizado em tempo real
          </div>
        </div>
      </div>

      {/* Highscores Table */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#181715] border-b border-[#2d2922] text-[#C9A227] uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Personagem</th>
                <th className="py-3 px-4">Vocação</th>
                <th className="py-3 px-4 text-center">Level</th>
                <th className="py-3 px-4 text-right">
                  {category === 'level' ? 'Pontos de Experiência' : category === 'maglevel' ? 'Magic Level' : 'Habilidade'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1d1a]">
              {highscoresList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <Trophy className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-gray-400">Nenhum jogador registrado no ranking ainda.</p>
                    <p className="text-xs text-gray-600 mt-1">Crie sua conta e personagem para conquistar o Top 1!</p>
                  </td>
                </tr>
              ) : (
                highscoresList.map((player, idx) => (
                  <tr key={player.id || idx} className="hover:bg-[#171614] transition">
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {getRankBadge(idx + 1)}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-100 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#201d18] border border-[#8C6B1C]/40 flex items-center justify-center text-xs font-bold text-[#E0C068]">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hover:text-[#C9A227] transition">{player.name}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      <span className="inline-flex items-center gap-1 bg-[#1a1917] px-2 py-0.5 rounded border border-[#302c24] text-[11px]">
                        {getVocationName(player.vocation)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-gray-300">
                      {player.level}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {getScoreValue(player)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
