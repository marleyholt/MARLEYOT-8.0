import React, { useState } from 'react';
import { ORACLE_GUIDE_STEPS } from '../data/guideData';
import { useServer } from '../context/ServerContext';
import { 
  Cloud, 
  CheckCircle2, 
  Copy, 
  Check, 
  Clock, 
  AlertTriangle, 
  Server, 
  HelpCircle, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  GitFork,
  ExternalLink
} from 'lucide-react';

export const OracleGuideTab: React.FC = () => {
  const { serverConfig, updateServerConfig, setActiveTab } = useServer();
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [expandedStep, setExpandedStep] = useState<string>('step-1-account');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const toggleStepCompleted = (stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const totalSteps = ORACLE_GUIDE_STEPS.length;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="space-y-6">
      {/* Hero Header - Elegant Dark */}
      <div className="bg-[#151515] border border-[#222222] rounded-xl p-6 sm:p-8 relative">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-[#C9A227]/10 border border-[#C9A227]/30 px-3 py-1 rounded-full text-xs font-semibold text-[#C9A227]">
                <Cloud className="w-4 h-4 text-[#C9A227]" />
                Guia Passo a Passo Oficial (VPS Ubuntu)
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
              Hospedando o Servidor MARLEYOT 7.72 na Oracle Cloud Always Free
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Siga cada etapa abaixo no seu ritmo. Todos os comandos necessários para o servidor 
              <strong> MARLEYOT 7.72</strong>, compilar o executável com CMake, instalar o MariaDB, configurar o firewall e criar o serviço 24/7 estão prontos para copiar e colar com 1 clique!
            </p>
          </div>

          {/* Progress Box */}
          <div className="bg-[#0D0D0D] border border-[#222222] rounded-xl p-5 text-center min-w-[190px]">
            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
              Seu Progresso
            </div>
            <div className="text-3xl font-bold text-[#C9A227] my-1 font-serif">{progressPercent}%</div>
            <div className="text-xs text-gray-400">
              {completedCount} de {totalSteps} passos concluídos
            </div>
            <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden mt-3">
              <div 
                className="bg-[#C9A227] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Real-time IP Binder */}
        <div className="mt-6 pt-5 border-t border-[#222222] flex flex-wrap items-center gap-4 bg-[#0D0D0D] p-4 rounded-xl border border-[#1F1F1F]">
          <div className="text-xs text-gray-300">
            <span className="font-bold text-[#C9A227]">Dica Pro:</span> Digite o IP Público da sua Máquina da Oracle abaixo. Todos os comandos do tutorial se adaptarão automaticamente!
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <input
              type="text"
              value={serverConfig.serverIp}
              onChange={(e) => updateServerConfig({ serverIp: e.target.value })}
              placeholder="Ex: 129.146.88.10"
              className="bg-[#0A0A0A] border border-[#262626] rounded-lg px-3.5 py-1.5 text-xs text-[#C9A227] font-mono focus:outline-none focus:border-[#C9A227] flex-1"
            />
            <span className="text-[11px] text-gray-500 whitespace-nowrap font-mono">
              (IP salvo nas configurações)
            </span>
          </div>
        </div>
      </div>

      {/* Steps Accordion */}
      <div className="space-y-4">
        {ORACLE_GUIDE_STEPS.map((step, idx) => {
          const isExpanded = expandedStep === step.id;
          const isDone = !!completedSteps[step.id];

          return (
            <div
              key={step.id}
              className={`border rounded-xl transition-all overflow-hidden ${
                isDone
                  ? 'bg-[#151515] border-green-500/30'
                  : isExpanded
                  ? 'bg-[#151515] border-[#C9A227]/40 shadow-[0_0_15px_rgba(201,162,39,0.08)]'
                  : 'bg-[#111111] border-[#222222] hover:border-[#333333]'
              }`}
            >
              {/* Step Header */}
              <div
                onClick={() => setExpandedStep(isExpanded ? '' : step.id)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3.5">
                  <button
                    onClick={(e) => toggleStepCompleted(step.id, e)}
                    title={isDone ? 'Marcar como não concluído' : 'Marcar como concluído'}
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition ${
                      isDone
                        ? 'bg-green-600 border-green-500 text-white'
                        : 'border-[#333] hover:border-[#C9A227] text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-sm sm:text-base ${isDone ? 'line-through text-gray-500' : 'text-white'}`}>
                        {step.title}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        step.difficulty === 'Importante'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/25'
                          : step.difficulty === 'Intermediário'
                          ? 'bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30'
                          : 'bg-green-500/10 text-green-400 border border-green-500/25'
                      }`}>
                        {step.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{step.shortDesc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 hidden sm:flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    ~{step.estimatedMinutes} min
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Step Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-2 border-t border-[#222222] space-y-4">
                  {/* Summary */}
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-[#0D0D0D] p-3.5 rounded-lg border border-[#1F1F1F]">
                    {step.content.summary}
                  </p>

                  {/* Instructions list */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
                      O que fazer nesta etapa:
                    </h4>
                    <ol className="space-y-1.5 text-xs text-gray-300 list-decimal list-inside">
                      {step.content.instructions.map((inst, i) => (
                        <li key={i} className="leading-relaxed">
                          {inst}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Commands Blocks if any */}
                  {step.content.commands && step.content.commands.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A227] flex items-center gap-1.5">
                        <span>Comandos para Executar no Terminal SSH:</span>
                      </h4>
                      {step.content.commands.map((cmdItem, cIdx) => {
                        const replacedCmd = cmdItem.cmd.replace(/SEU_IP_PUBLICO_ORACLE/g, serverConfig.serverIp);
                        const copyId = `${step.id}-${cIdx}`;
                        const isCopied = copiedIndex === copyId;

                        return (
                          <div key={cIdx} className="bg-[#0A0A0A] border border-[#222222] rounded-xl overflow-hidden">
                            <div className="bg-[#111111] px-3.5 py-1.5 border-b border-[#222222] flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-gray-300 font-mono">{cmdItem.label}</span>
                              <button
                                onClick={() => handleCopy(replacedCmd, copyId)}
                                className="flex items-center gap-1 text-xs bg-[#1A1A1A] hover:bg-[#252525] text-[#C9A227] px-2.5 py-0.5 rounded border border-[#333] transition"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                              </button>
                            </div>
                            <pre className="p-3.5 text-xs font-mono text-green-400 overflow-x-auto whitespace-pre leading-relaxed">
                              {replacedCmd}
                            </pre>
                            {cmdItem.desc && (
                              <div className="px-3.5 py-1.5 bg-[#0D0D0D] text-[11px] text-gray-400 border-t border-[#1F1F1F]">
                                💡 {cmdItem.desc}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tips */}
                  {step.content.tips && step.content.tips.length > 0 && (
                    <div className="bg-[#151515] border border-[#C9A227]/30 rounded-lg p-3.5 text-xs text-[#C9A227]/90 space-y-1.5">
                      {step.content.tips.map((t, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Warning if any */}
                  {step.content.warning && (
                    <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-3.5 text-xs text-red-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{step.content.warning}</span>
                    </div>
                  )}

                  {/* Mark as Done button inside step */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={(e) => toggleStepCompleted(step.id, e)}
                      className={`text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
                        isDone
                          ? 'bg-[#1A1A1A] text-gray-400 hover:text-white border border-[#333]'
                          : 'bg-[#C9A227] hover:bg-[#b58f1f] text-[#0A0A0A] font-bold shadow-[0_0_12px_rgba(201,162,39,0.25)]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isDone ? 'Concluído (clique para desmarcar)' : 'Concluir este Passo'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ & Troubleshooting for Beginners */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 shadow-xl space-y-5">
        <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#C9A227]" />
          <span>Perguntas Frequentes & Soluções para Problemas Comuns</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#0D0D0D] p-4 rounded-xl border border-[#222222] space-y-2">
            <h4 className="font-bold text-[#C9A227]">
              Por que a porta 7171 diz que está fechada no teste de portas?
            </h4>
            <p className="text-gray-300 leading-relaxed">
              Na Oracle Cloud existem <strong>DUAS</strong> barreiras de firewall:
              1. A <em>Security List</em> na VCN do site da Oracle (Passo 3).
              2. O <em>iptables</em> dentro do Ubuntu (Passo 4).
              Você precisa liberar em ambos os lugares! Além disso, a porta só responderá como "aberta" se o TFS estiver realmente em execução.
            </p>
          </div>

          <div className="bg-[#0D0D0D] p-4 rounded-xl border border-[#222222] space-y-2">
            <h4 className="font-bold text-[#C9A227]">
              Se eu fechar o PuTTY ou terminal, o servidor desliga?
            </h4>
            <p className="text-gray-300 leading-relaxed">
              Se você iniciou com <code>./tfs</code> normal, sim. Mas se você seguiu o <strong>Passo 8</strong> (Systemd),
              o servidor roda como serviço do sistema operacional em segundo plano. Você pode desligar o seu computador que o servidor continuará online 24 horas por dia!
            </p>
          </div>

          <div className="bg-[#0D0D0D] p-4 rounded-xl border border-[#222222] space-y-2">
            <h4 className="font-bold text-[#C9A227]">
              Como sei que o servidor está realmente online?
            </h4>
            <p className="text-gray-300 leading-relaxed">
              Execute no terminal SSH o comando: <code>sudo systemctl status otserv</code>.
              Deverá aparecer a palavra <span className="text-green-400 font-bold">active (running)</span> em verde.
              Para ver as mensagens e carregamento do mapa, use: <code>tail -f ~/otserv/server.log</code>.
            </p>
          </div>

          <div className="bg-[#0D0D0D] p-4 rounded-xl border border-[#222222] space-y-2">
            <h4 className="font-bold text-[#C9A227]">
              Prefere compilar tudo automaticamente com 1 clique?
            </h4>
            <p className="text-gray-300 leading-relaxed">
              Criamos um script bash all-in-one que faz todos os 8 passos de uma só vez para você! 
              Clique na aba <strong>Script Auto (.sh)</strong> no menu superior para baixar ou copiar o instalador automático.
            </p>
            <button
              onClick={() => setActiveTab('script')}
              className="text-[#C9A227] hover:underline font-semibold text-[11px] block mt-1"
            >
              Ir para o Gerador de Script Automático →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
