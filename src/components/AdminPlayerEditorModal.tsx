import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Sparkles, 
  Heart, 
  Flame, 
  Sword, 
  Crosshair, 
  Fish, 
  Crown, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Zap,
  Clock
} from 'lucide-react';

interface PlayerData {
  id: number;
  name: string;
  group_id: number;
  account_id: number;
  level: number;
  vocation: number;
  experience?: number;
  health?: number;
  healthmax?: number;
  mana?: number;
  manamax?: number;
  maglevel?: number;
  cap?: number;
  skill_fist?: number;
  skill_club?: number;
  skill_sword?: number;
  skill_axe?: number;
  skill_dist?: number;
  skill_shielding?: number;
  skill_fishing?: number;
  account_name?: string;
  account_premdays?: number;
}

interface Props {
  player: PlayerData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => Promise<{ success: boolean; message: string }>;
}

export const AdminPlayerEditorModal: React.FC<Props> = ({ player, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: player.id,
    name: player.name || '',
    level: player.level || 8,
    experience: player.experience || 4200,
    maglevel: player.maglevel || 0,
    vocation: player.vocation || 1,
    group_id: player.group_id || 1,
    health: player.health || 185,
    healthmax: player.healthmax || 185,
    mana: player.mana || 35,
    manamax: player.manamax || 35,
    cap: player.cap || 450,
    skill_fist: player.skill_fist || 10,
    skill_club: player.skill_club || 10,
    skill_sword: player.skill_sword || 10,
    skill_axe: player.skill_axe || 10,
    skill_dist: player.skill_dist || 10,
    skill_shielding: player.skill_shielding || 10,
    skill_fishing: player.skill_fishing || 10,
    account_id: player.account_id,
    account_name: player.account_name || '',
    account_premdays: player.account_premdays ?? 30,
    teleportToTemple: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; text: string } | null>(null);

  useEffect(() => {
    setFormData({
      id: player.id,
      name: player.name || '',
      level: player.level || 8,
      experience: player.experience || 4200,
      maglevel: player.maglevel || 0,
      vocation: player.vocation || 1,
      group_id: player.group_id || 1,
      health: player.health || 185,
      healthmax: player.healthmax || 185,
      mana: player.mana || 35,
      manamax: player.manamax || 35,
      cap: player.cap || 450,
      skill_fist: player.skill_fist || 10,
      skill_club: player.skill_club || 10,
      skill_sword: player.skill_sword || 10,
      skill_axe: player.skill_axe || 10,
      skill_dist: player.skill_dist || 10,
      skill_shielding: player.skill_shielding || 10,
      skill_fishing: player.skill_fishing || 10,
      account_id: player.account_id,
      account_name: player.account_name || '',
      account_premdays: player.account_premdays ?? 30,
      teleportToTemple: false,
    });
    setStatusMsg(null);
  }, [player]);

  if (!isOpen) return null;

  // Auto calculate EXP when Level changes
  const handleLevelChange = (lvl: number) => {
    const validLevel = Math.max(1, lvl);
    const exp = Math.floor((50 / 3) * (Math.pow(validLevel, 3) - 6 * Math.pow(validLevel, 2) + 17 * validLevel - 12));
    setFormData((prev) => ({
      ...prev,
      level: validLevel,
      experience: Math.max(0, exp),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    const res = await onSave(formData);
    setIsSaving(false);
    setStatusMsg({ success: res.success, text: res.message });
    if (res.success) {
      setTimeout(() => {
        onClose();
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111111] border border-[#222222] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-white space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#C9A227]/10 border border-[#C9A227]/30 rounded-xl text-[#C9A227]">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#C9A227]">
                Painel Administrativo GM
              </div>
              <h3 className="text-xl font-bold font-serif">
                Editar Personagem: <span className="text-[#C9A227]">{player.name}</span>
              </h3>
              <div className="text-xs text-gray-400">
                ID #{player.id} | Conta #{player.account_id} ({player.account_name || 'Sem nome'})
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#222222] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              statusMsg.success
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}
          >
            {statusMsg.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Identidade & Conta */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl p-4 space-y-4">
            <div className="text-xs font-bold text-[#C9A227] uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Identidade & Conta
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Nome do Personagem</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#161616] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C9A227]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Grupo / Cargo (Acesso GM)</label>
                <select
                  value={formData.group_id}
                  onChange={(e) => setFormData({ ...formData, group_id: Number(e.target.value) })}
                  className="w-full bg-[#161616] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C9A227]"
                >
                  <option value="1">1 - Player Normal</option>
                  <option value="2">2 - Tutor</option>
                  <option value="3">3 - Senior Tutor</option>
                  <option value="4">4 - Gamemaster (GM)</option>
                  <option value="5">5 - Community Manager (CM)</option>
                  <option value="6">6 - GOD / Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C9A227]" /> Dias de Premium (Conta)
                </label>
                <input
                  type="number"
                  min="0"
                  max="99999"
                  value={formData.account_premdays}
                  onChange={(e) => setFormData({ ...formData, account_premdays: Number(e.target.value) })}
                  className="w-full bg-[#161616] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C9A227]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Vocação, Level & Status */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl p-4 space-y-4">
            <div className="text-xs font-bold text-[#C9A227] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Vocação, Level & Atributos
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-1">Vocação & Promotion</label>
                <select
                  value={formData.vocation}
                  onChange={(e) => setFormData({ ...formData, vocation: Number(e.target.value) })}
                  className="w-full bg-[#161616] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C9A227]"
                >
                  <option value="0">0 - Sem Vocação (Rookgaard)</option>
                  <option value="1">1 - Sorcerer</option>
                  <option value="5">5 - Master Sorcerer (Promovido)</option>
                  <option value="2">2 - Druid</option>
                  <option value="6">6 - Elder Druid (Promovido)</option>
                  <option value="3">3 - Paladin</option>
                  <option value="7">7 - Royal Paladin (Promovido)</option>
                  <option value="4">4 - Knight</option>
                  <option value="8">8 - Elite Knight (Promovido)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Level</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.level}
                  onChange={(e) => handleLevelChange(Number(e.target.value))}
                  className="w-full bg-[#161616] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Magic Level</label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={formData.maglevel}
                  onChange={(e) => setFormData({ ...formData, maglevel: Number(e.target.value) })}
                  className="w-full bg-[#161616] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C9A227]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400" /> Vida Atual
                </label>
                <input
                  type="number"
                  value={formData.health}
                  onChange={(e) => setFormData({ ...formData, health: Number(e.target.value) })}
                  className="w-full bg-[#161616] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-500" /> Vida Máxima
                </label>
                <input
                  type="number"
                  value={formData.healthmax}
                  onChange={(e) => setFormData({ ...formData, healthmax: Number(e.target.value) })}
                  className="w-full bg-[#161616] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-blue-400" /> Mana Atual
                </label>
                <input
                  type="number"
                  value={formData.mana}
                  onChange={(e) => setFormData({ ...formData, mana: Number(e.target.value) })}
                  className="w-full bg-[#161616] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-blue-500" /> Mana Máxima
                </label>
                <input
                  type="number"
                  value={formData.manamax}
                  onChange={(e) => setFormData({ ...formData, manamax: Number(e.target.value) })}
                  className="w-full bg-[#161616] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">Capacidade (Cap)</label>
                <input
                  type="number"
                  value={formData.cap}
                  onChange={(e) => setFormData({ ...formData, cap: Number(e.target.value) })}
                  className="w-full bg-[#161616] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Skills (Fist, Club, Sword, Axe, Dist, Shielding, Fish) */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl p-4 space-y-4">
            <div className="text-xs font-bold text-[#C9A227] uppercase tracking-wider flex items-center gap-2">
              <Sword className="w-3.5 h-3.5" /> Skills de Combate (Fast Attack & Defesa)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              <div className="p-2.5 bg-[#161616] rounded-lg border border-[#333]">
                <label className="block text-[11px] font-bold text-[#C9A227] mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#C9A227]" /> Fist
                </label>
                <input
                  type="number"
                  min="10"
                  max="350"
                  value={formData.skill_fist}
                  onChange={(e) => setFormData({ ...formData, skill_fist: Number(e.target.value) })}
                  className="w-full bg-[#111] border border-[#444] rounded px-2 py-1 text-xs text-center font-bold text-white focus:border-[#C9A227]"
                />
                <span className="text-[9px] text-gray-400 block mt-1 text-center">Fast Attack</span>
              </div>

              <div className="p-2.5 bg-[#161616] rounded-lg border border-[#333]">
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Club</label>
                <input
                  type="number"
                  min="10"
                  max="350"
                  value={formData.skill_club}
                  onChange={(e) => setFormData({ ...formData, skill_club: Number(e.target.value) })}
                  className="w-full bg-[#111] border border-[#444] rounded px-2 py-1 text-xs text-center font-bold text-white"
                />
              </div>

              <div className="p-2.5 bg-[#161616] rounded-lg border border-[#333]">
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Sword</label>
                <input
                  type="number"
                  min="10"
                  max="350"
                  value={formData.skill_sword}
                  onChange={(e) => setFormData({ ...formData, skill_sword: Number(e.target.value) })}
                  className="w-full bg-[#111] border border-[#444] rounded px-2 py-1 text-xs text-center font-bold text-white"
                />
              </div>

              <div className="p-2.5 bg-[#161616] rounded-lg border border-[#333]">
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Axe</label>
                <input
                  type="number"
                  min="10"
                  max="350"
                  value={formData.skill_axe}
                  onChange={(e) => setFormData({ ...formData, skill_axe: Number(e.target.value) })}
                  className="w-full bg-[#111] border border-[#444] rounded px-2 py-1 text-xs text-center font-bold text-white"
                />
              </div>

              <div className="p-2.5 bg-[#161616] rounded-lg border border-[#333]">
                <label className="block text-[11px] font-bold text-gray-300 mb-1 flex items-center gap-1">
                  <Crosshair className="w-3 h-3 text-emerald-400" /> Distance
                </label>
                <input
                  type="number"
                  min="10"
                  max="350"
                  value={formData.skill_dist}
                  onChange={(e) => setFormData({ ...formData, skill_dist: Number(e.target.value) })}
                  className="w-full bg-[#111] border border-[#444] rounded px-2 py-1 text-xs text-center font-bold text-white"
                />
              </div>

              <div className="p-2.5 bg-[#161616] rounded-lg border border-[#333]">
                <label className="block text-[11px] font-bold text-gray-300 mb-1 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-sky-400" /> Shielding
                </label>
                <input
                  type="number"
                  min="10"
                  max="350"
                  value={formData.skill_shielding}
                  onChange={(e) => setFormData({ ...formData, skill_shielding: Number(e.target.value) })}
                  className="w-full bg-[#111] border border-[#444] rounded px-2 py-1 text-xs text-center font-bold text-white"
                />
              </div>

              <div className="p-2.5 bg-[#161616] rounded-lg border border-[#333]">
                <label className="block text-[11px] font-bold text-gray-300 mb-1 flex items-center gap-1">
                  <Fish className="w-3 h-3 text-cyan-400" /> Fishing
                </label>
                <input
                  type="number"
                  min="10"
                  max="350"
                  value={formData.skill_fishing}
                  onChange={(e) => setFormData({ ...formData, skill_fishing: Number(e.target.value) })}
                  className="w-full bg-[#111] border border-[#444] rounded px-2 py-1 text-xs text-center font-bold text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Teletransporte e Recuperação */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#C9A227]" />
              <div>
                <div className="text-sm font-semibold text-white">Resetar Posição no Templo (Unstuck)</div>
                <div className="text-xs text-gray-400">
                  Teleporta o personagem para o templo principal de Yurots (5999, 6045, 7) caso ele esteja travado.
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.teleportToTemple}
                onChange={(e) => setFormData({ ...formData, teleportToTemple: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#222] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A227]"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222222]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white bg-[#1A1A1A] hover:bg-[#222] rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-black bg-[#C9A227] hover:bg-[#D4AF37] rounded-lg transition shadow-lg shadow-[#C9A227]/20 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando no MySQL...' : 'Salvar Alterações no MySQL'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
