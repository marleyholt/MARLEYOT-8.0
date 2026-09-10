#!/bin/bash
set -e

echo "=================================================================="
echo "🪙 INSTALANDO SISTEMA MARLEY SHOP & MARLEY COINS (MARLEYOT)"
echo "=================================================================="

# 1. Encontrar o diretório do OTServ
if [ -d "/home/ubuntu/otserv/yurOTS-server-master/data/actions" ]; then
    SERVER_DIR="/home/ubuntu/otserv/yurOTS-server-master"
elif [ -d "/home/ubuntu/yurOTS-server-master/data/actions" ]; then
    SERVER_DIR="/home/ubuntu/yurOTS-server-master"
else
    SERVER_DIR=$(find /home/ubuntu -type d -name "actions" | head -n 1 | xargs dirname | xargs dirname)
fi

cd "$SERVER_DIR"
echo "-> Diretório do servidor: $(pwd)"

# 2. Parar o serviço para segurança
sudo systemctl stop otserv.service || true

# 3. Criar script Lua para o item Marley Coins (ID 6527 por exemplo, ou ajustável)
echo "-> [1/3] Criando data/actions/scripts/marley_coins.lua..."
mkdir -p data/actions/scripts
cat << 'LUAEOF' > data/actions/scripts/marley_coins.lua
-- Sistema de Marley Coins (Converte em 1 Marley Point no site) - MarleyOT
-- Ao usar o item Marley Coin (ID 6527), adiciona +1 coin na conta do jogador.

local MARLEY_COIN_ID = 6527

function onUse(player, item, fromPosition, target, toPosition, isHotkey)
    if not player or not player:isPlayer() then
        return false
    end

    local accountId = player:getAccountId()
    if not accountId or accountId <= 0 then
        player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "[Marley Shop] Erro ao identificar a conta do jogador.")
        return false
    end

    -- Adicionar 1 ponto na conta via MariaDB
    db.query("UPDATE `accounts` SET `coins` = `coins` + 1 WHERE `id` = " .. accountId .. ";")

    -- Remover o item da mochila
    item:remove(1)

    -- Efeito visual e mensagem de sucesso
    player:getPosition():sendMagicEffect(CONST_ME_MAGIC_BLUE)
    player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "[Marley Shop] Parabéns! Você utilizou 1 Marley Coin e resgatou +1 Marley Point na sua conta do portal!")
    return true
end
LUAEOF

# 4. Registrar o action no actions.xml
echo "-> [2/3] Registrando no actions.xml..."
python3 - << 'PYEOF'
xml_path = "data/actions/actions.xml"
with open(xml_path, "r", encoding="utf-8") as f:
    content = f.read()

if 'script="marley_coins.lua"' not in content:
    action_xml = '	<action itemid="6527" script="marley_coins.lua"/>\n</actions>'
    if "</actions>" in content:
        content = content.replace("</actions>", action_xml)
        with open(xml_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("   [+] Marley Coins registrado com sucesso no actions.xml!")
PYEOF

# 5. Criar tabelas necessárias no MariaDB via mysql CLI
echo "-> [3/3] Criando tabelas no banco de dados MariaDB..."
MYSQL_HOST=${MYSQL_HOST:-"localhost"}
MYSQL_USER=${MYSQL_USER:-"root"}
MYSQL_PASS=${MYSQL_PASS:-"MARLEY22@@##"}
MYSQL_DB=${MYSQL_DB:-"yurots_db"}

mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASS" "$MYSQL_DB" << 'SQLEOF'
-- Adicionar coluna de coins na tabela accounts se não existir
SET @dbname = DATABASE();
SET @tablename = "accounts";
SET @columnname = "coins";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 'Coluna coins já existe.'",
  "ALTER TABLE accounts ADD COLUMN coins INT DEFAULT 0;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Criar tabela de ofertas da loja (shop_offers)
CREATE TABLE IF NOT EXISTS shop_offers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  count INT DEFAULT 1
);

-- Criar tabela de configuração do PIX (pix_config)
CREATE TABLE IF NOT EXISTS pix_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  qr_code_url TEXT,
  pix_key TEXT
);

-- Inserir config padrão se vazia
INSERT INTO pix_config (id, qr_code_url, pix_key) 
SELECT 1, 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014br.gov.bcb.pix...', 'marleyot@empresa.com'
WHERE NOT EXISTS (SELECT * FROM pix_config WHERE id = 1);
SQLEOF

# 6. Reiniciar o serviço
sudo systemctl restart otserv.service

echo "=================================================================="
echo "✅ MARLEY SHOP E MARLEY COINS INSTALADOS COM SUCESSO!"
echo "=================================================================="
