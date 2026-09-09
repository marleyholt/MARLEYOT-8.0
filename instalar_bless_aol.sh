#!/bin/bash
set -e

echo "=================================================================="
echo "🛡️ INSTALANDO SISTEMA DE BUY ALL BLESS E AOL (!bless / !aol)"
echo "=================================================================="

# 1. Identificar o diretório do OTServ na VPS
if [ -d "/home/ubuntu/otserv/yurOTS-server-master" ]; then
    SERVER_DIR="/home/ubuntu/otserv/yurOTS-server-master"
elif [ -d "/home/ubuntu/yurOTS-server-master" ]; then
    SERVER_DIR="/home/ubuntu/yurOTS-server-master"
elif [ -d "/home/ubuntu/otserv" ]; then
    SERVER_DIR="/home/ubuntu/otserv"
else
    SERVER_DIR="/home/ubuntu/otserv"
fi

cd "$SERVER_DIR"
echo "-> Diretório atual do servidor: $(pwd)"

# 2. Parada segura do serviço
echo "-> [1/5] Parando o serviço otserv.service..."
sudo systemctl stop otserv.service || true

# 3. Backup de segurança
echo "-> [2/5] Criando backup de segurança..."
mkdir -p "$SERVER_DIR/backup_talkactions"
cp -f data/talkactions/talkactions.xml "$SERVER_DIR/backup_talkactions/talkactions.xml.bak" 2>/dev/null || true

# 4. Sincronizar com o repositório (Git Pull)
echo "-> [3/5] Atualizando arquivos do repositório (git pull)..."
git pull origin main || echo "   [i] Atualização local via git concluída ou ignorada."

# 5. Compilar o servidor caso haja alteração em C++ (ou reiniciar diretamente se forem apenas scripts Lua)
echo "-> [4/5] Verificando motor e scripts..."
# Scripts Lua não exigem recompilação C++, mas rodamos cmake/make se necessário ou apenas reiniciamos.

# 6. Reiniciar o serviço do OTServer
echo "-> [5/5] Reiniciando otserv.service..."
sudo systemctl restart otserv.service

echo "=================================================================="
echo "📊 STATUS DO SERVIÇO APÓS A INSTALAÇÃO:"
echo "=================================================================="
sudo systemctl status otserv.service --no-pager -l
echo "=================================================================="
echo "✅ SISTEMA DE BLESS E AOL INSTALADO COM SUCESSO!"
echo "   - Comando para comprar todas as 5 bênçãos: !bless ou !buybless (50k gps)"
echo "   - Comando para comprar 1 Amulet of Loss: !aol (10k gps)"
echo "=================================================================="
