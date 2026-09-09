# Diretrizes Persistentes do Projeto OTServ 7.72 (MARLEYOT / yurOTS)

## Regra Definitiva de Entrega e Execução no Servidor (Oracle Cloud / VPS)

1. **Sincronização no Repositório**:
   - Todas as modificações de arquivos C++, Lua, XML ou SQL do servidor devem ser alteradas diretamente no repositório do workspace para permitir sincronização contínua via `git pull origin main`.

2. **Formato Padrão de Comandos Terminal (Estrutura EOF)**:
   - Para toda e qualquer alteração de código ou configuração na VPS, SEMPRE fornecer os comandos prontos utilizando blocos `cat << 'EOF' > ... EOF` (ou scripts bash idempotentes).
   - O usuário deve ser capaz de copiar e colar diretamente no terminal SSH da VPS sem precisar abrir editores manuais (nano, vi, vim).

3. **Sequência Operacional Completa de Efetivação**:
   - Sempre Seguir a ordem do item 3
   - Em toda modificação, fornecer o passo a passo pós-aplicação contendo:
     - Parada segura do serviço (`systemctl stop otserv.service` ou similar).
     - Comandos de compilação C++ (`cmake ..`, `make -j$(nproc)`, cópia do binário).
     - Migrações ou atualizações de banco de dados MariaDB/MySQL quando necessário.
     - Reinício do serviço com validação de status (`systemctl restart otserv.service`, logs).
     - Comandos in-game do GM ou queries SQL para resetar ou testar a alteração no personagem sem inconsistências de cache.

3. **Ordem de entrega de informações**:
   - Contextualizar e Definir o Problema
   - Apontar Solução
   - Seguir para as sequencias de ordenamento dos itens 1 e 2
   - Quando pedir por um novo projeto, primeiro planejamos e discutimos depois executamos.

4. **Segurança**
   - Fazer backup da ultima versão estavel, para evitar erros irrecuperaveis, antes de fazer uma grande alteração relavante.


5. **EXEMPLO DE COMO UM COMANDO EOF DEVE SER ENVIADO, COM ETAPAS, BACKUP E TUDO DE UMA VEZ PARA ENVIAR UMA UNICA VEZ.**
cat << 'EOF' > /home/ubuntu/instalar_banco_talkactions.sh
#!/bin/bash
set -e

echo "=================================================================="
echo "🏦 INSTALANDO SISTEMA BANCARIO VIA TALKACTIONS (MARLEYOT)"
echo "=================================================================="

# 1. Identificar o diretório do OTServ
if [ -d "/home/ubuntu/otserv" ]; then
    SERVER_DIR="/home/ubuntu/otserv"
elif [ -d "/home/ubuntu/server772" ]; then
    SERVER_DIR="/home/ubuntu/server772"
else
    SERVER_DIR="/home/ubuntu/otserv"
fi

cd "$SERVER_DIR"

# 2. Backup de segurança de talkactions.xml
echo "-> [1/4] Criando backup de segurança..."
mkdir -p "$SERVER_DIR/backup_talkactions"
cp -f data/talkactions/talkactions.xml "$SERVER_DIR/backup_talkactions/talkactions.xml.bak" 2>/dev/null || true

# 3. Criar o script central data/talkactions/scripts/bank.lua
echo "-> [2/4] Criando data/talkactions/scripts/bank.lua..."
cat << 'LUAEOF' > data/talkactions/scripts/bank.lua
-- Sistema Bancario via TalkActions (MARLEYOT / yurOTS 7.72)
-- Baseado na classica implementacao retro com arquitetura moderna e segura (OOP TFS 1.5)

local config = {
	allowInFight = false, -- se false, proibe uso com sinal de batalha (swords)
}

local function sendHelp(player)
	local text = "=== [SISTEMA BANCARIO MARLEYOT] ===\n" ..
		"!bank -> Exibe este menu explicativo com os comandos.\n" ..
		"!balance -> Consulta o saldo bancario atual.\n" ..
		"!deposit <valor> -> Deposita a quantia de moedas da mochila no banco.\n" ..
		"!depositall -> Deposita todo o dinheiro do seu inventario.\n" ..
		"!withdraw <valor> -> Saca a quantia informada da conta para a mochila.\n" ..
		"!withdrawall -> Saca todo o dinheiro disponivel na conta bancaria.\n" ..
		"!transfer <jogador>, <valor> -> Transfere o valor para outro jogador (online ou offline).\n" ..
		"!transferall <jogador> -> Transfere todo o saldo da conta para outro jogador.\n" ..
		"==================================="

	player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, text)
	return true
end

function onSay(player, words, param)
	words = words:lower():gsub("^%s+", ""):gsub("%s+$", "")
	param = param and param:gsub("^%s+", ""):gsub("%s+$", "") or ""

	-- Checagem de condicao de combate
	if not config.allowInFight and player:getCondition(CONDITION_INFIGHT) then
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce nao pode utilizar o banco enquanto estiver com sinal de batalha.")
		return false
	end

	-- !bank (Menu Principal de Ajuda)
	if words == "!bank" or words == "/bank" then
		if param == "" or param == "help" then
			return sendHelp(player)
		end

		-- Suporte caso o jogador digite '!bank deposit 100', '!bank balance', etc.
		local subcmd, subparam = param:match("^(%S+)%s*(.-)$")
		if subcmd then
			subcmd = subcmd:lower()
			if subcmd == "balance" then
				words = "!balance"
				param = ""
			elseif subcmd == "deposit" then
				words = "!deposit"
				param = subparam
			elseif subcmd == "depositall" then
				words = "!depositall"
				param = ""
			elseif subcmd == "withdraw" then
				words = "!withdraw"
				param = subparam
			elseif subcmd == "withdrawall" then
				words = "!withdrawall"
				param = ""
			elseif subcmd == "transfer" then
				words = "!transfer"
				param = subparam
			elseif subcmd == "transferall" then
				words = "!transferall"
				param = subparam
			else
				return sendHelp(player)
			end
		end
	end

	-- 1. !balance
	if words == "!balance" or words == "/balance" then
		local balance = player:getBankBalance()
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Seu saldo bancario atual e de: " .. balance .. " gold coins.")
		return true
	end

	-- 2. !deposit <valor>
	if words == "!deposit" or words == "/deposit" then
		local amount = tonumber(param)
		if not amount or amount <= 0 or math.floor(amount) ~= amount then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Uso correto: !deposit <quantidade>. Exemplo: !deposit 1000")
			return false
		end

		local moneyInInventory = player:getMoney()
		if moneyInInventory < amount then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce nao possui " .. amount .. " gold coins no inventario. Voce tem apenas " .. moneyInInventory .. " gps.")
			return false
		end

		if player:removeMoney(amount) then
			player:setBankBalance(player:getBankBalance() + amount)
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce depositou " .. amount .. " gold coins com sucesso. Seu novo saldo bancario e: " .. player:getBankBalance() .. " gold coins.")
		else
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Ocorreu um erro ao retirar o dinheiro do seu inventario.")
		end
		return true
	end

	-- 3. !depositall
	if words == "!depositall" or words == "/depositall" then
		local moneyInInventory = player:getMoney()
		if moneyInInventory <= 0 then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce nao possui nenhum dinheiro no inventario para depositar.")
			return false
		end

		if player:removeMoney(moneyInInventory) then
			player:setBankBalance(player:getBankBalance() + moneyInInventory)
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce depositou todo o seu dinheiro (" .. moneyInInventory .. " gold coins) no banco. Seu novo saldo e: " .. player:getBankBalance() .. " gold coins.")
		else
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Ocorreu um erro ao processar o deposito total.")
		end
		return true
	end

	-- 4. !withdraw <valor>
	if words == "!withdraw" or words == "/withdraw" then
		local amount = tonumber(param)
		if not amount or amount <= 0 or math.floor(amount) ~= amount then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Uso correto: !withdraw <quantidade>. Exemplo: !withdraw 1000")
			return false
		end

		local balance = player:getBankBalance()
		if balance < amount then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Saldo insuficiente. Seu saldo bancario e de " .. balance .. " gold coins.")
			return false
		end

		player:setBankBalance(balance - amount)
		player:addMoney(amount)
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce sacou " .. amount .. " gold coins. Seu novo saldo bancario e: " .. player:getBankBalance() .. " gold coins.")
		return true
	end

	-- 5. !withdrawall
	if words == "!withdrawall" or words == "/withdrawall" then
		local balance = player:getBankBalance()
		if balance <= 0 then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce nao possui saldo bancario disponivel para sacar.")
			return false
		end

		player:setBankBalance(0)
		player:addMoney(balance)
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce sacou todo o seu saldo (" .. balance .. " gold coins). Seu saldo bancario agora e 0.")
		return true
	end

	-- 6. !transfer <jogador>, <valor>
	if words == "!transfer" or words == "/transfer" then
		local targetName, amountStr
		local commaPos = param:find(",")
		if commaPos then
			targetName = param:sub(1, commaPos - 1):match("^%s*(.-)%s*$")
			amountStr = param:sub(commaPos + 1):match("^%s*(.-)%s*$")
		else
			local parts = {}
			for word in param:gmatch("%S+") do
				table.insert(parts, word)
			end
			if #parts >= 2 then
				amountStr = parts[#parts]
				table.remove(parts, #parts)
				targetName = table.concat(parts, " ")
			end
		end

		local amount = tonumber(amountStr)
		if not targetName or targetName == "" or not amount or amount <= 0 or math.floor(amount) ~= amount then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Uso correto: !transfer <jogador>, <valor>. Exemplo: !transfer Marley, 5000")
			return false
		end

		if targetName:lower() == player:getName():lower() then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce nao pode transferir dinheiro para si mesmo.")
			return false
		end

		local balance = player:getBankBalance()
		if balance < amount then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Saldo insuficiente. Seu saldo bancario e de " .. balance .. " gold coins.")
			return false
		end

		-- Transferencia para jogador online
		local targetPlayer = Player(targetName)
		if targetPlayer then
			player:setBankBalance(balance - amount)
			targetPlayer:setBankBalance(targetPlayer:getBankBalance() + amount)

			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce transferiu " .. amount .. " gold coins para " .. targetPlayer:getName() .. ". Seu novo saldo e: " .. player:getBankBalance() .. " gold coins.")
			targetPlayer:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce recebeu uma transferencia bancaria de " .. amount .. " gold coins de " .. player:getName() .. ". Seu novo saldo e: " .. targetPlayer:getBankBalance() .. " gold coins.")
			return true
		end

		-- Transferencia para jogador offline (via MariaDB seguro)
		local escapedName = db.escapeString(targetName)
		local resultId = db.storeQuery("SELECT `id`, `name`, `balance` FROM `players` WHERE `name` = " .. escapedName .. " LIMIT 1;")
		if not resultId then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "O jogador '" .. targetName .. "' nao foi encontrado no servidor.")
			return false
		end

		local targetGuid = result.getNumber(resultId, "id")
		local realTargetName = result.getString(resultId, "name")
		result.free(resultId)

		player:setBankBalance(balance - amount)
		db.query("UPDATE `players` SET `balance` = `balance` + " .. amount .. " WHERE `id` = " .. targetGuid .. ";")

		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce transferiu " .. amount .. " gold coins para " .. realTargetName .. " (offline). Seu novo saldo e: " .. player:getBankBalance() .. " gold coins.")
		return true
	end

	-- 7. !transferall <jogador>
	if words == "!transferall" or words == "/transferall" then
		local targetName = param:match("^%s*(.-)%s*$")
		if not targetName or targetName == "" then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Uso correto: !transferall <jogador>. Exemplo: !transferall Marley")
			return false
		end

		if targetName:lower() == player:getName():lower() then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce nao pode transferir dinheiro para si mesmo.")
			return false
		end

		local balance = player:getBankBalance()
		if balance <= 0 then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce nao possui saldo bancario disponivel para transferir.")
			return false
		end

		local amount = balance

		-- Destinatario online
		local targetPlayer = Player(targetName)
		if targetPlayer then
			player:setBankBalance(0)
			targetPlayer:setBankBalance(targetPlayer:getBankBalance() + amount)

			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce transferiu todo o seu saldo (" .. amount .. " gold coins) para " .. targetPlayer:getName() .. ". Seu saldo agora e 0.")
			targetPlayer:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce recebeu uma transferencia bancaria de " .. amount .. " gold coins de " .. player:getName() .. ". Seu novo saldo e: " .. targetPlayer:getBankBalance() .. " gold coins.")
			return true
		end

		-- Destinatario offline
		local escapedName = db.escapeString(targetName)
		local resultId = db.storeQuery("SELECT `id`, `name`, `balance` FROM `players` WHERE `name` = " .. escapedName .. " LIMIT 1;")
		if not resultId then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "O jogador '" .. targetName .. "' nao foi encontrado no servidor.")
			return false
		end

		local targetGuid = result.getNumber(resultId, "id")
		local realTargetName = result.getString(resultId, "name")
		result.free(resultId)

		player:setBankBalance(0)
		db.query("UPDATE `players` SET `balance` = `balance` + " .. amount .. " WHERE `id` = " .. targetGuid .. ";")

		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce transferiu todo o seu saldo (" .. amount .. " gold coins) para " .. realTargetName .. " (offline). Seu saldo agora e 0.")
		return true
	end

	return false
end
LUAEOF

# 4. Registrar comandos em data/talkactions/talkactions.xml
echo "-> [3/4] Registrando comandos no talkactions.xml..."
python3 - << 'PYEOF'
with open("data/talkactions/talkactions.xml", "r") as f:
    content = f.read()

bank_xml = """	<!-- Bank System -->
	<talkaction words="!bank" separator=" " script="bank.lua"/>
	<talkaction words="/bank" separator=" " script="bank.lua"/>
	<talkaction words="!balance" script="bank.lua"/>
	<talkaction words="!deposit" separator=" " script="bank.lua"/>
	<talkaction words="!depositall" script="bank.lua"/>
	<talkaction words="!withdraw" separator=" " script="bank.lua"/>
	<talkaction words="!withdrawall" script="bank.lua"/>
	<talkaction words="!transfer" separator=" " script="bank.lua"/>
	<talkaction words="!transferall" separator=" " script="bank.lua"/>
"""

if 'script="bank.lua"' not in content:
    idx = content.rfind("</talkactions>")
    if idx != -1:
        content = content[:idx] + bank_xml + content[idx:]
        with open("data/talkactions/talkactions.xml", "w") as f:
            f.write(content)
        print("   [+] Comandos bancários adicionados com sucesso!")
else:
    print("   [i] Comandos bancários já estavam registrados.")
PYEOF

# 5. Reiniciar o serviço do OTServ
echo "-> [4/4] Reiniciando otserv.service..."
sudo systemctl restart otserv.service

echo "=================================================================="
echo "📊 STATUS DO SERVIÇO APÓS INSTALAÇÃO:"
echo "=================================================================="
sudo systemctl status otserv.service --no-pager -l
echo "=================================================================="
echo "✅ SISTEMA BANCÁRIO INSTALADO COM SUCESSO!"
echo "=================================================================="
EOF

chmod +x /home/ubuntu/instalar_banco_talkactions.sh
/home/ubuntu/instalar_banco_talkactions.sh

6. **EXEMPLO DE COMO FAZER ATUALIZAÇÃO DOI SITE,DEPOIS DE TER FEITO O PUSH PRO GITHUB AQUI NO GOOGLE IA STUDIO [enviar a estrutura completa]**

cat << 'EOF' > /home/ubuntu/resolver_git_e_subir.sh
#!/bin/bash
set -e

echo "=================================================================="
echo "🔧 RESOLVENDO CONFLITO DO GIT E ATUALIZANDO O PORTAL"
echo "=================================================================="

# 1. Ir para o diretório correto do projeto
if [ -d "/home/ubuntu/otserv/portal" ]; then
    cd /home/ubuntu/otserv/portal
elif [ -d "/home/ubuntu/otserv" ]; then
    cd /home/ubuntu/otserv
else
    echo "❌ Diretório do projeto não encontrado!"
    exit 1
fi

echo "-> Diretório atual: $(pwd)"

# 2. Descartar alterações locais conflitantes e puxar a versão mais recente do GitHub
echo "-> [1/4] Sincronizando com o GitHub (forçando atualização limpa)..."
git fetch origin main
git reset --hard origin/main

# 3. Instalar dependências
echo "-> [2/4] Instalando dependências..."
npm install

# 4. Compilar o projeto
echo "-> [3/4] Compilando o site (npm run build)..."
npm run build

# 5. Reiniciar o PM2
echo "-> [4/4] Reiniciando aplicação no PM2..."
pm2 restart "marleyot-portal" || pm2 start dist/server.cjs --name "marleyot-portal"
pm2 save

echo "=================================================================="
echo "📊 STATUS DO PM2:"
echo "=================================================================="
pm2 status
echo "=================================================================="
echo "✅ SITE ATUALIZADO E RODANDO COM SUCESSO!"
echo "=================================================================="
EOF

chmod +x /home/ubuntu/resolver_git_e_subir.sh
/home/ubuntu/resolver_git_e_subir.sh