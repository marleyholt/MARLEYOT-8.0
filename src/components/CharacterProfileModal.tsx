import React, { useState, useEffect } from 'react';
import { VOCATIONS } from '../data/tibia80Data';
import { 
  Shield, 
  Sword, 
  Target, 
  Zap, 
  Fish, 
  Axe, 
  Sparkles, 
  X, 
  Trophy, 
  Home, 
  Calendar, 
  User, 
  Clock,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

interface CharacterProfileModalProps {
  playerName: string;
  onClose: () => void;
}

export const CharacterProfileModal: React.FC<CharacterProfileModalProps> = ({ playerName, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any | null>(null);

  useEffect(() => {
    async function fetchCharacterDetails() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/characters/profile?name=${encodeURIComponent(playerName)}`);
        const data = await res.json();
        if (data.success) {
          setProfileData(data.character);
        } else {
          setError(data.message || 'Personagem não encontrado no banco de dados.');
        }
      } catch (err: any) {
        setError('Erro ao buscar dados do personagem no servidor: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    if (playerName) {
      fetchCharacterDetails();
    }
  }, [playerName]);

  const player = profileData?.player || {};
  const skills = profileData?.skills || {};
  const equipment = profileData?.equipment || [];
  const deaths = profileData?.deaths || [];
  const house = profileData?.house || null;
  const account = profileData?.account || {};

  const vocationInfo = VOCATIONS[player.vocation as keyof typeof VOCATIONS] || { name: 'Sem Vocação' };
  const sexName = player.sex === 0 ? 'female' : 'male';
  
  // Outfit image URL generator using standard OpenTibia renderers or TibiaWiki sprites
  // Using looktype, lookhead, lookbody, looklegs, lookfeet
  const lookType = player.looktype || (player.sex === 0 ? 136 : 128);
  const lookHead = player.lookhead || 0;
  const lookBody = player.lookbody || 0;
  const lookLegs = player.looklegs || 0;
  const lookFeet = player.lookfeet || 0;
  
  const outfitImgUrl = `https://outfit-images.ots.me/772/animoutfit.php?id=${lookType}&head=${lookHead}&body=${lookBody}&legs=${lookLegs}&feet=${lookFeet}&addons=3&direction=3`;

  // Helper to render item image from item id
  const renderItemSlot = (slotName: string, title: string, defaultIcon: string) => {
    const item = equipment.find((eq: any) => eq.slot === slotName || eq.slot_id === slotName);
    
    return (
      <div 
        className="w-12 h-12 bg-[#14120e] border border-[#332916] hover:border-[#C9A227] rounded-lg flex flex-col items-center justify-center relative group transition cursor-pointer shadow-inner"
        title={item ? `${item.name} (ID: ${item.item_id})` : title}
      >
        {item ? (
          <>
            <img 
              src={`https://images.tibia.com/items/${item.item_id}.gif`} 
              alt={item.name}
              className="w-8 h-8 object-contain drop-shadow"
              onError={(e) => {
                // Fallback to OTserv item sprite if tibia.com fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {item.count > 1 && (
              <span className="absolute bottom-0.5 right-1 text-[9px] font-mono text-amber-300 font-bold bg-black/70 px-1 rounded">
                {item.count}
              </span>
            )}
            <div className="absolute bottom-full mb-1 hidden group-hover:block z-20 w-40 p-2 bg-[#1a1610] border border-[#C9A227] text-[10px] text-amber-200 rounded shadow-xl text-center font-mono pointer-events-none">
              <span className="font-bold text-white">{item.name}</span>
              <div className="text-gray-400">ID: {item.item_id}</div>
            </div>
          </>
        ) : (
          <span className="text-sm opacity-30">{defaultIcon}</span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#12100d] border-2 border-[#C9A227]/60 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-[0_0_40px_rgba(201,162,39,0.3)] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1b170e] via-[#241f13] to-[#17130c] px-6 py-4 border-b border-[#C9A227]/40 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-[#C9A227]" />
            <h2 className="text-lg font-bold font-serif text-[#E0C068] tracking-wide">
              Dossiê do Personagem: <span className="text-white">{playerName}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-black/40 hover:bg-black/80 border border-[#333] text-gray-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-[#C9A227] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-mono text-gray-300">Buscando dados no banco MySQL do servidor...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center space-y-3">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
              <p className="text-red-400 font-mono text-sm">{error}</p>
              <p className="text-xs text-gray-400">Verifique se o banco MySQL está conectado e se o nome está correto.</p>
            </div>
          ) : (
            <>
              {/* 1. Character Information Box */}
              <div className="bg-[#17140e] border border-[#332916] rounded-xl overflow-hidden shadow-md">
                <div className="bg-[#241d11] px-4 py-2.5 border-b border-[#332916] font-serif text-sm font-bold text-[#E0C068] flex items-center justify-between">
                  <span>Character Information</span>
                  <span className="font-mono text-xs text-[#C9A227]">ID #{player.id}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_160px] gap-4 p-4 items-center">
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center py-1 border-b border-white/5">
                      <span className="w-32 text-gray-400">Name:</span>
                      <span className="font-bold text-white text-sm flex items-center gap-1.5">
                        🇧🇷 {player.name}
                        {player.group_id && player.group_id > 1 && (
                          <span className="text-[10px] bg-[#C9A227] text-black px-1.5 py-0.5 rounded font-bold">STAFF</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center py-1 border-b border-white/5">
                      <span className="w-32 text-gray-400">Sex:</span>
                      <span className="text-gray-200">{sexName}</span>
                    </div>
                    <div className="flex items-center py-1 border-b border-white/5">
                      <span className="w-32 text-gray-400">Profession:</span>
                      <span className="text-amber-400 font-bold">{vocationInfo.name}</span>
                    </div>
                    <div className="flex items-center py-1 border-b border-white/5">
                      <span className="w-32 text-gray-400">Level:</span>
                      <span className="text-emerald-400 font-bold text-sm">{player.level}</span>
                    </div>
                    <div className="flex items-center py-1 border-b border-white/5">
                      <span className="w-32 text-gray-400">Residence:</span>
                      <span className="text-gray-200">Marleyot City</span>
                    </div>
                    <div className="flex items-center py-1 border-b border-white/5">
                      <span className="w-32 text-gray-400">House:</span>
                      <span className="text-gray-300">
                        {house ? `${house.name} (${house.town})` : 'Nenhuma casa alugada'}
                      </span>
                    </div>
                    <div className="flex items-center py-1 border-b border-white/5">
                      <span className="w-32 text-gray-400">Last Login:</span>
                      <span className="text-gray-300">
                        {player.lastlogin && player.lastlogin > 0 
                          ? new Date(player.lastlogin * 1000).toUTCString() 
                          : 'Nunca logado ou offline'}
                      </span>
                    </div>
                    <div className="flex items-center py-1 border-b border-white/5">
                      <span className="w-32 text-gray-400">Account Status:</span>
                      <span className="text-[#C9A227] font-semibold">
                        {account.premdays && account.premdays > 0 ? 'Premium Account' : 'Free Account'}
                      </span>
                    </div>
                  </div>

                  {/* Character Outfit Avatar */}
                  <div className="flex flex-col items-center justify-center bg-black/50 border border-[#332916] rounded-xl p-3">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#2a2315] to-[#12100a] border-2 border-[#C9A227]/40 flex items-center justify-center shadow-inner relative overflow-hidden group">
                      <img 
                        src={outfitImgUrl} 
                        alt={player.name} 
                        className="w-16 h-16 object-contain transform scale-125 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]"
                        onError={(e) => {
                          // Fallback emoji if outfit sprite fails
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 mt-2">Outfit 7.72 Real</span>
                  </div>
                </div>
              </div>

              {/* 2. Skills & Equipment Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Skills Box */}
                <div className="bg-[#17140e] border border-[#332916] rounded-xl overflow-hidden shadow-md">
                  <div className="bg-[#241d11] px-4 py-2.5 border-b border-[#332916] font-serif text-sm font-bold text-[#E0C068]">
                    Skills (Database Real)
                  </div>
                  <div className="p-3 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between items-center py-1 px-2 rounded bg-black/20 border border-white/5">
                      <span className="text-gray-400 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-sky-400" /> Magic Level</span>
                      <span className="font-bold text-sky-400">{skills.maglevel || player.maglevel || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded bg-black/20 border border-white/5">
                      <span className="text-gray-400 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> Fist Fighting (Fast Attack)</span>
                      <span className="font-bold text-amber-300">{skills.fist || 10}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded bg-black/20 border border-white/5">
                      <span className="text-gray-400 flex items-center gap-1.5"><Sword className="w-3.5 h-3.5 text-amber-400" /> Sword Fighting</span>
                      <span className="font-bold text-amber-300">{skills.sword || 10}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded bg-black/20 border border-white/5">
                      <span className="text-gray-400 flex items-center gap-1.5"><Axe className="w-3.5 h-3.5 text-amber-400" /> Axe Fighting</span>
                      <span className="font-bold text-amber-300">{skills.axe || 10}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded bg-black/20 border border-white/5">
                      <span className="text-gray-400 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> Club Fighting</span>
                      <span className="font-bold text-amber-300">{skills.club || 10}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded bg-black/20 border border-white/5">
                      <span className="text-gray-400 flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-amber-400" /> Distance Fighting</span>
                      <span className="font-bold text-amber-300">{skills.dist || 10}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded bg-black/20 border border-white/5">
                      <span className="text-gray-400 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-amber-400" /> Shielding</span>
                      <span className="font-bold text-amber-300">{skills.shielding || 10}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 px-2 rounded bg-black/20 border border-white/5">
                      <span className="text-gray-400 flex items-center gap-1.5"><Fish className="w-3.5 h-3.5 text-cyan-400" /> Fishing (+EXP Bonus)</span>
                      <span className="font-bold text-cyan-300">{skills.fishing || 10}</span>
                    </div>
                  </div>
                </div>

                {/* Equipment Box (Tibia 7.72 Layout) */}
                <div className="bg-[#17140e] border border-[#332916] rounded-xl overflow-hidden shadow-md flex flex-col">
                  <div className="bg-[#241d11] px-4 py-2.5 border-b border-[#332916] font-serif text-sm font-bold text-[#E0C068]">
                    Equipment (Player Inventory)
                  </div>
                  <div className="p-4 flex-1 flex flex-col items-center justify-center bg-black/30">
                    <div className="grid grid-cols-3 gap-2 w-48 bg-[#111] p-3 rounded-xl border border-[#332916]">
                      {/* Row 1: Necklace (1), Helmet (2), Backpack (3) */}
                      {renderItemSlot('necklace', 'Necklace', '📿')}
                      {renderItemSlot('helmet', 'Helmet', '👑')}
                      {renderItemSlot('backpack', 'Backpack', '🎒')}
                      
                      {/* Row 2: Left Hand/Weapon (5), Armor (4), Right Hand/Shield (6) */}
                      {renderItemSlot('weapon', 'Weapon / Left Hand', '🗡️')}
                      {renderItemSlot('armor', 'Armor', '🛡️')}
                      {renderItemSlot('shield', 'Shield / Right Hand', '📖')}

                      {/* Row 3: Ring (9), Legs (7), Ammo (10) */}
                      {renderItemSlot('ring', 'Ring', '💍')}
                      {renderItemSlot('legs', 'Legs', '👖')}
                      {renderItemSlot('ammo', 'Ammunition', '🪙')}

                      {/* Row 4: Boots (8) */}
                      <div className="col-span-3 flex justify-center mt-1">
                        {renderItemSlot('boots', 'Boots', '👢')}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. Character Deaths */}
              <div className="bg-[#17140e] border border-[#332916] rounded-xl overflow-hidden shadow-md">
                <div className="bg-[#241d11] px-4 py-2.5 border-b border-[#332916] font-serif text-sm font-bold text-[#E0C068] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C9A227]" />
                  Character Deaths (Database History)
                </div>
                <div className="p-4 text-xs font-mono text-gray-300 space-y-2">
                  {deaths.length > 0 ? (
                    deaths.map((death: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded bg-black/30 border border-white/5 flex items-center justify-between">
                        <span>
                          {death.time ? new Date(death.time * 1000).toUTCString() : 'Data recente'}: 
                          Killed at level {death.level || player.level} by <strong className="text-amber-400">{death.killer || 'Monster'}</strong>
                        </span>
                        <span className="text-red-400 font-bold">💀 Morto</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded bg-black/30 border border-white/5 flex items-center justify-between">
                      <span className="text-gray-300">Nenhum registro de morte recente encontrado para {player.name}. Guerreiro invicto!</span>
                      <span className="text-emerald-400 font-bold">🟢 Vivo</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#17140e] px-6 py-3 border-t border-[#332916] flex justify-between items-center">
          <span className="text-[11px] font-mono text-gray-400">MARLEYOT Database Live Sync</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold font-mono rounded-lg text-xs shadow-md transition cursor-pointer"
          >
            Fechar Dossiê
          </button>
        </div>

      </div>
    </div>
  );
};
