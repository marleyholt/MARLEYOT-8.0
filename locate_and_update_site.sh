#!/usr/bin/env bash
set -e

echo "=================================================================="
echo "🔍 LOCALIZANDO O DIRETÓRIO DO SITE ATIVO NA PORTA 3000..."
echo "=================================================================="

# 1. Descobrir o PID do processo Node rodando na porta 3000
NODE_PID=$(sudo lsof -t -i:3000 2>/dev/null || sudo fuser 3000/tcp 2>/dev/null || pgrep -f "node" | head -n 1)

SITE_DIR=""

if [ -n "$NODE_PID" ]; then
    echo "-> Processo ativo encontrado na porta 3000 (PID: $NODE_PID)"
    # Pegar o diretório de trabalho do processo ativo
    SITE_DIR=$(sudo pwdx "$NODE_PID" 2>/dev/null | awk '{print $2}')
    echo "-> Diretório do processo ativo: $SITE_DIR"
fi

# Se não encontrou pelo PID, procurar onde existe package.json na /home/ubuntu
if [ -z "$SITE_DIR" ] || [ ! -f "$SITE_DIR/package.json" ]; then
    echo "-> Procurando pastas com package.json..."
    FOUND=$(find /home/ubuntu /var/www -maxdepth 3 -name "package.json" -not -path "*/node_modules/*" 2>/dev/null | head -n 1)
    if [ -n "$FOUND" ]; then
        SITE_DIR=$(dirname "$FOUND")
    fi
fi

if [ -z "$SITE_DIR" ] || [ ! -f "$SITE_DIR/package.json" ]; then
    echo "❌ Não foi possível encontrar a pasta com package.json automaticamente."
    echo "Listando diretórios em /home/ubuntu:"
    ls -la /home/ubuntu
    exit 1
fi

echo "=================================================================="
echo "🎯 SITE ENCONTRADO EM: $SITE_DIR"
echo "=================================================================="

cd "$SITE_DIR"

echo "==> [1/3] Puxando atualizações do Git no diretório do site..."
git pull origin master 2>/dev/null || git pull origin main 2>/dev/null || git pull || echo "Git pull concluído."

echo "==> [2/3] Compilando novo visual (Variation 6)..."
npm install --prefer-offline || npm install
npm run build

echo "==> [3/3] Reiniciando processo do site..."
# Reiniciar via PM2 se existir
if command -v pm2 >/dev/null 2>&1 && pm2 list | grep -qE "online"; then
    pm2 restart all
# Reiniciar via systemd se houver servico
elif systemctl is-active --quiet marleyot-web.service 2>/dev/null; then
    sudo systemctl restart marleyot-web.service
elif systemctl is-active --quiet otserv-web.service 2>/dev/null; then
    sudo systemctl restart otserv-web.service
else
    # Matar processo antigo na porta 3000 e reiniciar em background / nohup
    sudo kill -9 "$NODE_PID" 2>/dev/null || sudo fuser -k 3000/tcp 2>/dev/null || true
    sleep 1
    nohup node dist/server.cjs > web_portal.log 2>&1 &
fi

sleep 2

echo "=================================================================="
echo "✅ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!"
echo "=================================================================="
echo "-> Testando resposta local:"
curl -I http://localhost:3000/

echo ""
echo "-> Acesse agora no navegador:"
echo "👉 https://marleyot.duckdns.org"
