import React, { useState } from 'react';
import { useServer } from '../context/ServerContext';
import { VOCATIONS } from '../data/tibia80Data';
import { VocationId } from '../types';
import { AdminPlayerEditorModal } from './AdminPlayerEditorModal';
import { 
  User, 
  KeyRound, 
  ShieldCheck, 
  UserPlus, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Trash2, 
  Plus, 
  MapPin, 
  Shield, 
  Heart, 
  Flame, 
  Crown, 
  ArrowRight,
  ExternalLink,
  Database,
  Edit3,
  Settings
} from 'lucide-react';

export const AccountManagerView: React.FC = () => {
  const { 
    currentAccount, 
    registerAccount, 
    loginAccount, 
    logoutAccount, 
    createCharacter, 
    deleteCharacter,
    changePassword,
    serverConfig,
    isDbConnected,
    dbLastError,
    setIsDbModalOpen,
    isStaff,
    setActiveTab,
    saveAdminPlayer,
  } = useServer();

  // Selected player for GM edit
  const [selectedPlayerForEdit, setSelectedPlayerForEdit] = useState<any | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Auth Forms State
  const [authMode, setAuthMode] = useState<'register' | 'login'>('login');
  const [accName, setAccName] = useState('191196');
  const [accPass, setAccPass] = useState('MARLEY22@@##');
  const [accPassConfirm, setAccPassConfirm] = useState('');
  const [accEmail, setAccEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMsg, setAuthMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Change Password Modal State
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [newPassConfirm, setNewPassConfirm] = useState('');
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [changePassMsg, setChangePassMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Create Character Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [charName, setCharName] = useState('');
  const [charSex, setCharSex] = useState<0 | 1>(1); // 1 = male, 0 = female
  const [charVoc, setCharVoc] = useState<VocationId>(1); // 1 = Sorcerer
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg(null);

    if (accPass !== accPassConfirm) {
      setAuthMsg({ success: false, text: 'As senhas não coincidem. Digite a mesma senha nos dois campos.' });
      return;
    }

    setAuthLoading(true);
    const res = await registerAccount(accName, accPass, accEmail);
    setAuthLoading(false);

    setAuthMsg({ success: res.success, text: res.message });
    if (res.success) {
      setAccPass('');
      setAccPassConfirm('');
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg(null);
    setAuthLoading(true);
    const res = await loginAccount(accName, accPass);
    setAuthLoading(false);

    setAuthMsg({ success: res.success, text: res.message });
    if (res.success) {
      setAccPass('');
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassMsg(null);

    if (newPass !== newPassConfirm) {
      setChangePassMsg({ success: false, text: 'A confirmação de senha não coincide com a nova senha.' });
      return;
    }

    setChangePassLoading(true);
    const res = await changePassword(newPass);
    setChangePassLoading(false);

    setChangePassMsg({ success: res.success, text: res.message });
    if (res.success) {
      setNewPass('');
      setNewPassConfirm('');
      setTimeout(() => {
        setShowChangePassModal(false);
        setChangePassMsg(null);
      }, 2000);
    }
  };

  // Handle Create Character
  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMsg(null);
    setCreateLoading(true);
    const res = await createCharacter(charName, charSex, charVoc);
    setCreateLoading(false);

    setCreateMsg({ success: res.success, text: res.message });
    if (res.success) {
      setCharName('');
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateMsg(null);
      }, 1500);
    }
  };

  const vocationsList = [
    {
      id: 1 as VocationId,
      name: 'Sorcerer',
      role: 'Mestre da Magia Ofensiva',
      desc: 'Especialista em magias de fogo, morte e energia. Utiliza wands e runas de ataque massivo com rápida regeneração de mana.',
      hpGain: 5,
      manaGain: 30,
      capGain: 10,
      icon: '🔥',
    },
    {
      id: 2 as VocationId,
      name: 'Druid',
      role: 'Curandeiro e Mestre da Natureza',
      desc: 'Domina poderes de gelo, terra e cura suprema (Mass Healing). Indispensável em caçadas em grupo e batalhas.',
      hpGain: 5,
      manaGain: 30,
      capGain: 10,
      icon: '🌿',
    },
    {
      id: 3 as VocationId,
      name: 'Paladin',
      role: 'Arqueiro Sagrado',
      desc: 'Atirador de elite com arcos, bestas e lanças. Excelente equilíbrio de dano físico e magias sagradas à distância.',
      hpGain: 10,
      manaGain: 15,
      capGain: 20,
      icon: '🏹',
    },
    {
      id: 4 as VocationId,
      name: 'Knight',
      role: 'Guerreiro de Vanguarda',
      desc: 'Mestre do combate corpo a corpo (Sword, Axe ou Club). Enorme quantidade de pontos de vida e alta capacidade de carga.',
      hpGain: 15,
      manaGain: 5,
      capGain: 25,
      icon: '⚔️',
    },
  ];

  return (
    <div className="space-y-6">
      {/* If DB is not connected, alert user with direct connect button */}
      {!isDbConnected && (
        <div className="max-w-xl mx-auto bg-[#1A1305] border border-amber-500/40 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-300">Conexão com o Banco MySQL Desconectada</div>
              <div className="text-amber-400/80 text-[11px] mt-0.5">
                {dbLastError ? `Erro: ${dbLastError}` : 'O site precisa se conectar ao yurots_db na sua VPS para autenticar contas reais.'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsDbModalOpen(true)}
            className="bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold px-3.5 py-1.5 rounded-lg shrink-0 transition text-xs flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Configurar Conexão</span>
          </button>
        </div>
      )}

      {/* If User is NOT logged in: Show Register / Login Card */}
      {!currentAccount ? (
        <div className="max-w-xl mx-auto">
          {/* Card Container with Classic Tibia Stone / Gold Frame */}
          <div className="bg-[#12110e] border-2 border-[#8C6B1C]/60 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#E0C068] text-xs font-mono px-3 py-1 rounded-full uppercase font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                Crie sua Conta e Jogue Imediatamente
              </div>
              <h2 className="text-2xl font-bold font-serif text-white">
                {authMode === 'register' ? 'Criar Conta de Jogador' : 'Entrar no Painel da Conta'}
              </h2>
              <p className="text-xs text-gray-400">
                Os dados são salvos diretamente no banco de dados MySQL do servidor. Crie sua conta e entre com ela no OTClientV8!
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-[#0a0a09] p-1 rounded-xl border border-[#2a241b]">
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setAuthMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'register'
                    ? 'bg-[#C9A227] text-black shadow-[0_0_12px_rgba(201,162,39,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Criar Nova Conta
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-[#C9A227] text-black shadow-[0_0_12px_rgba(201,162,39,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Já Tenho Conta
              </button>
            </div>

            {/* Feedback Message */}
            {authMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                  authMsg.success
                    ? 'bg-green-500/10 text-green-300 border border-green-500/30'
                    : 'bg-red-500/10 text-red-300 border border-red-500/30'
                }`}
              >
                {authMsg.success ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">{authMsg.text}</div>
                  {authMsg.success && authMode === 'register' && (
                    <div className="text-[11px] text-green-400/80 mt-1">
                      Você pode usar esses mesmos dados no seu OTClientV8 no IP <strong>{serverConfig.serverIp}:7171</strong>!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Register Form */}
            {authMode === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Número ou Nome da Conta <span className="text-[#C9A227]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    placeholder="Ex: 123456 ou meu_login"
                    className="w-full bg-[#0a0a09] border border-[#332a1e] rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    No Tibia clássico, as contas geralmente usam números (ex: 123456) ou letras.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    E-mail (Opcional)
                  </label>
                  <input
                    type="email"
                    value={accEmail}
                    onChange={(e) => setAccEmail(e.target.value)}
                    placeholder="seu_email@provedor.com"
                    className="w-full bg-[#0a0a09] border border-[#332a1e] rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Senha <span className="text-[#C9A227]">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={accPass}
                      onChange={(e) => setAccPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0a0a09] border border-[#332a1e] rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Confirmar Senha <span className="text-[#C9A227]">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={accPassConfirm}
                      onChange={(e) => setAccPassConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0a0a09] border border-[#332a1e] rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold py-3 rounded-lg text-sm transition shadow-[0_0_15px_rgba(201,162,39,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none font-serif"
                >
                  <UserPlus className="w-4 h-4 text-black" />
                  <span>{authLoading ? 'Gravando no Banco de Dados...' : 'Cadastrar Conta no Servidor'}</span>
                </button>
              </form>
            ) : (
              /* Login Form */
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Número ou Nome da Conta
                  </label>
                  <input
                    type="text"
                    required
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    placeholder="Ex: 191196 ou 1234567"
                    className="w-full bg-[#0a0a09] border border-[#332a1e] rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={accPass}
                    onChange={(e) => setAccPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0a0a09] border border-[#332a1e] rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold py-3 rounded-lg text-sm transition shadow-[0_0_15px_rgba(201,162,39,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none font-serif"
                >
                  <KeyRound className="w-4 h-4 text-black" />
                  <span>{authLoading ? 'Verificando Hash SHA1...' : 'Entrar na Conta'}</span>
                </button>
              </form>
            )}

            {/* Hint Box */}
            <div className="bg-[#0c0b09] border border-[#2d261c] rounded-xl p-3 text-[11px] text-gray-400 space-y-1">
              <div className="text-[#C9A227] font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                Segurança Criptográfica SHA1
              </div>
              <p>
                Sua senha é criptografada com algoritmo <strong>SHA1</strong> diretamente na tabela <code>accounts</code> do MySQL, garantindo 100% de compatibilidade com o protocolo TFS / 7.72 Old School.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* If User is LOGGED IN: Show Account Dashboard + Character List */
        <div className="space-y-6">
          {/* Account Status Card */}
          <div className="bg-[#12110e] border-2 border-[#8C6B1C]/60 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#221c13] border-2 border-[#C9A227] flex items-center justify-center text-xl font-serif text-[#E0C068] shadow-md">
                  {currentAccount.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold font-serif text-white">
                      Conta #{currentAccount.name}
                    </h2>
                    {currentAccount.type >= 5 ? (
                      <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                        <Crown className="w-3 h-3 text-red-400" />
                        GOD / Admin
                      </span>
                    ) : currentAccount.type === 4 ? (
                      <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                        <Shield className="w-3 h-3 text-blue-400" />
                        Gamemaster
                      </span>
                    ) : (
                      <span className="bg-[#C9A227]/10 text-[#E0C068] border border-[#C9A227]/30 text-[10px] font-semibold px-2 py-0.5 rounded uppercase">
                        Jogador Normal
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-3 mt-1">
                    <span className="text-green-400 font-medium">
                      ✓ {currentAccount.premdays} dias de Premium VIP
                    </span>
                    <span>•</span>
                    <span>{currentAccount.characters.length} Personagens Criados</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowChangePassModal(true)}
                  className="bg-[#1c1813] hover:bg-[#28221b] text-gray-300 hover:text-white border border-[#3d3224] px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                  title="Alterar Senha da Conta"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Trocar Senha</span>
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-[0_0_15px_rgba(201,162,39,0.3)] cursor-pointer select-none font-serif"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>Criar Novo Personagem</span>
                </button>

                <button
                  onClick={logoutAccount}
                  className="bg-[#1c1813] hover:bg-[#28221b] text-gray-400 hover:text-red-400 border border-[#3d3224] px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                  title="Sair da Conta"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>

          {/* Characters Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-serif text-[#E0C068] flex items-center gap-2">
                <User className="w-5 h-5 text-[#C9A227]" />
                Personagens da sua Conta ({currentAccount.characters.length})
              </h3>
              <span className="text-xs text-gray-400">
                Coordenadas de Spawn no Templo: <strong className="text-[#C9A227]">5999, 6045, 7</strong>
              </span>
            </div>

            {currentAccount.characters.length === 0 ? (
              <div className="bg-[#12110e] border border-[#2d261c] rounded-2xl p-10 text-center space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-full bg-[#1e1912] border border-[#8C6B1C]/50 flex items-center justify-center mx-auto text-[#C9A227]">
                  <UserPlus className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold font-serif text-white">
                    Você ainda não tem nenhum personagem!
                  </h4>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Crie seu primeiro guerreiro agora mesmo escolhendo o nome, sexo e vocação. Ele começará no nível 8 pronto no templo de Yurots!
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold px-6 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 transition shadow-lg cursor-pointer select-none font-serif"
                >
                  <Plus className="w-4 h-4 text-black" />
                  Criar Meu Primeiro Personagem
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentAccount.characters.map((char) => {
                  const voc = VOCATIONS[char.vocation as keyof typeof VOCATIONS];
                  return (
                    <div
                      key={char.id}
                      className="bg-[#12110e] border border-[#332a1e] hover:border-[#8C6B1C] rounded-xl p-5 shadow-xl transition space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-[#201a12] border border-[#8C6B1C]/50 flex items-center justify-center text-lg font-bold text-[#E0C068]">
                            {char.sex === 1 ? '♂' : '♀'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-white font-serif">
                                {char.name}
                              </h4>
                              {char.group_id >= 4 && (
                                <span className="bg-red-500/20 text-red-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-red-500/40 uppercase">
                                  STAFF
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#C9A227] font-medium">
                              {voc?.name || 'Nenhum'} • Level {char.level}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {isStaff && (
                            <button
                              onClick={() => {
                                setSelectedPlayerForEdit({
                                  ...char,
                                  account_id: currentAccount.id,
                                  account_name: currentAccount.name,
                                  account_premdays: currentAccount.premdays,
                                });
                                setIsEditorOpen(true);
                              }}
                              className="text-[#C9A227] hover:text-[#E0C068] p-1.5 rounded hover:bg-[#C9A227]/10 transition cursor-pointer flex items-center gap-1 text-[11px] font-bold border border-[#C9A227]/30"
                              title="Editar Atributos de GM"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Editar GM</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (window.confirm(`Tem certeza que deseja excluir o personagem "${char.name}"?`)) {
                                deleteCharacter(char.id);
                              }
                            }}
                            className="text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition cursor-pointer"
                            title="Excluir Personagem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-[#0a0a09] p-3 rounded-lg border border-[#241e15] text-xs">
                        <div>
                          <span className="text-gray-500 text-[10px] block uppercase">Vida (HP)</span>
                          <span className="font-mono text-green-400 font-semibold">{char.health}/{char.healthmax}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-[10px] block uppercase">Mana</span>
                          <span className="font-mono text-blue-400 font-semibold">{char.mana}/{char.manamax}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-[10px] block uppercase">Magic Level</span>
                          <span className="font-mono text-[#E0C068] font-semibold">{char.maglevel}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-[#201b13]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#C9A227]" />
                          Templo: 5999, 6045, 7
                        </span>
                        <span className="text-green-400 font-mono">
                          Pronto para Conectar
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showChangePassModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14120e] border-2 border-[#8C6B1C] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#2d251a] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#C9A227]" />
                <h3 className="text-lg font-bold font-serif text-white">
                  Alterar Senha da Conta #{currentAccount?.name}
                </h3>
              </div>
              <button
                onClick={() => setShowChangePassModal(false)}
                className="text-gray-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {changePassMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  changePassMsg.success
                    ? 'bg-green-500/10 text-green-300 border border-green-500/30'
                    : 'bg-red-500/10 text-red-300 border border-red-500/30'
                }`}
              >
                {changePassMsg.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />}
                <span>{changePassMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Nova Senha <span className="text-[#C9A227]">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Mínimo 4 caracteres (ex: MARLEY22@@##)"
                  className="w-full bg-[#0a0a09] border border-[#332a1e] rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Confirmar Nova Senha <span className="text-[#C9A227]">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassConfirm}
                  onChange={(e) => setNewPassConfirm(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full bg-[#0a0a09] border border-[#332a1e] rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div className="bg-[#0c0b09] border border-[#2d251a] rounded-lg p-2.5 text-[11px] text-gray-400">
                A nova senha é criptografada em <strong>SHA1</strong> e atualizada imediatamente na tabela <code>accounts</code> do MySQL <code>yurots_db</code>.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(false)}
                  className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={changePassLoading}
                  className="bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold px-5 py-2 rounded-lg text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 select-none font-serif"
                >
                  <KeyRound className="w-3.5 h-3.5 text-black" />
                  <span>{changePassLoading ? 'Gravando no MySQL...' : 'Salvar Nova Senha'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CHARACTER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14120e] border-2 border-[#8C6B1C] rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#2d251a] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C9A227]" />
                <h3 className="text-lg font-bold font-serif text-white">
                  Criar Novo Personagem
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  createMsg.success
                    ? 'bg-green-500/10 text-green-300 border border-green-500/30'
                    : 'bg-red-500/10 text-red-300 border border-red-500/30'
                }`}
              >
                {createMsg.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{createMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateCharacter} className="space-y-4">
              {/* Character Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Nome do Personagem <span className="text-[#C9A227]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  placeholder="Ex: Guerreiro Marley"
                  className="w-full bg-[#0a0a09] border border-[#332a1e] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-[#C9A227]"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Entre 3 e 25 caracteres. Letras e espaços permitidos.
                </p>
              </div>

              {/* Sex Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Sexo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCharSex(1)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition ${
                      charSex === 1
                        ? 'bg-[#C9A227]/20 border-[#C9A227] text-[#E0C068]'
                        : 'bg-[#0a0a09] border-[#2d251a] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-blue-400 font-bold">♂</span>
                    <span>Masculino (Citizen 128)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCharSex(0)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition ${
                      charSex === 0
                        ? 'bg-[#C9A227]/20 border-[#C9A227] text-[#E0C068]'
                        : 'bg-[#0a0a09] border-[#2d251a] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-pink-400 font-bold">♀</span>
                    <span>Feminino (Citizen 136)</span>
                  </button>
                </div>
              </div>

              {/* Vocation Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Escolha sua Vocação
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {vocationsList.map((voc) => {
                    const isSelected = charVoc === voc.id;
                    return (
                      <div
                        key={voc.id}
                        onClick={() => setCharVoc(voc.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition text-left space-y-1.5 ${
                          isSelected
                            ? 'bg-[#241d13] border-[#C9A227] shadow-[0_0_12px_rgba(201,162,39,0.25)] ring-1 ring-[#C9A227]'
                            : 'bg-[#0a0a09] border-[#292217] hover:border-[#4d3e2a]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white flex items-center gap-1.5">
                            <span>{voc.icon}</span>
                            <span>{voc.name}</span>
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            isSelected ? 'bg-[#C9A227] text-black font-bold' : 'text-gray-500'
                          }`}>
                            {isSelected ? 'Selecionado' : 'Escolher'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-tight">
                          {voc.desc}
                        </p>
                        <div className="flex items-center gap-2 text-[9px] text-[#C9A227] font-mono pt-1">
                          <span>+{voc.hpGain} HP/lvl</span>
                          <span>•</span>
                          <span>+{voc.manaGain} MP/lvl</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Spawn Location Notice */}
              <div className="bg-[#0c0b09] border border-[#2d251a] rounded-lg p-2.5 text-[11px] text-gray-400 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>
                  O personagem nascerá no <strong>Templo de Yurots</strong> (Coordenadas: <strong>5999, 6045, 7</strong>) no nível 8 com equipamentos básicos de sua vocação.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold px-5 py-2 rounded-lg text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 select-none font-serif"
                >
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>{createLoading ? 'Salvando no MySQL...' : 'Criar Personagem Agora'}</span>
                </button>
              </div>
            </form>
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
