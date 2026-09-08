#!/usr/bin/env bash
set -euo pipefail

echo "=================================================================="
echo "🦁 ATUALIZANDO CONFIGURAÇÕES E LOGIN DO MARLEYOT"
echo "=================================================================="

# Atualizar config.lua (serverName e motd)
sed -i 's/^serverName = .*/serverName = "MarleyOT"/' /home/ubuntu/otserv/config.lua
sed -i 's/^motd = .*/motd = "Bem vindo ao beta teste MarleyOT, em caso de bug envie uma mensagem pra https:\/\/discord.gg\/V4yKQRC8."/' /home/ubuntu/otserv/config.lua

# Atualizar data/creaturescripts/scripts/login.lua
cat << 'LUA_EOF' > /home/ubuntu/otserv/data/creaturescripts/scripts/login.lua
function onLogin(player)
local serverName = configManager.getString(configKeys.SERVER_NAME)
local welcomeMessage = "Bem vindo ao beta teste MarleyOT, em caso de bug envie uma mensagem pra https://discord.gg/V4yKQRC8."
player:sendTextMessage(MESSAGE_STATUS_WARNING, welcomeMessage)
player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, welcomeMessage)

if player:getLastLoginSaved() <= 0 then
player:sendOutfitWindow()
else
local lastVisitStr = string.format("Your last visit on " .. serverName .. ": %s.", os.date("%a %b %d %X %Y", player:getLastLoginSaved()))
player:sendTextMessage(MESSAGE_STATUS_DEFAULT, lastVisitStr)
end

-- Promotion
if player:getVocation():getId() ~= 0 and player:getVocation():getId() < 5 and player:getStorageValue(30018) == 1 then
player:setVocation(player:getVocation():getId() + 4)
end

if player:isPremium() then
player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "* You receiving 10% more experience.")
end

-- Outfits
if not player:isPremium() then
if player:getSex() == PLAYERSEX_FEMALE then
local outfit = player:getOutfit()
if outfit.lookType > 262 then
player:setOutfit({lookType = 259, lookHead = 78, lookBody = 106, lookLegs = 58, lookFeet = 95})
end
else
local outfit = player:getOutfit()
if outfit.lookType > 233 then
player:setOutfit({lookType = 230, lookHead = 78, lookBody = 106, lookLegs = 58, lookFeet = 95})
end
end
end

-- Premium system
if player:isPremium() then
player:setStorageValue(43434, 1)
elseif player:getStorageValue(43434) == 1 then
player:setStorageValue(43434, 0)
end

local taskStatus = player:getStorageValue(18000)
if taskStatus > 0 then
player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "* Your currently task: " .. tasks[taskStatus].name .. ".")
end

player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "* The daily monster: " .. DailyMonster .. " - Bonus ".. DailyBonus .."% of experience.")
player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "* Your current experience stage: " .. decimalPlace(Game.getExperienceStage(player:getLevel())) .. "x")
player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "* Official Discord Server: https://discord.gg/V4yKQRC8")

-- Events
player:registerEvent("DailyMonster")
player:registerEvent("PlayerDeath")
player:registerEvent("kills")
player:registerEvent("Reward")
player:registerEvent("Spell")
player:registerEvent("Task")
return true
end
LUA_EOF

echo "==> Arquivos atualizados com sucesso!"
