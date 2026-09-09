#!/usr/bin/env bash
# ==============================================================================
# MARLEYOT 7.72 - Script de Deploy Contínuo do Web Portal (AAC + API)
# ==============================================================================
set -euo pipefail

WEB_DIR="${WEB_DIR:-/home/ubuntu/server772}"
NODE_PORT="${NODE_PORT:-3000}"
SERVICE_NAME="marleyot-web"

echo "=================================================================="
echo "🚀 [MARLEYOT] Iniciando Deploy do Web Portal 7.72 (Variation 6)"
echo "Diretório alvo: ${WEB_DIR}"
echo "=================================================================="

# 1. Verificar se Node.js e npm estão instalados
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    echo "==> Instalando Node.js v20 LTS e build tools..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs build-essential
fi

echo "==> Versões instaladas:"
node -v
npm -v

# 2. Navegar até o diretório do projeto
cd "${WEB_DIR}"

# 3. Criar ou validar arquivo .env de produção local
if [ ! -f .env ]; then
    echo "==> Criando arquivo .env padrão para conexão local ao MariaDB..."
    cat << 'EOF' > .env
PORT=3000
NODE_ENV=production
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=yurots_user
MYSQL_PASSWORD=MARLEY22@@##
MYSQL_DATABASE=yurots_db
EOF
fi

# 4. Parar temporariamente o serviço web se estiver rodando
if systemctl is-active --quiet "${SERVICE_NAME}.service"; then
    echo "==> Parando ${SERVICE_NAME}.service para atualização de build..."
    sudo systemctl stop "${SERVICE_NAME}.service"
fi

# 5. Instalar dependências npm e compilar o portal (Vite + esbuild)
echo "==> Instalando dependências e compilando aplicação..."
npm install --no-audit --prefer-offline || npm install
npm run build

# 6. Criar / Atualizar a unidade systemd para marleyot-web
echo "==> Configurando unidade systemd em /etc/systemd/system/${SERVICE_NAME}.service..."
sudo tee "/etc/systemd/system/${SERVICE_NAME}.service" > /dev/null << EOF
[Unit]
Description=MARLEYOT 7.72 Web Portal & AAC (Node.js/Express)
After=network.target mariadb.service
Requires=mariadb.service

[Service]
Type=simple
User=$(whoami)
Group=$(whoami)
WorkingDirectory=${WEB_DIR}
Environment=NODE_ENV=production
Environment=PORT=${NODE_PORT}
ExecStart=$(which node) ${WEB_DIR}/dist/server.cjs
Restart=always
RestartSec=3
StandardOutput=append:${WEB_DIR}/web_portal.log
StandardError=append:${WEB_DIR}/web_portal_error.log
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

# 7. Recarregar daemons do systemd e iniciar o serviço
echo "==> Recarregando systemd e iniciando ${SERVICE_NAME}.service..."
sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}.service"
sudo systemctl restart "${SERVICE_NAME}.service"

# 8. Liberar portas no Firewall da Oracle Cloud (porta 80 HTTP e 3000 Web)
echo "==> Liberando portas 80 e ${NODE_PORT} no firewall Linux (iptables)..."
if command -v iptables >/dev/null 2>&1; then
    sudo iptables -C INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
    sudo iptables -C INPUT -p tcp --dport "${NODE_PORT}" -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport "${NODE_PORT}" -j ACCEPT
    if command -v netfilter-persistent >/dev/null 2>&1; then
        sudo netfilter-persistent save || true
    fi
fi

# 9. Configurar Proxy Reverso no Nginx para acesso na porta 80 padrão
if command -v nginx >/dev/null 2>&1; then
    echo "==> Configurando Nginx para redirecionar porta 80 -> porta ${NODE_PORT}..."
    sudo tee /etc/nginx/sites-available/marleyot-web > /dev/null << 'EOF_NGINX'
server {
    listen 80;
    server_name _;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF_NGINX
    sudo ln -sf /etc/nginx/sites-available/marleyot-web /etc/nginx/sites-enabled/marleyot-web
    sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    sudo nginx -t && sudo systemctl reload nginx || true
fi

# 10. Validação de Saúde
sleep 2
echo "==> Validando status do serviço:"
sudo systemctl status "${SERVICE_NAME}.service" --no-pager

echo ""
echo "==> Teste de requisição local:"
curl -s http://localhost:${NODE_PORT}/api/health || echo "Serviço inicializando..."

echo ""
echo "=================================================================="
echo "✅ [SUCESSO] Web Portal MARLEYOT 7.72 publicado e ativo!"
echo "Acesse via navegador em: http://137.131.196.66/ (ou :3000)"
echo "=================================================================="
