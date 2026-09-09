import React, { useState } from 'react';
import { useServer } from '../context/ServerContext';
import { Terminal, Copy, Check, Server, ShieldCheck, Cpu, Globe, Rocket, ArrowRight, Download, ExternalLink, ShieldAlert, Info } from 'lucide-react';

export const ServerHostingGuideView: React.FC = () => {
  const { serverConfig } = useServer();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const fullDeployScript = `#!/bin/bash
# ==========================================================
# MARLEYOT Yurots 8.0 - Instalador do Portal Web (AAC)
# Executar no seu terminal: ubuntu@marleyot-servidor
# ==========================================================

set -e

echo "=== [1/6] Atualizando pacotes e instalando Node.js 20 LTS e Nginx ==="
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git build-essential

echo "=== [2/6] Criando pasta do Portal Web em ~/otserv/portal ==="
mkdir -p ~/otserv/portal
cd ~/otserv/portal

# Se você baixou o marleyot-portal.tar.gz:
# tar -xzf marleyot-portal.tar.gz
# npm install --omit=dev

echo "=== [3/6] Liberando portas 80 (HTTP) e 3000 no firewall do Ubuntu ==="
sudo iptables -I INPUT 6 -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -p tcp --dport 3000 -j ACCEPT
sudo ufw allow 80/tcp 2>/dev/null || true
sudo ufw allow 3000/tcp 2>/dev/null || true
sudo netfilter-persistent save 2>/dev/null || true

echo "=== [4/6] Configurando Nginx para abrir direto no IP (porta 80) ==="
sudo bash -c 'cat <<EOF > /etc/nginx/sites-available/marleyot
server {
    listen 80;
    server_name ${serverConfig.serverIp} _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \\$host;
        proxy_cache_bypass \\$http_upgrade;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
    }
}
EOF'

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/marleyot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "=== [5/6] Criando Serviço Systemd 24/7 (marleyot-portal.service) ==="
sudo bash -c 'cat <<EOF > /etc/systemd/system/marleyot-portal.service
[Unit]
Description=MarleyOT Yurots 8.0 Web Portal & AAC API
After=network.target mysql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/otserv/portal
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=MYSQL_HOST=127.0.0.1
Environment=MYSQL_PORT=3306
Environment=MYSQL_USER=yurots_user
Environment=MYSQL_PASSWORD=MARLEY22@@##
Environment=MYSQL_DATABASE=yurots_db
ExecStart=/usr/bin/node dist/server.cjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF'

echo "=== [6/6] Recarregando e Ativando o Portal ==="
sudo systemctl daemon-reload
sudo systemctl enable marleyot-portal
sudo systemctl restart marleyot-portal || true

echo "=========================================================="
echo "✓ Instalação finalizada!"
echo "Acesse direto no seu navegador pelo IP: http://${serverConfig.serverIp}"
echo "Painel interno rodando na porta 3000 via Nginx."
echo "=========================================================="
`;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#14120e] via-[#1a1713] to-[#12100d] border-2 border-[#8C6B1C]/50 p-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#E0C068] text-xs font-mono px-3 py-1 rounded-full uppercase font-semibold">
            <Globe className="w-3.5 h-3.5 text-[#C9A227]" />
            Hospedagem 100% no seu Servidor Linux
          </div>
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2.5">
            <Server className="w-6 h-6 text-[#C9A227]" />
            Como Hospedar este Site no Servidor ({serverConfig.serverIp})
          </h2>
          <p className="text-xs text-gray-400 max-w-2xl">
            Este site foi construído com Node.js + Express + Vite para conectar diretamente ao MySQL local <code>yurots_db</code>. Você pode rodar ele 24 horas por dia na mesma máquina onde o Otserv está ligado!
          </p>
        </div>
      </div>

      {/* Download Bundle & Quick Deploy Card */}
      <div className="bg-[#141414] border-2 border-[#C9A227]/40 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-[#E0C068] font-serif flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#C9A227]" />
              Método Recomendado: Deploy Direto pelo GitHub (Sem Baixar Nada no PC)
            </div>
            <p className="text-xs text-gray-400 mt-1">
              O projeto já está versionado com Git. Basta clonar do seu GitHub direto no terminal do Ubuntu!
            </p>
          </div>
        </div>

        {/* GitHub Direct Clone Guide */}
        <div className="bg-[#1a1710] border border-[#C9A227]/30 rounded-xl p-4 space-y-3 text-xs">
          <div className="font-bold text-[#E0C068] font-serif flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#C9A227]" />
            Comandos para rodar direto no terminal da sua VPS (Ubuntu):
          </div>
          <p className="text-gray-300 leading-relaxed">
            Execute os 5 comandos abaixo no terminal <code>ubuntu@marleyot-servidor</code>:
          </p>

          <pre className="bg-black p-3.5 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto select-all">
{`# 1. Remove qualquer tentativa anterior vazia
rm -rf ~/otserv/portal && mkdir -p ~/otserv

# 2. Clona o repositório oficial do seu GitHub direto para o servidor
git clone https://github.com/marleyholt/MARLEYOT-8.0.git ~/otserv/portal
cd ~/otserv/portal

# 3. Instala as dependências e compila o front-end + backend
npm install
npm run build

# 4. Inicia o portal em segundo plano
pm2 start dist/server.cjs --name "marleyot-portal"
pm2 save
pm2 startup`}
          </pre>
        </div>

        {/* Oracle Cloud Security List Reminder */}
        <div className="bg-[#1f190e] border border-amber-500/40 rounded-lg p-3.5 flex items-start gap-3 text-xs text-amber-200/90">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-white block font-serif">Aviso Importante sobre o Painel da Oracle Cloud:</strong>
            <p className="text-gray-300 leading-relaxed">
              Além de liberar no Ubuntu, lembre-se de ir no seu painel web da Oracle Cloud:
              <strong> Networking &gt; Virtual Cloud Networks &gt; Security Lists &gt; Ingress Rules</strong> e adicionar a porta <strong>80 (TCP, 0.0.0.0/0)</strong>, exatamente igual como você adicionou as portas <strong>3306</strong> e <strong>7171</strong>!
            </p>
          </div>
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1 */}
        <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#C9A227] font-mono uppercase">Passo 1</span>
            <button
              onClick={() => handleCopy('sudo apt update && sudo apt install -y nodejs npm', 1)}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 1 ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
          <h3 className="text-sm font-bold text-white font-serif">Instalar Node.js no Ubuntu</h3>
          <p className="text-xs text-gray-400">
            No terminal do seu servidor (SSH), instale o Node.js 20 LTS:
          </p>
          <pre className="bg-[#0a0a09] border border-[#222] p-2.5 rounded-lg text-xs font-mono text-green-400 overflow-x-auto">
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -{"\n"}
            sudo apt install -y nodejs
          </pre>
        </div>

        {/* Step 2 */}
        <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#C9A227] font-mono uppercase">Passo 2</span>
            <button
              onClick={() => handleCopy('sudo iptables -I INPUT 6 -p tcp --dport 3000 -j ACCEPT && sudo iptables -I INPUT 6 -p tcp --dport 80 -j ACCEPT', 2)}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 2 ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
          <h3 className="text-sm font-bold text-white font-serif">Liberar Portas no Firewall</h3>
          <p className="text-xs text-gray-400">
            Libere as portas 80 (HTTP) e 3000 no iptables para que os jogadores possam acessar de qualquer lugar (RJ, Recife, etc.):
          </p>
          <pre className="bg-[#0a0a09] border border-[#222] p-2.5 rounded-lg text-xs font-mono text-cyan-400 overflow-x-auto">
            sudo iptables -I INPUT 6 -p tcp --dport 3000 -j ACCEPT{"\n"}
            sudo iptables -I INPUT 6 -p tcp --dport 80 -j ACCEPT{"\n"}
            sudo netfilter-persistent save
          </pre>
        </div>
      </div>

      {/* Full 1-Click Script */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#C9A227]" />
            <h3 className="text-base font-bold text-white font-serif">
              Script Completo de Instalação Automática (.sh)
            </h3>
          </div>
          <button
            onClick={() => handleCopy(fullDeployScript, 3)}
            className="bg-[#C9A227] hover:bg-[#b58f1f] text-black font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer select-none font-serif"
          >
            {copiedIndex === 3 ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedIndex === 3 ? 'Script Copiado!' : 'Copiar Script Bash'}</span>
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Você pode salvar esse script como <code>deploy-portal.sh</code> no seu servidor e rodar <code>bash deploy-portal.sh</code>. Ele configurará o serviço do systemd para reiniciar o site sozinho caso o servidor reinicie!
        </p>
        <pre className="bg-[#0a0a09] border border-[#2a241b] p-4 rounded-xl text-xs font-mono text-gray-300 overflow-x-auto max-h-72">
          {fullDeployScript}
        </pre>
      </div>

      {/* Direct MySQL architecture note */}
      <div className="bg-[#12110e] border border-[#8C6B1C]/40 rounded-xl p-4 text-xs text-gray-300 space-y-2">
        <div className="text-[#E0C068] font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
          Como Funciona a Conexão com o Banco de Dados (MySQL yurots_db)
        </div>
        <p className="leading-relaxed">
          O servidor web executa com <code>server.ts</code> na porta 3000. Ele conecta via socket ou TCP local em <code>127.0.0.1:3306</code> no banco <code>yurots_db</code>.
          Quando o jogador clica em <strong>"Criar Conta"</strong> ou <strong>"Criar Personagem"</strong>, a requisição é gravada instantaneamente nas tabelas <code>accounts</code> e <code>players</code> com hash SHA1.
          Assim, no mesmo segundo, o jogador já pode abrir o OTClient e digitar a conta para entrar!
        </p>
      </div>
    </div>
  );
};
