-- Sistema de Encantamento de Gemas Modular (YurOTS / TFS 7.72)
local gemsEffect = {
	[5245] = {chance = 20},
	[5246] = {chance = 40},
	[5247] = {chance = 60},
	[5248] = {chance = 80},
	[5249] = {chance = 100},
	[3036] = {chance = 30},
	[3037] = {chance = 50},
	[3038] = {chance = 70},
	[3039] = {chance = 90},
	[3041] = {chance = 100},
}

local CATEGORIES = {
	MELEE = 1,
	BOW = 2,
	CROSSBOW = 3,
	WAND = 4,
	DEFENSIVE = 5,
	SHIELD = 6,
	BOOTS = 7
}

local function getItemCategory(itemType)
	local wType = itemType:getWeaponType()
	
	if table.contains({WEAPON_SWORD, WEAPON_CLUB, WEAPON_AXE}, wType) then
		return CATEGORIES.MELEE, 50
	elseif wType == WEAPON_BOW then
		return CATEGORIES.BOW, 50
	elseif wType == WEAPON_CROSSBOW then
		return CATEGORIES.CROSSBOW, 50
	elseif wType == WEAPON_WAND then
		return CATEGORIES.WAND, 50
	end

	local slot = itemType:getSlotPosition()
	if bit.band(slot, SLOTP_HEAD) ~= 0 or bit.band(slot, SLOTP_ARMOR) ~= 0 or bit.band(slot, SLOTP_LEGS) ~= 0 then
		return CATEGORIES.DEFENSIVE, 10
	elseif bit.band(slot, SLOTP_SHIELD) ~= 0 or wType == WEAPON_SHIELD then
		return CATEGORIES.SHIELD, 10
	elseif bit.band(slot, SLOTP_FEET) ~= 0 then
		return CATEGORIES.BOOTS, 10
	end

	return nil, 0
end

local categoryAttrs = {
	[CATEGORIES.MELEE] = {
		{name = "Attack", key = "atk", max = 50, inc = 1, effect = CONST_ME_DRAWBLOOD},
		{name = "Defense", key = "def", max = 50, inc = 1, effect = CONST_ME_BLOCKHIT},
		{name = "Critical", key = "crit", max = 30, inc = 1, effect = CONST_ME_CRITICAL_DAMAGE},
		{name = "Life Leech", key = "lleech", max = 30, inc = 1, effect = CONST_ME_MAGIC_GREEN},
		{name = "Mana Leech", key = "mleech", max = 30, inc = 1, effect = CONST_ME_MAGIC_BLUE}
	},
	[CATEGORIES.BOW] = {
		{name = "Attack", key = "atk", max = 50, inc = 1, effect = CONST_ME_DRAWBLOOD},
		{name = "Critical", key = "crit", max = 30, inc = 1, effect = CONST_ME_CRITICAL_DAMAGE},
		{name = "Life Leech", key = "lleech", max = 30, inc = 1, effect = CONST_ME_MAGIC_GREEN},
		{name = "Mana Leech", key = "mleech", max = 30, inc = 1, effect = CONST_ME_MAGIC_BLUE}
	},
	[CATEGORIES.CROSSBOW] = {
		{name = "Attack", key = "atk", max = 50, inc = 1, effect = CONST_ME_DRAWBLOOD},
		{name = "Critical", key = "crit", max = 30, inc = 1, effect = CONST_ME_CRITICAL_DAMAGE},
		{name = "Life Leech", key = "lleech", max = 30, inc = 1, effect = CONST_ME_MAGIC_GREEN},
		{name = "Mana Leech", key = "mleech", max = 30, inc = 1, effect = CONST_ME_MAGIC_BLUE},
		{name = "Piercing", key = "pierce", max = 30, inc = 1, effect = CONST_ME_EXPLOSIONAREA}
	},
	[CATEGORIES.WAND] = {
		{name = "Magic Level", key = "ml", max = 50, inc = 1, effect = CONST_ME_MAGIC_BLUE},
		{name = "Critical", key = "crit", max = 30, inc = 1, effect = CONST_ME_CRITICAL_DAMAGE}
	},
	[CATEGORIES.DEFENSIVE] = {
		{name = "Armor", key = "armor", max = 10, inc = 1, effect = CONST_ME_BLOCKHIT},
		{name = "Dodge", key = "dodge", max = 5, inc = 1, effect = CONST_ME_STUN},
		{name = "Fire Res", key = "res_fire", max = 5, inc = 1, effect = CONST_ME_FIREAREA},
		{name = "Energy Res", key = "res_energy", max = 5, inc = 1, effect = CONST_ME_ENERGYAREA},
		{name = "Poison Res", key = "res_poison", max = 5, inc = 1, effect = CONST_ME_POISONAREA}
	},
	[CATEGORIES.SHIELD] = {
		{name = "Defense", key = "def", max = 10, inc = 1, effect = CONST_ME_BLOCKHIT},
		{name = "Absorb", key = "absorb", max = 30, inc = 1, effect = CONST_ME_MAGIC_BLUE},
		{name = "Fire Res", key = "res_fire", max = 5, inc = 1, effect = CONST_ME_FIREAREA},
		{name = "Energy Res", key = "res_energy", max = 5, inc = 1, effect = CONST_ME_ENERGYAREA},
		{name = "Poison Res", key = "res_poison", max = 5, inc = 1, effect = CONST_ME_POISONAREA}
	},
	[CATEGORIES.BOOTS] = {
		{name = "Speed", key = "speed", max = 30, inc = 3, effect = CONST_ME_STUN},
		{name = "HP Regen", key = "hpreg", max = 10, inc = 1, effect = CONST_ME_MAGIC_GREEN},
		{name = "MP Regen", key = "mpreg", max = 10, inc = 1, effect = CONST_ME_MAGIC_BLUE}
	}
}

local function parseEnchantData(item)
	local desc = item:getAttribute(ITEM_ATTRIBUTE_DESCRIPTION) or ""
	local lifo = desc:match("%[ENCH:(.-)%]")
	local count = 0
	local attrsMap = {}
	
	if lifo then
		for pair in lifo.gmatch(lifo, "[^|]+") do
			local k, v = pair:match("([^:]+):(%d+)")
			if k and v then
				attrsMap[k] = tonumber(v)
				count = count + tonumber(v)
			end
		end
	end
	return count, attrsMap, lifo or ""
end

local function saveEnchantData(item, count, attrsMap)
	local parts = {}
	for k, v in pairs(attrsMap) do
		table.insert(parts, k .. ":" .. v)
	end
	local lifoStr = table.concat(parts, "|")
	local baseDesc = item:getAttribute(ITEM_ATTRIBUTE_DESCRIPTION) or ""
	baseDesc = baseDesc:gsub("%s*%[ENCH:.-%]", "")
	
	local newDesc = baseDesc .. (lifoStr ~= "" and string.format(" [ENCH:%s]", lifoStr) or "")
	item:setAttribute(ITEM_ATTRIBUTE_DESCRIPTION, newDesc)
	item:setActionId(1000 + count)
end

function onUse(player, item, fromPosition, target, toPosition)
	if not target or not target:isItem() then
		player:sendCancelMessage("You can only use this gem on equipment.")
		return false
	end

	local itemType = ItemType(target:getId())
	local cat, maxGems = getItemCategory(itemType)
	
	if not cat then
		player:sendCancelMessage("This equipment cannot be enchanted with gems.")
		return false
	end

	local count, attrsMap, _ = parseEnchantData(target)
	if count >= maxGems then
		player:sendTextMessage(MESSAGE_INFO_DESCR, "This equipment has reached its maximum enchantment limit (" .. maxGems .. ").")
		return false
	end

	local gemConf = gemsEffect[item:getId()] or {chance = 100}
	if item:remove(1) then
		if math.random(1, 100) > gemConf.chance then
			target:getPosition():sendMagicEffect(CONST_ME_POFF)
			player:sendTextMessage(MESSAGE_STATUS_SMALL, "The gem shattered and the enchantment failed!")
			return true
		end

		local pool = categoryAttrs[cat]
		local selected = pool[math.random(1, #pool)]
		
		local currentVal = attrsMap[selected.key] or 0
		if currentVal >= selected.max then
			local available = {}
			for _, attr in ipairs(pool) do
				if (attrsMap[attr.key] or 0) < attr.max then
					table.insert(available, attr)
				end
			end
			if #available > 0 then
				selected = available[math.random(1, #available)]
				currentVal = attrsMap[selected.key] or 0
			end
		end

		if currentVal < selected.max then
			attrsMap[selected.key] = currentVal + selected.inc
			count = count + selected.inc
			saveEnchantData(target, count, attrsMap)
			target:getPosition():sendMagicEffect(selected.effect)
			player:sendTextMessage(MESSAGE_INFO_DESCR, string.format("Success! Enchanted item with +%d %s (Total: %d/%d)", selected.inc, selected.name, count, maxGems))
		else
			player:sendTextMessage(MESSAGE_INFO_DESCR, "All attributes for this item are already at maximum level.")
		end
	end
	return true
end
