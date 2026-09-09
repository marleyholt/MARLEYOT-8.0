import React, { useState } from 'react';
import { useServer } from '../context/ServerContext';
import { CLIENT_PACKAGING_GUIDE } from '../data/guideData';
import { 
  Download, 
  Copy, 
  Check, 
  FolderTree, 
  Monitor, 
  Sparkles, 
  ExternalLink,
  Layers,
  FileCode,
  PackageCheck,
  Bot,
  Zap,
  ShieldCheck,
  Flame,
  CheckCircle2
} from 'lucide-react';

export const ClientPackagerTab: React.FC = () => {
  const { serverConfig, updateServerConfig } = useServer();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedClientType, setSelectedClientType] = useState<string>('otclient_vbot');
  const [activeCodeTab, setActiveCodeTab] = useState<'entergame' | 'vbot' | 'otml'>('entergame');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Generated OTClient entergame.lua snippet
  const generatedEntergameLua = `-- modules/client_entergame/entergame.lua
-- Configuração Automática para ${serverConfig.serverName} (Tibia 7.72)
-- O jogador não precisa digitar IP nem trocar porta!

EnterGame = { }

-- Variáveis travadas do seu servidor na Oracle Cloud
SERVER_IP = "${serverConfig.serverIp}"
SERVER_PORT = ${serverConfig.loginPort}
CLIENT_VERSION = 772 -- Protocolo 7.72

function EnterGame.init()
  enterGameButton = modules.client_topmenu.addLeftButton('enterGameButton', tr('Enter Game'), '/images/topbuttons/entergame', EnterGame.firstShow)
  
  -- Trava automática de IP e Porta na janela de login
  if EnterGame.setUniqueServer then
    EnterGame.setUniqueServer(SERVER_IP, SERVER_PORT, CLIENT_VERSION)
  end
  
  -- Pré-carrega o protocolo 7.72 e coisas de sprites
  g_game.setClientVersion(CLIENT_VERSION)
  g_game.setProtocolVersion(g_game.getClientVersion())
  
  connect(g_game, { onGameStart = EnterGame.onGameStart,
                    onGameEnd = EnterGame.onGameEnd })
end

function EnterGame.terminate()
  disconnect(g_game, { onGameStart = EnterGame.onGameStart,
                       onGameEnd = EnterGame.onGameEnd })
  enterGameButton:destroy()
end
`;

  // Generated vBot script snippet for Yurots 7.72
  const generatedVbotLua = `-- modules/game_bot/default_configs/vbot/configs/marleyot_yurots.lua
-- Configuração Automática do vBot para ${serverConfig.serverName}
-- Servidor: ${serverConfig.serverIp} | Protocolo: 7.72
-- Recursos integrados: Auto UH, Auto Mana Fluid, Auto Exura Gran, Auto Haste, Anti-Idle

local config = {
  profileName = "MARLEYOT Yurots 7.72 (Recomendado)",
  version = "7.72",
}

-- 1. HEALER INTEGRADO (Tibia 7.72 Clássico)
-- Knights usam Ultimate Healing Rune (ID 3160 ou 2273)
-- Mages e Paladins usam magias de cura ou runas
vBot.Healer = {
  autoUh = {
    enabled = true,
    minHealthPercent = 70,
    runeId = 3160, -- Rune de UH no Tibia 7.72
    useOnSelf = true,
  },
  autoManaFluid = {
    enabled = true,
    minManaPercent = 55,
    potionId = 2874, -- ID do Mana Fluid clássico
  },
  autoExura = {
    enabled = true,
    minHealthPercent = 90,
    spell = "exura",
  },
  autoExuraGran = {
    enabled = true,
    minHealthPercent = 65,
    spell = "exura gran",
  },
  autoExuraVita = {
    enabled = true,
    minHealthPercent = 40,
    spell = "exura vita",
  }
}

-- 2. TOOLS & UTILITÁRIOS PARA YUROTS
vBot.Tools = {
  autoHaste = {
    enabled = true,
    spell = "utani hur", -- Mantém o personagem veloz automaticamente
  },
  antiIdle = {
    enabled = true, -- Vira o personagem a cada 10 min para nunca tomar kick
  },
  autoEatFood = {
    enabled = true, -- Come Brown Mushrooms, Meat e Dragon Ham
    intervalMs = 30000,
  },
  fullLight = {
    enabled = true, -- Visão limpa e iluminada sem precisar de tocha
  },
  holdTarget = {
    enabled = true, -- Trava mira nos monstros (Dragon, Wyrm, Demon)
  },
  autoUtamoVita = {
    enabled = false, -- Ativa Mana Shield automático se HP descer
    minHealthPercent = 40,
  }
}

-- 3. PRESETS DE CAVEBOT & TARGETBOT (YUROTS 7.72)
vBot.CavebotPresets = {
  "Yurots_Dragon_Lair_Templo",
  "Yurots_Wyrm_Mountain",
  "Yurots_Giant_Spider_Forest",
  "Yurots_Demons_Annihilator",
}

print("[vBot] Perfil MARLEYOT Yurots 7.72 carregado com sucesso!")
`;

  // Generated config.otml snippet
  const generatedConfigOtml = `// config.otml - Configurações padrão do Cliente
client
  version: 772
  ip: "${serverConfig.serverIp}"
  port: ${serverConfig.loginPort}
  custom-font: true
  enable-audio: true
  music-volume: 70
  sound-volume: 85
  vsync: true
  fullscreen: false
  classic-controls: true
  smart-walk: false
`;

  // Download files as text triggers
  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-[#C9A227]/10 border border-[#C9A227]/30 px-3 py-1 rounded-full text-xs font-semibold text-[#C9A227]">
                <PackageCheck className="w-4 h-4 text-[#C9A227]" />
                Empacotamento de Cliente Pronto para Jogadores
              </div>
              <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full text-xs font-semibold text-green-400">
                <Bot className="w-3.5 h-3.5 text-green-400" />
                vBot Integrado (V-Bot v8)
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Como Criar o Cliente com vBot Integrado
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Elimine a necessidade de IP Changer e configurações manuais de bot! Seus jogadores recebem 
              o cliente em arquivo <strong>.ZIP</strong> com o IP da sua Oracle (<code>{serverConfig.serverIp}</code>) travado 
              e o <strong>vBot</strong> embutido pronto com Auto UH, Auto Mana Fluid, Auto Haste e Cavebot.
            </p>
          </div>

          <a
            href="https://github.com/OTCv8/otclientv8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] px-4 py-2 rounded-xl text-xs font-mono text-gray-300 hover:text-[#C9A227] transition"
          >
            <Bot className="w-4 h-4 text-[#C9A227]" />
            <span>Repositório OTClientv8</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>

        {/* Server IP quick bar */}
        <div className="mt-6 pt-4 border-t border-[#222222] flex flex-wrap items-center justify-between gap-4 bg-[#0A0A0A] p-4 rounded-xl border border-[#222222]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
            <div className="text-xs text-gray-300">
              IP Público da sua Instância Oracle:
            </div>
            <input
              type="text"
              value={serverConfig.serverIp}
              onChange={(e) => updateServerConfig({ serverIp: e.target.value })}
              placeholder="137.131.196.66"
              className="bg-[#111111] border border-[#262626] rounded-lg px-3 py-1.5 text-xs text-[#C9A227] font-mono font-bold focus:outline-none focus:border-[#C9A227]"
            />
          </div>
          <div className="text-xs text-gray-400">
            Porta Login: <strong className="text-gray-200">{serverConfig.loginPort}</strong> • Game: <strong className="text-gray-200">{serverConfig.gamePort}</strong> • Versão: <strong className="text-gray-200">7.72</strong>
          </div>
        </div>
      </div>

      {/* Choice of Client Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CLIENT_PACKAGING_GUIDE.recommendedOptions.map((opt) => (
          <div
            key={opt.id}
            onClick={() => setSelectedClientType(opt.id)}
            className={`p-5 rounded-2xl border cursor-pointer transition shadow-md select-none relative ${
              selectedClientType === opt.id
                ? 'bg-[#111111] border-[#C9A227] ring-1 ring-[#C9A227]/40 shadow-[0_0_15px_rgba(201,162,39,0.1)]'
                : 'bg-[#111111] border-[#222222] hover:border-[#333]'
            }`}
          >
            {opt.id === 'otclient_vbot' && (
              <span className="absolute -top-2.5 right-4 bg-[#C9A227] text-black font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                Recomendado
              </span>
            )}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-sm font-serif">{opt.name}</h3>
                <span className="text-[10px] bg-[#C9A227]/10 text-[#C9A227] px-2 py-0.5 rounded border border-[#C9A227]/30 font-semibold mt-1.5 inline-block">
                  {opt.badge}
                </span>
              </div>
              {opt.id === 'otclient_vbot' ? (
                <Bot className="w-6 h-6 text-[#C9A227]" />
              ) : (
                <Monitor className="w-6 h-6 text-gray-400" />
              )}
            </div>

            <ul className="mt-4 space-y-1.5 text-xs text-gray-300">
              {opt.pros.map((p, pIdx) => (
                <li key={pIdx} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
                  <span className="leading-snug">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* vBot Features Spotlight Card */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <span>Recursos Ativos no vBot para o MARLEYOT Yurots 7.72</span>
              </h3>
              <p className="text-xs text-gray-400">
                O vBot roda nativo em C++/Lua dentro do OTClient sem ser detectado como processo externo.
              </p>
            </div>
          </div>
          <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-mono">
            V-Bot v8 / Mehah
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-[#222222] space-y-1">
            <div className="font-bold text-gray-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Auto UH & Mana Fluid</span>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Curar automaticamente com runa de UH e Mana Fluid com delays sem errar o clique.
            </p>
          </div>

          <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-[#222222] space-y-1">
            <div className="font-bold text-gray-200 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto Haste & Anti-Idle</span>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Mantém Utani Hur sempre renovado e dança sozinho para não tomar disconnect por inatividade.
            </p>
          </div>

          <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-[#222222] space-y-1">
            <div className="font-bold text-gray-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Full Light & Auto Open</span>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Iluminação completa de tela sem tochas e abertura automática de portas de quests/casas.
            </p>
          </div>

          <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-[#222222] space-y-1">
            <div className="font-bold text-gray-200 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-purple-400" />
              <span>Cavebot & Targetbot</span>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Gravação de waypoints e ataque automático em Dragons, Wyrms e Behemoths no mapa Yurots.
            </p>
          </div>
        </div>
      </div>

      {/* Steps to prepare client */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#C9A227]" />
          <span>Passo a Passo: Montando a Pasta do Cliente (.ZIP)</span>
        </h3>

        <div className="space-y-4">
          {CLIENT_PACKAGING_GUIDE.otclientSteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-[#0A0A0A] border border-[#222222]">
              <div className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-[#333] text-[#C9A227] font-bold text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-bold text-gray-200 text-sm">{step.title}</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{step.desc}</p>
                {step.url && (
                  <div className="pt-1">
                    <span className="text-[11px] text-[#C9A227] font-mono bg-[#1A1A1A] px-2.5 py-0.5 rounded border border-[#333]">
                      {step.url}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Directory Tree & Code Generators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Directory Structure */}
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold font-serif text-white flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-[#C9A227]" />
            <span>Estrutura de Pastas do Pacote com vBot para o Jogador</span>
          </h3>
          <p className="text-xs text-gray-400">
            Veja onde fica cada arquivo antes de compactar em <strong>MARLEYOT_Client_vBot.zip</strong>:
          </p>

          <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222] font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto">
            <div className="text-[#C9A227] font-bold">📦 MARLEYOT_Client_vBot/</div>
            <div className="pl-4">├── 🎮 <span className="text-[#C9A227] font-bold">Jogar MARLEYOT.exe</span> <span className="text-gray-500">(otclientv8.exe)</span></div>
            <div className="pl-4">├── 📄 init.lua</div>
            <div className="pl-4">├── 📄 config.otml</div>
            <div className="pl-4">├── 📁 <span className="text-sky-300">data/</span></div>
            <div className="pl-8">├── 📁 images/ → background.png <span className="text-gray-500">(Wallpaper MARLEYOT)</span></div>
            <div className="pl-8">└── 📁 things/</div>
            <div className="pl-12">└── 📁 772/</div>
            <div className="pl-16">├── 📦 Tibia.spr <span className="text-[#C9A227]">(Sprites 7.72)</span></div>
            <div className="pl-16">└── 📦 Tibia.dat <span className="text-[#C9A227]">(Dados 7.72)</span></div>
            <div className="pl-4">└── 📁 <span className="text-sky-300">modules/</span></div>
            <div className="pl-8">├── 📁 <span className="text-green-400 font-bold">game_bot/</span> <span className="text-gray-500">← MÓDULO DO vBOT</span></div>
            <div className="pl-12">├── 📁 default_configs/</div>
            <div className="pl-16">└── 📁 vbot/</div>
            <div className="pl-20">├── 📁 configs/ → <span className="text-[#C9A227]">marleyot_yurots.lua</span></div>
            <div className="pl-20">├── 📁 cavebot/</div>
            <div className="pl-20">└── 📁 healer/</div>
            <div className="pl-8">└── 📁 client_entergame/</div>
            <div className="pl-12">└── 📄 entergame.lua <span className="text-green-400">(IP {serverConfig.serverIp} travado)</span></div>
          </div>

          <div className="bg-[#0A0A0A] border border-[#222222] p-3.5 rounded-xl text-xs text-gray-300 space-y-1">
            <div className="font-bold flex items-center gap-1 text-[#C9A227]">
              <Sparkles className="w-3.5 h-3.5" />
              Como o jogador abre o vBot dentro do jogo?
            </div>
            <p className="text-gray-400">
              Dentro do jogo, basta clicar no ícone de <strong>Robô</strong> na barra superior direita do OTClient 
              ou pressionar o atalho <code>Ctrl + Shift + B</code>. O perfil <strong>MARLEYOT Yurots 7.72</strong> já virá selecionado!
            </p>
          </div>
        </div>

        {/* Generated Code Files (Tabbed) */}
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222222] pb-3">
            {/* Tabs */}
            <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-[#222] gap-1">
              <button
                onClick={() => setActiveCodeTab('entergame')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  activeCodeTab === 'entergame' ? 'bg-[#1A1A1A] text-[#C9A227] border border-[#333]' : 'text-gray-400 hover:text-white'
                }`}
              >
                entergame.lua (IP Travado)
              </button>
              <button
                onClick={() => setActiveCodeTab('vbot')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                  activeCodeTab === 'vbot' ? 'bg-[#1A1A1A] text-green-400 border border-[#333]' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Bot className="w-3 h-3" />
                <span>vBot Config (Auto UH)</span>
              </button>
              <button
                onClick={() => setActiveCodeTab('otml')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  activeCodeTab === 'otml' ? 'bg-[#1A1A1A] text-[#C9A227] border border-[#333]' : 'text-gray-400 hover:text-white'
                }`}
              >
                config.otml
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const content = activeCodeTab === 'entergame' ? generatedEntergameLua : activeCodeTab === 'vbot' ? generatedVbotLua : generatedConfigOtml;
                  handleCopy(content, activeCodeTab);
                }}
                className="text-xs bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-gray-200 px-2.5 py-1 rounded-md transition flex items-center gap-1"
              >
                {copiedCode === activeCodeTab ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === activeCodeTab ? 'Copiado!' : 'Copiar'}</span>
              </button>
              <button
                onClick={() => {
                  if (activeCodeTab === 'entergame') downloadFile('entergame.lua', generatedEntergameLua);
                  else if (activeCodeTab === 'vbot') downloadFile('marleyot_yurots.lua', generatedVbotLua);
                  else downloadFile('config.otml', generatedConfigOtml);
                }}
                className="text-xs bg-[#C9A227] hover:bg-[#b58f1f] text-[#0A0A0A] font-bold px-2.5 py-1 rounded-md transition flex items-center gap-1 shadow-[0_0_10px_rgba(201,162,39,0.2)]"
              >
                <Download className="w-3 h-3" />
                <span>Baixar</span>
              </button>
            </div>
          </div>

          <pre className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222] text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre leading-relaxed max-h-[360px]">
            {activeCodeTab === 'entergame' && generatedEntergameLua}
            {activeCodeTab === 'vbot' && generatedVbotLua}
            {activeCodeTab === 'otml' && generatedConfigOtml}
          </pre>

          <div className="pt-2 flex items-center justify-between text-xs text-gray-400">
            <span>
              {activeCodeTab === 'entergame' && 'Destino: modules/client_entergame/entergame.lua'}
              {activeCodeTab === 'vbot' && 'Destino: modules/game_bot/default_configs/vbot/configs/marleyot_yurots.lua'}
              {activeCodeTab === 'otml' && 'Destino: pasta raiz do cliente (config.otml)'}
            </span>
            <span className="text-green-400 font-mono text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              IP: {serverConfig.serverIp}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
