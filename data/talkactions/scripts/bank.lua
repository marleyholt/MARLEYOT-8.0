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
