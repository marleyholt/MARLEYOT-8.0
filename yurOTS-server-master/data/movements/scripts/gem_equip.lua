-- Movements para Wands (Magic Level) e Botas (Speed & Regen)
function onEquip(player, item, slot, isSpecial)
	local desc = item:getAttribute(ITEM_ATTRIBUTE_DESCRIPTION) or ""
	local lifo = desc:match("%[ENCH:(.-)%]")
	if not lifo then return true end

	local mlBonus = 0
	local speedBonus = 0
	local hpRegen = 0
	local mpRegen = 0

	for pair in lifo.gmatch(lifo, "[^|]+") do
		local k, v = pair:match("([^:]+):(%d+)")
		if k and v then
			local val = tonumber(v) or 0
			if k == "ml" then mlBonus = mlBonus + val
			elseif k == "speed" then speedBonus = speedBonus + val
			elseif k == "hpreg" then hpRegen = hpRegen + val
			elseif k == "mpreg" then mpRegen = mpRegen + val
			end
		end
	end

	if mlBonus > 0 then
		local condition = Condition(CONDITION_ATTRIBUTES)
		condition:setParameter(CONDITION_PARAM_TICKS, -1)
		condition:setParameter(CONDITION_PARAM_STAT_MAGICPOINTS, mlBonus)
		condition:setSubId(100 + slot)
		player:addCondition(condition)
	end

	if speedBonus > 0 then
		local condition = Condition(CONDITION_HASTE)
		condition:setParameter(CONDITION_PARAM_TICKS, -1)
		condition:setParameter(CONDITION_PARAM_SPEED, speedBonus * 2)
		condition:setSubId(200 + slot)
		player:addCondition(condition)
	end

	if hpRegen > 0 or mpRegen > 0 then
		local condition = Condition(CONDITION_REGENERATION)
		condition:setParameter(CONDITION_PARAM_TICKS, -1)
		if hpRegen > 0 then condition:setParameter(CONDITION_PARAM_HEALTHGAIN, hpRegen) end
		if mpRegen > 0 then condition:setParameter(CONDITION_PARAM_MANAGAIN, mpRegen) end
		condition:setSubId(300 + slot)
		player:addCondition(condition)
	end

	return true
end

function onDeEquip(player, item, slot, isSpecial)
	player:removeCondition(CONDITION_ATTRIBUTES, CONDITIONID_COMBAT, 100 + slot)
	player:removeCondition(CONDITION_HASTE, CONDITIONID_COMBAT, 200 + slot)
	player:removeCondition(CONDITION_REGENERATION, CONDITIONID_COMBAT, 300 + slot)
	return true
end
