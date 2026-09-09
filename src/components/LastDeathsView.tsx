import React, { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';
import { Skull, Trophy, RefreshCw, Calendar, User, Shield } from 'lucide-react';

interface DeathRecord {
  player_name: string;
  level: number;
  time: number;
  killer: string;
  unjustified?: boolean;
}

export const LastDeathsView: React.FC = () => {
  const { isDbConnected, isStaff } = useServer();
  const [deaths, setDeaths] = useState<DeathRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeaths = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/server/deaths');
      const data = await res.json();
      if (data.success) {
        setDeaths(data.deaths || []);
      } else {
        setError(data.message || 'Erro ao buscar mortes do servidor.');
      }
    } catch (err: any) {
      setError('Erro de conexão ao buscar mortes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeaths();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1b170e] via-[#241f13] to-[#17130c] border border-[#C9A227]/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C9A227]/20 to-black border border-[#C9A227]/50 flex items-center justify-center shadow-inner">
            <Skull className="w-7 h-7 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#E0C068]">Últimas Mortes (Last Deaths)</h1>
            <p className="text-xs font-mono text-gray-400">Histórico de combates e baixas recentes no servidor Marleyot 7.72</p>
          </div>
        </div>
        {isStaff && (
          <button
            onClick={fetchDeaths}
            disabled={loading}
            className="px-4 py-2.5 bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold font-mono rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Lista
          </button>
        )}
      </div>

      {/* Main Content Box */}
      <div className="bg-[#12100d] border border-[#332916] rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-[#1b170e] px-6 py-4 border-b border-[#332916] flex items-center justify-between">
          <span className="font-serif text-sm font-bold text-[#E0C068] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#C9A227]" />
            Registro de Batalhas Recentes
          </span>
          <span className="text-xs font-mono text-gray-400">
            {deaths.length} {deaths.length === 1 ? 'morte registrada' : 'mortes registradas'}
          </span>
        </div>

        <div className="p-6">
          {!isDbConnected ? (
            <div className="py-16 text-center space-y-3 bg-[#17140e] rounded-xl border border-[#332916]">
              <Skull className="w-12 h-12 text-amber-500 mx-auto opacity-60" />
              <p className="text-sm font-mono text-amber-400 font-bold">Banco de dados MySQL desconectado</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Conecte o portal à sua VPS para visualizar o histórico em tempo real de todas as mortes dos jogadores.
              </p>
            </div>
          ) : loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-[#C9A227] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-mono text-gray-300">Carregando histórico de mortes do servidor...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center space-y-3 bg-[#17140e] rounded-xl border border-[#332916]">
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          ) : deaths.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-[#17140e] rounded-xl border border-[#332916]">
              <Skull className="w-12 h-12 text-gray-600 mx-auto" />
              <p className="text-sm font-mono text-gray-300">Nenhuma morte registrada recentemente.</p>
              <p className="text-xs text-gray-500">O servidor está em paz... por enquanto.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deaths.map((d, idx) => {
                const dateStr = d.time ? new Date(d.time * 1000).toUTCString() : 'Data recente';
                return (
                  <div 
                    key={idx} 
                    className="bg-[#17140e] border border-[#332916] hover:border-[#C9A227]/50 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 font-bold">
                        💀
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span className="text-[#E0C068] hover:underline cursor-pointer">{d.player_name}</span>
                          <span className="text-[11px] font-mono bg-black/40 px-2 py-0.5 rounded border border-[#332916] text-emerald-400">
                            Level {d.level}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-gray-400 mt-0.5 flex items-center gap-1.5">
                          <span>Morto por <strong className="text-amber-400">{d.killer || 'Monstro Desconhecido'}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-gray-400 flex items-center gap-2 self-end md:self-center">
                      <Calendar className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>{dateStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
