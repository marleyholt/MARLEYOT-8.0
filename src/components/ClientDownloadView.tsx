import React, { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';
import { 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Monitor, 
  Crown, 
  Link as LinkIcon, 
  Save, 
  AlertCircle,
  FileArchive,
  ArrowRight,
  Info,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';

export const ClientDownloadView: React.FC = () => {
  const { 
    serverConfig, 
    clientDownloadInfo, 
    updateClientDownloadConfig, 
    isStaff, 
    setPortalSubTab, 
    currentAccount 
  } = useServer();

  // GM Form State
  const [urlInput, setUrlInput] = useState<string>(clientDownloadInfo.url || '');
  const [versionInput, setVersionInput] = useState<string>(clientDownloadInfo.version || 'MarleyOT 7.72 YurOTS Oficial');
  const [notesInput, setNotesInput] = useState<string>(clientDownloadInfo.notes || 'Cliente oficial pronto com IP 137.131.196.66 pré-configurado.');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sync GM input with context when updated
  useEffect(() => {
    if (clientDownloadInfo.url) {
      setUrlInput(clientDownloadInfo.url);
    }
    if (clientDownloadInfo.version) {
      setVersionInput(clientDownloadInfo.version);
    }
    if (clientDownloadInfo.notes) {
      setNotesInput(clientDownloadInfo.notes);
    }
  }, [clientDownloadInfo]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveGmLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);

    const cleanUrl = urlInput.trim();
    if (!cleanUrl || (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://'))) {
      setSaveErrorMessage('Por favor, informe uma URL válida começando com http:// ou https:// (ex: Mediafire, Google Drive, Mega)');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateClientDownloadConfig(cleanUrl, versionInput.trim(), notesInput.trim());
      if (res.success) {
        setSaveSuccessMessage('✓ Link de download do cliente salvo e atualizado para todos os jogadores com sucesso!');
        setTimeout(() => setSaveSuccessMessage(null), 5000);
      } else {
        setSaveErrorMessage(res.message || 'Erro ao salvar o link de download.');
      }
    } catch (err: any) {
      setSaveErrorMessage(err.message || 'Erro inesperado ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasConfiguredLink = Boolean(
    clientDownloadInfo.url && 
    (clientDownloadInfo.url.startsWith('http://') || clientDownloadInfo.url.startsWith('https://'))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* GM ADMIN LINK MANAGER (Visible when logged in with GM / Staff account) */}
      {isStaff && (
        <div className="bg-gradient-to-br from-[#18140e] via-[#20190f] to-[#14120c] border-2 border-[#C9A227] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A227]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-[#C9A227]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A227]/20 border border-[#C9A227] flex items-center justify-center shadow-inner">
                <Crown className="w-5 h-5 text-[#C9A227]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#E0C068] font-serif flex items-center gap-2">
                  Painel do Administrador (GM) - Link do Cliente
                  <span className="bg-[#C9A227] text-black text-[10px] font-mono px-2 py-0.5 rounded font-extrabold uppercase">
                    Configuração Ativa
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  Cole abaixo o link do arquivo de instalação do servidor (Mediafire, Google Drive, Mega ou direto da VPS).
                </p>
              </div>
            </div>

            {hasConfiguredLink && (
              <a
                href={clientDownloadInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#251d10] hover:bg-[#332612] text-[#E0C068] border border-[#C9A227]/40 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Testar Link Atual</span>
              </a>
            )}
          </div>

          <form onSubmit={handleSaveGmLink} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#C9A227]" />
                Link de Download do Cliente (Mediafire / Nuvem / VPS):
                <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://www.mediafire.com/file/exemplo/MarleyOT_Client_800.zip/file"
                  className="w-full bg-[#0d0d0d] border border-[#44371e] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-gray-600 transition"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Quando os jogadores clicarem no botão "Baixar Cliente", eles serão redirecionados exatamente para este endereço.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Nome / Versão do Arquivo:
                </label>
                <input
                  type="text"
                  value={versionInput}
                  onChange={(e) => setVersionInput(e.target.value)}
                  placeholder="Ex: MarleyOT 7.72 YurOTS Oficial (v1.0)"
                  className="w-full bg-[#0d0d0d] border border-[#333] focus:border-[#C9A227] rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Instruções / Notas para o Jogador:
                </label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Ex: Contém IP Changer embutido e mapas Yurots 7.72"
                  className="w-full bg-[#0d0d0d] border border-[#333] focus:border-[#C9A227] rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            {saveSuccessMessage && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            {saveErrorMessage && (
              <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveErrorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-gray-400">
                {clientDownloadInfo.updatedAt && (
                  <span>Última atualização: {new Date(clientDownloadInfo.updatedAt).toLocaleString('pt-BR')}</span>
                )}
              </span>

              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-lg font-serif disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Salvando Link...' : 'Salvar Link do Cliente'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* HERO / PLAYER DOWNLOAD SECTION */}
      <div className="bg-gradient-to-b from-[#161616] to-[#0f0f0f] border-2 border-[#2b2b2b] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#C9A227]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#201d13] border border-[#C9A227]/40 text-[#E0C068] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Cliente Oficial Pré-Configurado (Tibia 7.72)</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
            Baixe o Cliente e Comece a Jogar no <span className="text-[#C9A227]">MarleyOT</span>
          </h2>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Não é necessário configurar IP ou portas complicadas. O cliente oficial já vem configurado diretamente para conectar no servidor em 
            <span className="text-[#C9A227] font-mono font-bold px-1.5 py-0.5 mx-1 bg-black/40 rounded border border-[#C9A227]/30">
              {serverConfig.serverIp}
            </span>.
          </p>

          {/* MAIN DOWNLOAD BUTTON */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            {hasConfiguredLink ? (
              <a
                id="main-client-download-button"
                href={clientDownloadInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#C9A227] to-[#e0be48] hover:from-[#d8b030] hover:to-[#eecf60] text-black font-extrabold text-base rounded-2xl shadow-[0_0_30px_rgba(201,162,39,0.3)] hover:shadow-[0_0_40px_rgba(201,162,39,0.5)] transition transform hover:-translate-y-0.5 cursor-pointer font-serif"
              >
                <Download className="w-5 h-5 text-black" />
                <span>BAIXAR CLIENTE COMPLETO</span>
                <ExternalLink className="w-4 h-4 text-black/70" />
              </a>
            ) : (
              <div className="w-full sm:w-auto bg-[#221c10] border border-[#C9A227]/50 rounded-2xl p-4 text-center">
                <p className="text-sm font-semibold text-[#E0C068]">
                  O link de download está sendo preparado pela Staff.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Se você for o Administrador, faça login na sua conta GM para colar o link do Mediafire acima.
                </p>
              </div>
            )}

            <button
              onClick={() => setPortalSubTab(currentAccount ? 'account' : 'register')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#1e1e1e] hover:bg-[#282828] text-gray-200 border border-[#333] hover:border-[#555] font-semibold text-sm rounded-2xl transition cursor-pointer"
            >
              <span>{currentAccount ? 'Acessar Minha Conta' : 'Criar Nova Conta'}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Quick specs pill row */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1.5 bg-[#141414] px-3 py-1.5 rounded-lg border border-[#262626]">
              <FileArchive className="w-3.5 h-3.5 text-amber-400" />
              <span>Versão: <strong className="text-white">{clientDownloadInfo.version || '8.00 Custom'}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#141414] px-3 py-1.5 rounded-lg border border-[#262626]">
              <Monitor className="w-3.5 h-3.5 text-sky-400" />
              <span>Windows 7 / 10 / 11 &amp; Linux (Wine)</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#141414] px-3 py-1.5 rounded-lg border border-[#262626]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Livre de Vírus</span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK STEP-BY-STEP GUIDE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className="bg-[#141414] border border-[#242424] rounded-xl p-5 space-y-3 relative hover:border-[#C9A227]/40 transition">
          <div className="w-8 h-8 rounded-lg bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#C9A227] font-bold text-sm flex items-center justify-center font-serif">
            1
          </div>
          <h3 className="text-sm font-bold text-white font-serif">Baixar o Arquivo</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Clique no botão de download acima para baixar o cliente oficial hospedado no Mediafire/Nuvem.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-[#141414] border border-[#242424] rounded-xl p-5 space-y-3 relative hover:border-[#C9A227]/40 transition">
          <div className="w-8 h-8 rounded-lg bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#C9A227] font-bold text-sm flex items-center justify-center font-serif">
            2
          </div>
          <h3 className="text-sm font-bold text-white font-serif">Extrair no Computador</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Extraia a pasta <code>.zip</code> para a sua Área de Trabalho ou pasta de jogos de sua preferência.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-[#141414] border border-[#242424] rounded-xl p-5 space-y-3 relative hover:border-[#C9A227]/40 transition">
          <div className="w-8 h-8 rounded-lg bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#C9A227] font-bold text-sm flex items-center justify-center font-serif">
            3
          </div>
          <h3 className="text-sm font-bold text-white font-serif">Abrir e Jogar</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Execute o inicializador do jogo e use a sua conta e senha criadas aqui no portal para entrar e se divertir!
          </p>
        </div>
      </div>

      {/* TECHNICAL CONNECTION INFO (IP CHANGER ALTERNATIVE) */}
      <div className="bg-[#141414] border border-[#242424] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#C9A227]" />
          <h3 className="text-sm font-bold text-white font-serif">
            Já tem o Tibia 7.72 instalado? Conecte via IP Changer
          </h3>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Se você prefere utilizar o seu próprio cliente Tibia 7.72 ou OTClient com IP Changer clássico, configure os seguintes parâmetros de conexão:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* IP */}
          <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-mono text-gray-500 font-bold">IP do Servidor</div>
              <div className="text-sm font-mono font-bold text-[#C9A227]">{serverConfig.serverIp}</div>
            </div>
            <button
              onClick={() => handleCopy(serverConfig.serverIp, 'ip')}
              className="p-1.5 hover:bg-[#222] rounded text-gray-400 hover:text-white transition cursor-pointer"
              title="Copiar IP"
            >
              {copiedField === 'ip' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Port */}
          <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-mono text-gray-500 font-bold">Porta Login</div>
              <div className="text-sm font-mono font-bold text-white">7171</div>
            </div>
            <button
              onClick={() => handleCopy('7171', 'port')}
              className="p-1.5 hover:bg-[#222] rounded text-gray-400 hover:text-white transition cursor-pointer"
              title="Copiar Porta"
            >
              {copiedField === 'port' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Version */}
          <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-mono text-gray-500 font-bold">Protocolo / Versão</div>
              <div className="text-sm font-mono font-bold text-white">7.72</div>
            </div>
            <button
              onClick={() => handleCopy('7.72', 'ver')}
              className="p-1.5 hover:bg-[#222] rounded text-gray-400 hover:text-white transition cursor-pointer"
              title="Copiar Versão"
            >
              {copiedField === 'ver' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
