import React, { useState } from 'react';
import { useServer } from '../context/ServerContext';
import { 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  GitFork,
  ExternalLink
} from 'lucide-react';

export const ScriptGeneratorTab: React.FC = () => {
  const { serverConfig, updateServerConfig } = useServer();
  const [copied, setCopied] = useState(false);
  const [copiedOneLiner, setCopiedOneLiner] = useState(false);

  // Generate the complete All-In-One automated bash script
  const generatedBashScript = `#!/usr/bin/env bash
# ==============================================================================
# SCRIPT DE INSTALAÇÃO E ATUALIZAÇÃO AUTOMÁTICA: MARLEYOT 7.72 OLD SCHOOL
# Otimizado para Oracle Cloud Always Free (Ubuntu 22.04 LTS)
# ==============================================================================
set -e

echo "=========================================================="
echo ">> INICIANDO CONFIGURAÇÃO AUTOMÁTICA DO MARLEYOT 7.72"
echo ">> Servidor: ${serverConfig.serverName}"
echo ">> IP Configurado: ${serverConfig.serverIp}"
echo "=========================================================="

# 1. Atualizar o sistema operacional e configurar Swap
echo "[1/7] Atualizando repositorios do Ubuntu..."
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y && sudo apt-get upgrade -y

# Criar Swap de 3GB se a memoria RAM for menor que 2.5GB (essencial para VM.Standard.E2.1.Micro de 1GB)
RAM_TOTAL_MB=$(free -m | awk '/^Mem:/{print $2}')
if [ "\$RAM_TOTAL_MB" -lt 2500 ]; then
  echo ">> Detectada maquina com pouca RAM (\${RAM_TOTAL_MB}MB, ex: VM.Standard.E2.1.Micro)."
  echo ">> Criando Swap de 3GB para permitir compilacao suave do TFS sem erro de memoria..."
  if [ ! -f /swapfile ]; then
    sudo fallocate -l 3G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=3072
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo ">> Swap de 3GB ativado com sucesso!"
  else
    echo ">> Arquivo /swapfile ja existente."
  fi
fi

# 2. Instalar dependencias e compiladores C++
echo "[2/7] Instalando compiladores C++, CMake e bibliotecas necessarias..."
sudo apt-get install -y git cmake build-essential liblua5.2-dev \\
  libmysqlclient-dev libboost-all-dev libpugixml-dev libcrypto++-dev \\
  libfmt-dev iptables-persistent netfilter-persistent mariadb-server mariadb-client

# 3. Liberar portas no firewall iptables da Oracle
echo "[3/7] Liberando portas 7171, 7172 e 80 no iptables do Ubuntu..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 7171 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 7172 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT || true
sudo netfilter-persistent save || true

# 4. Configurar MariaDB / MySQL
echo "[4/7] Configurando banco de dados MariaDB..."
sudo systemctl start mariadb
sudo mysql -e "CREATE DATABASE IF NOT EXISTS ${serverConfig.mysqlDatabase} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS '${serverConfig.mysqlUser}'@'localhost' IDENTIFIED BY '${serverConfig.mysqlPass}';"
sudo mysql -e "GRANT ALL PRIVILEGES ON ${serverConfig.mysqlDatabase}.* TO '${serverConfig.mysqlUser}'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 5. Compilar TFS (Protocolo 7.72)
echo "[5/7] Compilando engine MARLEYOT 7.72..."
mkdir -p ~/otserv
cd ~/otserv

if [ -d "build" ]; then
  cd build
  cmake ..
  make -j$(nproc)
  cp -f yurOTS ~/otserv/yurOTS 2>/dev/null || cp -f tfs ~/otserv/tfs 2>/dev/null || true
  cd ~/otserv
fi

# Copiar datapack (data, mapa yurots)
if [ -d "source/data" ] && [ ! -d "data" ]; then
  cp -r source/data ~/otserv/data
fi

# 6. Importar Schema SQL inicial se ainda nao foi importado
echo "[6/7] Importando schema das tabelas (accounts, players)..."
if [ -f "source/schema.sql" ]; then
  mysql -u ${serverConfig.mysqlUser} -p'${serverConfig.mysqlPass}' ${serverConfig.mysqlDatabase} < source/schema.sql || true
fi

# Criar config.lua oficial com seu IP
echo "Gerando config.lua..."
cat > ~/otserv/config.lua << 'EOFCONFIG'
ip = "${serverConfig.serverIp}"
bindOnlyConfiguredIpAddress = false
loginPort = ${serverConfig.loginPort}
gamePort = ${serverConfig.gamePort}
statusPort = ${serverConfig.loginPort}

serverName = "${serverConfig.serverName}"
ownerName = "${serverConfig.ownerName}"
ownerEmail = "${serverConfig.ownerEmail}"
url = "http://${serverConfig.serverIp}"
location = "Brazil"
motd = "${serverConfig.motd}"
worldType = "${serverConfig.worldType}"

mapName = "${serverConfig.mapName}"
mapAuthor = "Yurez / Rodolfo Augusto"

rateExp = ${serverConfig.rateExp}
rateSkill = ${serverConfig.rateSkill}
rateLoot = ${serverConfig.rateLoot}
rateMagic = ${serverConfig.rateMagic}
rateSpawn = ${serverConfig.rateSpawn}

sqlType = "mysql"
sqlHost = "127.0.0.1"
sqlPort = 3306
sqlUser = "${serverConfig.mysqlUser}"
sqlPass = "${serverConfig.mysqlPass}"
sqlDatabase = "${serverConfig.mysqlDatabase}"
encryptionType = "sha1"

stamina = true
freePremium = false
killsToRedSkull = 5
EOFCONFIG

# 7. Criar servico systemd para auto-restart 24/7
echo "[7/7] Configurando servico systemd para auto-restart 24/7..."
CURRENT_USER=$(whoami)
sudo bash -c "cat > /etc/systemd/system/otserv.service << EOFSERVICE
[Unit]
Description=Yurots 8.0 OTServ
After=network.target mysql.service

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=/home/$CURRENT_USER/otserv
ExecStart=/home/$CURRENT_USER/otserv/tfs
Restart=always
RestartSec=3
StandardOutput=append:/home/$CURRENT_USER/otserv/server.log
StandardError=append:/home/$CURRENT_USER/otserv/server_error.log

[Install]
WantedBy=multi-user.target
EOFSERVICE"

sudo systemctl daemon-reload
sudo systemctl enable otserv
sudo systemctl restart otserv

echo "=========================================================="
echo ">> SUCESSO! SEU YUROTS 8.0 ESTA ONLINE NA ORACLE CLOUD!"
echo ">> Verifique o status com: sudo systemctl status otserv"
echo ">> Verifique os logs com: tail -f ~/otserv/server.log"
echo "=========================================================="
`;

  const copyScript = () => {
    navigator.clipboard.writeText(generatedBashScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const oneLinerCommand = `cat > ~/install-yurots.sh << 'EOF'\n${generatedBashScript}\nEOF\nbash ~/install-yurots.sh`;

  const copyOneLiner = () => {
    navigator.clipboard.writeText(oneLinerCommand);
    setCopiedOneLiner(true);
    setTimeout(() => setCopiedOneLiner(false), 2000);
  };

  const downloadScriptFile = () => {
    const blob = new Blob([generatedBashScript], { type: 'text/x-shellscript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'install-yurots-oracle.sh';
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
                <Terminal className="w-4 h-4 text-[#C9A227]" />
                Instalação Automatizada Zero-Touch
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Script Bash All-In-One para Oracle Cloud
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Não quer executar os passos manualmente? Este script instala e atualiza tudo de forma automatizada: 
              compiladores C++, pacotes, banco de dados MariaDB, compilação do <strong>MARLEYOT 7.72</strong> com múltiplos núcleos, 
              liberação das portas no iptables e criação do serviço de auto-restart 24/7!
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyScript}
              className="bg-[#1A1A1A] hover:bg-[#252525] text-gray-200 px-4 py-2.5 rounded-xl border border-[#333] transition flex items-center gap-2 text-xs font-semibold shadow"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar Script'}</span>
            </button>
            <button
              onClick={downloadScriptFile}
              className="bg-[#C9A227] hover:bg-[#b58f1f] text-[#0A0A0A] font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-xs shadow-[0_0_10px_rgba(201,162,39,0.2)]"
            >
              <Download className="w-4 h-4" />
              <span>Baixar .sh</span>
            </button>
          </div>
        </div>

        {/* Quick config settings for script */}
        <div className="mt-6 pt-4 border-t border-[#222222] grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0A0A0A] p-3.5 rounded-xl border border-[#222222] text-xs">
          <div>
            <span className="text-gray-400 block mb-1">IP do Servidor:</span>
            <input
              type="text"
              value={serverConfig.serverIp}
              onChange={(e) => updateServerConfig({ serverIp: e.target.value })}
              className="w-full bg-[#111111] border border-[#262626] rounded-lg p-1.5 text-[#C9A227] font-mono focus:outline-none focus:border-[#C9A227]"
            />
          </div>
          <div>
            <span className="text-gray-400 block mb-1">Senha do MySQL:</span>
            <input
              type="text"
              value={serverConfig.mysqlPass}
              onChange={(e) => updateServerConfig({ mysqlPass: e.target.value })}
              className="w-full bg-[#111111] border border-[#262626] rounded-lg p-1.5 text-gray-200 font-mono focus:outline-none focus:border-[#C9A227]"
            />
          </div>
          <div>
            <span className="text-gray-400 block mb-1">Taxa de EXP Inicial:</span>
            <input
              type="number"
              value={serverConfig.rateExp}
              onChange={(e) => updateServerConfig({ rateExp: Number(e.target.value) })}
              className="w-full bg-[#111111] border border-[#262626] rounded-lg p-1.5 text-gray-200 font-mono focus:outline-none focus:border-[#C9A227]"
            />
          </div>
        </div>
      </div>

      {/* 1-Step Execution Command */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
            <Play className="w-4 h-4 text-[#C9A227]" />
            <span>Como Executar na sua Máquina da Oracle (Comando Único)</span>
          </h3>
          <button
            onClick={copyOneLiner}
            className="text-xs bg-[#1A1A1A] hover:bg-[#252525] text-gray-200 px-3 py-1.5 rounded-lg border border-[#333] transition flex items-center gap-1.5"
          >
            {copiedOneLiner ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedOneLiner ? 'Copiado!' : 'Copiar Comando Completo'}</span>
          </button>
        </div>

        <p className="text-xs text-gray-300">
          Abra o terminal SSH da sua máquina Ubuntu na Oracle Cloud e simplesmente cole o comando abaixo. Ele criará o arquivo <code>install-yurots.sh</code> e executará todo o processo do zero:
        </p>

        <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222] font-mono text-xs text-[#C9A227] overflow-x-auto whitespace-pre">
          {`# Cole este comando no terminal SSH da sua máquina Oracle:
cat > ~/install-yurots.sh << 'EOF'
${generatedBashScript.slice(0, 320)}
... [O script completo será injetado]
EOF
bash ~/install-yurots.sh`}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="bg-[#0A0A0A] p-3 rounded-xl border border-[#222222]">
            <div className="text-gray-400 font-semibold mb-1">⏱️ Duração da Execução</div>
            <div className="text-gray-200">Aproximadamente 4 a 7 minutos para compilar o TFS 1.2</div>
          </div>
          <div className="bg-[#0A0A0A] p-3 rounded-xl border border-[#222222]">
            <div className="text-gray-400 font-semibold mb-1">🛡️ Reinicialização Automática</div>
            <div className="text-gray-200">O Systemd já deixará o servidor rodando em segundo plano</div>
          </div>
          <div className="bg-[#0A0A0A] p-3 rounded-xl border border-[#222222]">
            <div className="text-gray-400 font-semibold mb-1">🔍 Como Ver Logs</div>
            <div className="text-[#C9A227] font-mono">tail -f ~/otserv/server.log</div>
          </div>
        </div>
      </div>

      {/* Script Source Code View */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold font-serif text-white flex items-center justify-between">
          <span>Código Fonte Completo: install-yurots-oracle.sh</span>
          <span className="text-xs text-gray-500 font-mono">Bash / Shell Script</span>
        </h3>

        <pre className="bg-[#0A0A0A] p-4 rounded-xl border border-[#222222] text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre leading-relaxed max-h-96">
          {generatedBashScript}
        </pre>
      </div>
    </div>
  );
};
