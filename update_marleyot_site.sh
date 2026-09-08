#!/usr/bin/env bash
set -e

echo "=================================================================="
echo "🦁 ATUALIZANDO MARLEYOT (VARIATION 6) EM https://marleyot.duckdns.org"
echo "=================================================================="

# 1. Garantir que estamos no diretório correto
CURRENT_DIR="$(pwd)"
echo "==> Diretório de trabalho: ${CURRENT_DIR}"

# 2. Atualizar código do repositório via Git (testando master ou main)
echo "==> Puxando atualizações do repositório..."
git pull origin master 2>/dev/null || git pull origin main 2>/dev/null || git pull

# 3. Compilar a nova versão do site (Variation 6)
echo "==> Instalando dependências e gerando novo build de produção..."
npm install --prefer-offline || npm install
npm run build

# 4. Localizar como o Node está rodando na porta 3000 e reiniciar
echo "==> Reiniciando o processo do site na porta 3000..."

# Se estiver rodando via PM2
if command -v pm2 >/dev/null 2>&1 && pm2 list | grep -qE "marley|web|server|portal"; then
    echo "-> Detectado PM2. Reiniciando processo..."
    pm2 restart all || pm2 restart 0
# Se estiver rodando via Systemd
elif systemctl is-active --quiet marleyot-web.service 2>/dev/null; then
    echo "-> Detectado marleyot-web.service. Reiniciando..."
    sudo systemctl restart marleyot-web.service
elif systemctl is-active --quiet otserv-web.service 2>/dev/null; then
    echo "-> Detectado otserv-web.service. Reiniciando..."
    sudo systemctl restart otserv-web.service
else
    echo "-> Reiniciando processo Node na porta 3000 via Systemd dedicado..."
    
    # Matar processo antigo avulso na porta 3000 se houver
    sudo fuser -k 3000/tcp 2>/dev/null || true
    sleep 1

    # Criar e fixar o servico permanente marleyot-web
    sudo tee /etc/systemd/system/marleyot-web.service > /dev/null << SYSTEMD_CONF
[Unit]
Description=MARLEYOT Web Portal 7.72
After=network.target mariadb.service

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=${CURRENT_DIR}
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=$(which node) ${CURRENT_DIR}/dist/server.cjs
Restart=always
RestartSec=3
StandardOutput=append:${CURRENT_DIR}/web_portal.log
StandardError=append:${CURRENT_DIR}/web_portal_error.log

[Install]
WantedBy=multi-user.target
SYSTEMD_CONF

    sudo systemctl daemon-reload
    sudo systemctl enable marleyot-web.service
    sudo systemctl restart marleyot-web.service
fi

sleep 2

echo "=================================================================="
echo "✅ NOVO BUILD ATIVADO COM SUCESSO!"
echo "=================================================================="
echo "-> Validando resposta local:"
curl -I http://localhost:3000/

echo ""
echo "-> Acesse agora no navegador para ver o novo visual (Variation 6):"
echo "👉 https://marleyot.duckdns.org"
