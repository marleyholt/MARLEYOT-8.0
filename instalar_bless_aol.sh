#!/bin/bash
set -e

echo "=================================================================="
echo "🛡️ INSTALANDO SISTEMA DE BLESS E AOL (!bless / !aol) - MARLEYOT"
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

# 3. Criar o script data/talkactions/scripts/bless.lua
echo "-> [2/5] Criando data/talkactions/scripts/bless.lua..."
mkdir -p data/talkactions/scripts
cat << 'LUAEOF' > data/talkactions/scripts/bless.lua
-- Sistema de Comprar Todas as Bênçãos (!bless / !buybless) - MarleyOT / YurOTS 7.72

local config = {
	price = 50000, -- Preço total para comprar todas as 5 bênçãos (50.000 gold coins)
	maxBlessings = 5
}

function onSay(player, words, param)
	-- Verificar se o jogador já possui todas as bênçãos
	local hasAll = true
	for i = 1, config.maxBlessings do
		if not player:hasBlessing(i) then
			hasAll = false
			break
		end
	end

	if hasAll then
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Você já possui todas as 5 bênçãos ativas.")
		player:getPosition():sendMagicEffect(CONST_ME_POFF)
		return false
	end

	if player:removeMoney(config.price) then
		for i = 1, config.maxBlessings do
			if not player:hasBlessing(i) then
				player:addBlessing(i)
			end
		end
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Parabéns! Você adquiriu todas as 5 bênçãos por " .. config.price .. " gold coins.")
		player:getPosition():sendMagicEffect(CONST_ME_MAGIC_BLUE)
	else
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Você não tem dinheiro suficiente. O custo total para todas as bênçãos é de " .. config.price .. " gold coins.")
		player:getPosition():sendMagicEffect(CONST_ME_POFF)
	end
	return false
end
LUAEOF

# 4. Criar o script data/talkactions/scripts/aol.lua
echo "-> [3/5] Criando data/talkactions/scripts/aol.lua..."
cat << 'LUAEOF' > data/talkactions/scripts/aol.lua
-- Sistema de Comprar 1 Amulet of Loss (!aol) - MarleyOT / YurOTS 7.72

local config = {
	price = 10000, -- Preço de 1 Amulet of Loss (10.000 gold coins)
	itemId = 2173  -- ID do Amulet of Loss
}

function onSay(player, words, param)
	if player:removeMoney(config.price) then
		local item = player:addItem(config.itemId, 1)
		if item then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Você comprou 1 Amulet of Loss por " .. config.price .. " gold coins.")
			player:getPosition():sendMagicEffect(CONST_ME_MAGIC_BLUE)
		else
			-- Devolver o dinheiro se a mochila estiver cheia
			player:addMoney(config.price)
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Sua mochila está cheia! Esvazie espaço para comprar o Amulet of Loss.")
			player:getPosition():sendMagicEffect(CONST_ME_POFF)
		end
	else
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Você não tem dinheiro suficiente. Um Amulet of Loss custa " .. config.price .. " gold coins.")
		player:getPosition():sendMagicEffect(CONST_ME_POFF)
	end
	return false
end
LUAEOF

# 5. Registrar comandos em data/talkactions/talkactions.xml
echo "-> [4/5] Registrando comandos no talkactions.xml..."
python3 - << 'PYEOF'
with open("data/talkactions/talkactions.xml", "r") as f:
    content = f.read()

bless_xml = """	<!-- Bless & AOL Systems -->
	<talkaction words="!bless" script="bless.lua"/>
	<talkaction words="!buybless" script="bless.lua"/>
	<talkaction words="!aol" script="aol.lua"/>
"""

if 'script="bless.lua"' not in content:
    idx = content.rfind("</talkactions>")
    if idx != -1:
        content = content[:idx] + bless_xml + content[idx:]
        with open("data/talkactions/talkactions.xml", "w") as f:
            f.write(content)
        print("   [+] Comandos Bless e AOL adicionados com sucesso!")
else:
    print("   [i] Comandos Bless e AOL já estavam registrados.")
PYEOF

# 6. Reiniciar o serviço do OTServ
echo "-> [5/5] Reiniciando otserv.service..."
sudo systemctl restart otserv.service

echo "=================================================================="
echo "📊 STATUS DO SERVIÇO APÓS A INSTALAÇÃO:"
echo "=================================================================="
sudo systemctl status otserv.service --no-pager -l
echo "=================================================================="
echo "✅ SISTEMA DE BLESS E AOL INSTALADO COM SUCESSO!"
echo "   - Para comprar todas as 5 bênçãos: digite !bless ou !buybless (50.000 gps)"
echo "   - Para comprar 1 Amulet of Loss: digite !aol (10.000 gps)"
echo "=================================================================="
