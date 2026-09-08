#!/usr/bin/env bash
set -e

DIR="/home/ubuntu/otserv"
cd "$DIR"

echo "==> [1/4] Atualizando biblioteca JSON nativa em data/lib/json.lua..."
cat << 'FILE_EOF' > data/lib/json.lua
local json = {}

local function escape_str(s)
local in_char  = {'\\', '"', '/', '\b', '\f', '\n', '\r', '\t'}
local out_char = {'\\\\', '\\"', '\\/', '\\b', '\\f', '\\n', '\\r', '\\t'}
for i, c in ipairs(in_char) do
s = s:gsub(c, out_char[i])
end
return s
end

function json.encode(val)
local vtype = type(val)
if vtype == "nil" then
return "null"
elseif vtype == "boolean" then
return val and "true" or "false"
elseif vtype == "number" then
return tostring(val)
elseif vtype == "string" then
return '"' .. escape_str(val) .. '"'
elseif vtype == "table" then
local is_array = true
local count = 0
local max_index = 0
for k, _ in pairs(val) do
if type(k) == "number" and math.floor(k) == k and k > 0 then
if k > max_index then max_index = k end
count = count + 1
else
is_array = false
break
end
end
if is_array and count > 0 and max_index == count then
local parts = {}
for i = 1, count do
table.insert(parts, json.encode(val[i]))
end
return "[" .. table.concat(parts, ",") .. "]"
else
local parts = {}
for k, v in pairs(val) do
table.insert(parts, '"' .. escape_str(tostring(k)) .. '":' .. json.encode(v))
end
return "{" .. table.concat(parts, ",") .. "}"
end
end
return '"' .. escape_str(tostring(val)) .. '"'
end

local function skip_whitespace(str, idx)
return str:find("%S", idx) or (#str + 1)
end

local parse_value

local function parse_string(str, idx)
local j = idx + 1
local res = {}
while j <= #str do
local c = str:sub(j, j)
if c == '"' then
return table.concat(res), j + 1
elseif c == '\\' then
j = j + 1
local esc = str:sub(j, j)
if esc == '"' or esc == '\\' or esc == '/' then
table.insert(res, esc)
elseif esc == 'b' then table.insert(res, '\b')
elseif esc == 'f' then table.insert(res, '\f')
elseif esc == 'n' then table.insert(res, '\n')
elseif esc == 'r' then table.insert(res, '\r')
elseif esc == 't' then table.insert(res, '\t')
else table.insert(res, esc)
end
else
table.insert(res, c)
end
j = j + 1
end
return table.concat(res), j
end

local function parse_number(str, idx)
local num_str = str:match("^-?%d+%.?%d*[eE]?[+-]?%d*", idx)
if num_str then
return tonumber(num_str), idx + #num_str
end
return 0, idx + 1
end

local function parse_array(str, idx)
local res = {}
idx = idx + 1
while idx <= #str do
idx = skip_whitespace(str, idx)
if str:sub(idx, idx) == ']' then
return res, idx + 1
end
local val, next_idx = parse_value(str, idx)
table.insert(res, val)
idx = skip_whitespace(str, next_idx)
local c = str:sub(idx, idx)
if c == ',' then
idx = idx + 1
elseif c == ']' then
return res, idx + 1
end
end
return res, idx
end

local function parse_object(str, idx)
local res = {}
idx = idx + 1
while idx <= #str do
idx = skip_whitespace(str, idx)
if str:sub(idx, idx) == '}' then
return res, idx + 1
end
if str:sub(idx, idx) ~= '"' then
return res, idx + 1
end
local key, next_idx = parse_string(str, idx)
idx = skip_whitespace(str, next_idx)
if str:sub(idx, idx) == ':' then
idx = idx + 1
end
idx = skip_whitespace(str, idx)
local val, after_val = parse_value(str, idx)
res[key] = val
idx = skip_whitespace(str, after_val)
local c = str:sub(idx, idx)
if c == ',' then
idx = idx + 1
elseif c == '}' then
return res, idx + 1
end
end
return res, idx
end

function parse_value(str, idx)
idx = skip_whitespace(str, idx)
local c = str:sub(idx, idx)
if c == '"' then
return parse_string(str, idx)
elseif c == '{' then
return parse_object(str, idx)
elseif c == '[' then
return parse_array(str, idx)
elseif c == 't' and str:sub(idx, idx + 3) == "true" then
return true, idx + 4
elseif c == 'f' and str:sub(idx, idx + 4) == "false" then
return false, idx + 5
elseif c == 'n' and str:sub(idx, idx + 3) == "null" then
return nil, idx + 4
else
return parse_number(str, idx)
end
end

function json.decode(str)
if type(str) ~= "string" or #str == 0 then
return nil
end
local ok, val = pcall(function()
local v, _ = parse_value(str, 1)
return v
end)
return ok and val or nil
end

return json
FILE_EOF

echo "==> [2/4] Criando biblioteca de AutoLoot em data/lib/autoloot.lua..."
cat << 'FILE_EOF' > data/lib/autoloot.lua
AutoLoot = {
OPCODE = 110,
STORAGE_GOLD = 100000,
STORAGE_SLOTS = { 100001, 100002, 100003, 100004, 100005 },
SLOTS_FREE = 3,
SLOTS_PREMIUM = 5,
}

function AutoLoot.getMaxSlots(player)
return player:isPremium() and AutoLoot.SLOTS_PREMIUM or AutoLoot.SLOTS_FREE
end

function AutoLoot.onLogin(player)
local goldVal = player:getStorageValue(AutoLoot.STORAGE_GOLD)
if goldVal == -1 then
player:setAutoLootGold(true)
player:setStorageValue(AutoLoot.STORAGE_GOLD, 1)
else
player:setAutoLootGold(goldVal == 1)
end

player:clearAutoLoot()
local maxSlots = AutoLoot.getMaxSlots(player)
for i = 1, maxSlots do
local key = AutoLoot.STORAGE_SLOTS[i]
local itemId = player:getStorageValue(key)
if itemId and itemId > 0 then
player:addAutoLootItem(itemId)
end
end

AutoLoot.sendSync(player)
end

function AutoLoot.save(player)
player:setStorageValue(AutoLoot.STORAGE_GOLD, player:isAutoLootGold() and 1 or 0)
local items = player:getAutoLootItems() or {}
for i = 1, AutoLoot.SLOTS_PREMIUM do
local key = AutoLoot.STORAGE_SLOTS[i]
local id = items[i]
if id and id > 0 then
player:setStorageValue(key, id)
else
player:setStorageValue(key, 0)
end
end
end

function AutoLoot.sendSync(player)
local items = player:getAutoLootItems() or {}
local itemList = {}
for i, id in ipairs(items) do
local it = ItemType(id)
local name = (it and it:getId() > 0) and it:getName() or ("Item #" .. id)
table.insert(itemList, { id = id, name = name })
end

local payload = {
action = "sync",
gold = player:isAutoLootGold(),
maxSlots = AutoLoot.getMaxSlots(player),
isPremium = player:isPremium(),
items = itemList
}

if json and json.encode then
player:sendExtendedOpcode(AutoLoot.OPCODE, json.encode(payload))
end
end

function AutoLoot.sendError(player, msg)
if json and json.encode then
local payload = { action = "error", message = msg }
player:sendExtendedOpcode(AutoLoot.OPCODE, json.encode(payload))
end
end

function AutoLoot.addItem(player, input)
local itemId = 0
local num = tonumber(input)
if num and num > 0 then
local it = ItemType(num)
if it and it:getId() > 0 then
itemId = num
end
else
local it = ItemType(tostring(input):lower())
if it and it:getId() > 0 then
itemId = it:getId()
end
end

if itemId == 0 then
return false, "Item '" .. tostring(input) .. "' nao foi encontrado."
end

if itemId == 2148 or itemId == 2152 or itemId == 2160 then
return false, "Moedas de ouro sao gerenciadas pelo botao de Gold."
end

local items = player:getAutoLootItems() or {}
for _, id in ipairs(items) do
if id == itemId then
return false, "O item '" .. ItemType(itemId):getName() .. "' ja esta no seu AutoLoot."
end
end

local maxSlots = AutoLoot.getMaxSlots(player)
if #items >= maxSlots then
local accountType = player:isPremium() and "Premium" or "Free"
return false, "Limite de slots atingido (" .. #items .. "/" .. maxSlots .. " - " .. accountType .. ")."
end

if player:addAutoLootItem(itemId) then
AutoLoot.save(player)
AutoLoot.sendSync(player)
return true, "Item '" .. ItemType(itemId):getName() .. "' adicionado com sucesso."
end

return false, "Nao foi possivel adicionar o item."
end

function AutoLoot.removeItem(player, input)
local itemId = 0
local num = tonumber(input)
if num and num > 0 then
itemId = num
else
local it = ItemType(tostring(input):lower())
if it and it:getId() > 0 then
itemId = it:getId()
end
end

if itemId == 0 then
return false, "Item '" .. tostring(input) .. "' nao encontrado."
end

if player:removeAutoLootItem(itemId) then
AutoLoot.save(player)
AutoLoot.sendSync(player)
local it = ItemType(itemId)
local name = (it and it:getId() > 0) and it:getName() or ("#" .. itemId)
return true, "Item '" .. name .. "' removido do AutoLoot."
end

return false, "O item nao esta na sua lista de AutoLoot."
end

function AutoLoot.toggleGold(player)
local newState = not player:isAutoLootGold()
player:setAutoLootGold(newState)
AutoLoot.save(player)
AutoLoot.sendSync(player)
return newState
end

function AutoLoot.clear(player)
player:clearAutoLoot()
AutoLoot.save(player)
AutoLoot.sendSync(player)
return true
end

function AutoLoot.getFormattedList(player)
local items = player:getAutoLootItems() or {}
local maxSlots = AutoLoot.getMaxSlots(player)
local goldStatus = player:isAutoLootGold() and "Ligado" or "Desligado"
local accType = player:isPremium() and "Premium Account" or "Free Account"

local msg = "==== [ AutoLoot - MarleyOT ] ====\n"
msg = msg .. "Status do Ouro: " .. goldStatus .. "\n"
msg = msg .. "Conta: " .. accType .. " (Limite: " .. #items .. "/" .. maxSlots .. " itens)\n"
msg = msg .. "Itens cadastrados:\n"

if #items == 0 then
msg = msg .. "  (Nenhum item configurado)\n"
else
for i, id in ipairs(items) do
local it = ItemType(id)
local name = (it and it:getId() > 0) and it:getName() or ("Item #" .. id)
msg = msg .. string.format("  [%d] %s (ID: %d)\n", i, name, id)
end
end
msg = msg .. "================================"
return msg
end
FILE_EOF

echo "==> [3/4] Criando criaturascript para Extended Opcode..."
cat << 'FILE_EOF' > data/creaturescripts/scripts/extended_opcode.lua
function onExtendedOpcode(player, opcode, buffer)
if opcode ~= AutoLoot.OPCODE then
return true
end

local data = json and json.decode(buffer)
if not data then
return true
end

local action = data.action
if action == "open" or action == "sync" then
AutoLoot.sendSync(player)
elseif action == "add" then
local input = data.item or data.id
local success, msg = AutoLoot.addItem(player, input)
if not success then AutoLoot.sendError(player, msg) end
elseif action == "remove" then
local input = data.item or data.id
local success, msg = AutoLoot.removeItem(player, input)
if not success then AutoLoot.sendError(player, msg) end
elseif action == "toggle_gold" then
AutoLoot.toggleGold(player)
elseif action == "clear" then
AutoLoot.clear(player)
end

return true
end
FILE_EOF

echo "==> [4/4] Criando Talkaction !autoloot..."
cat << 'FILE_EOF' > data/talkactions/scripts/autoloot.lua
function onSay(player, words, param)
param = param:trim()

if param == "" or param == "open" or param == "gui" then
AutoLoot.sendSync(player)
local list = AutoLoot.getFormattedList(player)
player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, list)
player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "Comandos: !autoloot add, <item> | !autoloot remove, <item> | !autoloot gold | !autoloot clear")
return false
end

local split = param:splitTrimmed(",")
local cmd = split[1]:lower()

if cmd == "gold" or cmd == "ouro" then
local enabled = AutoLoot.toggleGold(player)
player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "[AutoLoot] Coleta de ouro " .. (enabled and "LIGADA" or "DESLIGADA") .. ".")
return false
elseif cmd == "clear" or cmd == "limpar" then
AutoLoot.clear(player)
player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "[AutoLoot] Lista de itens limpa com sucesso.")
return false
elseif cmd == "list" or cmd == "lista" then
player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, AutoLoot.getFormattedList(player))
return false
elseif cmd == "add" or cmd == "adicionar" then
if not split[2] or split[2] == "" then
player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "Uso correto: !autoloot add, <item>")
return false
end
local success, msg = AutoLoot.addItem(player, split[2])
player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "[AutoLoot] " .. msg)
return false
elseif cmd == "remove" or cmd == "remover" then
if not split[2] or split[2] == "" then
player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "Uso correto: !autoloot remove, <item>")
return false
end
local success, msg = AutoLoot.removeItem(player, split[2])
player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "[AutoLoot] " .. msg)
return false
end

player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "Comandos AutoLoot:\n!autoloot\n!autoloot gold\n!autoloot add, <item>\n!autoloot remove, <item>\n!autoloot clear")
return false
end
FILE_EOF

echo "✅ Scripts e bibliotecas de AutoLoot aplicados com sucesso!"
