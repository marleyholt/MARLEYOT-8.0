local weaponTypes = {WEAPON_SWORD, WEAPON_CLUB, WEAPON_AXE}

local MAX_ENCHANTS = 100
local MAX_PERCENT_ATTR = 50 -- Limite de 50% para Life Leech, Mana Leech e Critical

local gemsEffect = {
[5245] = {chance = 10},
[5246] = {chance = 15},
[5247] = {chance = 35},
[5248] = {chance = 50},
[5249] = {chance = 100},
-- Gemas clássicas do Tibia
[3036] = {chance = 25}, -- violet gem
[3037] = {chance = 40}, -- yellow gem
[3038] = {chance = 60}, -- green gem
[3039] = {chance = 80}, -- red gem
[3041] = {chance = 100}, -- blue gem
}

local function getEnchantCount(item)
local desc = item:getAttribute(ITEM_ATTRIBUTE_DESCRIPTION)
if desc and type(desc) == "string" then
local count = desc:match("enchanted (%d+) time")
if count then
return tonumber(count) or 0
end
end
return 0
end

local function setEnchantCount(item, count)
item:setAttribute(ITEM_ATTRIBUTE_DESCRIPTION, string.format("This equipment was enchanted %d time%s.", count, count == 1 and "" or "s"))
end

function onUse(player, item, fromPosition, target, toPosition)
if not target or type(target) ~= "userdata" or not target.isItem or not target:isItem() then
player:sendCancelMessage("You can only use this gem on weapons.")
return false
end

local itemTarget = target:getId()
local itemtype = ItemType(itemTarget)
local weapontype = itemtype:getWeaponType()

if not table.contains(weaponTypes, weapontype) then
player:sendCancelMessage("You can only enchant weapons (swords, clubs, or axes).")
return false
end

local currentEnchants = getEnchantCount(target)
if currentEnchants >= MAX_ENCHANTS then
player:sendTextMessage(MESSAGE_INFO_DESCR, string.format("This equipment has reached the maximum of %d enchantments.", MAX_ENCHANTS))
return false
end

-- Verificar valores atuais de Life, Mana e Critical
local currentLife = target:getAttribute(ITEM_ATTRIBUTE_LIFELEECH) or 0
local currentMana = target:getAttribute(ITEM_ATTRIBUTE_MANALEECH) or 0
local currentCrit = target:getAttribute(ITEM_ATTRIBUTE_CRITICAL) or 0

-- Montar lista de atributos elegíveis para sorteio
local availableAttrs = {}

if currentLife < MAX_PERCENT_ATTR then
table.insert(availableAttrs, {code = ITEM_ATTRIBUTE_LIFELEECH, effect = CONST_ME_MAGIC_GREEN, name = "Life Leech", isPercent = true})
end
if currentMana < MAX_PERCENT_ATTR then
table.insert(availableAttrs, {code = ITEM_ATTRIBUTE_MANALEECH, effect = CONST_ME_MAGIC_BLUE, name = "Mana Leech", isPercent = true})
end
if currentCrit < MAX_PERCENT_ATTR then
table.insert(availableAttrs, {code = ITEM_ATTRIBUTE_CRITICAL, effect = CONST_ME_CRITICAL_DAMAGE, name = "Critical", isPercent = true})
end

-- Attack e Defense são INFINITOS (sempre disponíveis)
table.insert(availableAttrs, {code = ITEM_ATTRIBUTE_ATTACK, effect = CONST_ME_DRAWBLOOD, name = "Attack", base = true})
table.insert(availableAttrs, {code = ITEM_ATTRIBUTE_DEFENSE, effect = CONST_ME_BLOCKHIT, name = "Defense", base = true})

local gemId = item:getId()
local currentGem = gemsEffect[gemId] or {chance = 100}
local successChance = math.min(100, math.max(10, currentGem.chance))

if item:remove(1) then
if math.random(1, 100) > successChance then
target:getPosition():sendMagicEffect(CONST_ME_POFF)
player:sendTextMessage(MESSAGE_STATUS_SMALL, "The gem shattered and the enchantment failed!")
return true
end

-- Sorteia entre os atributos disponíveis
local selectedAttr = availableAttrs[math.random(1, #availableAttrs)]
local currentAttrVal = target:getAttribute(selectedAttr.code)

if currentAttrVal == nil or currentAttrVal == 0 then
if selectedAttr.base then
if selectedAttr.code == ITEM_ATTRIBUTE_ATTACK then
currentAttrVal = itemtype:getAttack() + 1
elseif selectedAttr.code == ITEM_ATTRIBUTE_DEFENSE then
currentAttrVal = itemtype:getDefense() + 1
else
currentAttrVal = 1
end
else
currentAttrVal = 1
end
else
currentAttrVal = currentAttrVal + 1
end

-- Chance de quebrar a arma reduzida/segura em gemas 100%
local nextEnchantLevel = currentEnchants + 1
local crackChance = math.min(5, math.floor(nextEnchantLevel / 10))

if gemId ~= 5249 and gemId ~= 3041 and math.random(1, 100) <= crackChance then
player:say('Crack..!', TALKTYPE_MONSTER_SAY)
target:getPosition():sendMagicEffect(CONST_ME_BLOCKHIT)
target:remove()
player:sendTextMessage(MESSAGE_INFO_DESCR, "The immense power broke the weapon!")
else
target:setAttribute(selectedAttr.code, currentAttrVal)
setEnchantCount(target, nextEnchantLevel)
target:getPosition():sendMagicEffect(selectedAttr.effect)

local extraMsg = selectedAttr.isPercent and string.format(" (+1%% %s, total: %d%%)", selectedAttr.name, currentAttrVal) or string.format(" (+1 %s, total: %d)", selectedAttr.name, currentAttrVal)
player:sendTextMessage(MESSAGE_INFO_DESCR, string.format("Success! Your weapon was enchanted%s. Total enchants: %d/%d.", extraMsg, nextEnchantLevel, MAX_ENCHANTS))
end
end

return true
end
