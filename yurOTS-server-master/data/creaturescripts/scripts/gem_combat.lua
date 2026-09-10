-- Sistema de Combate e Atributos de Gemas (onStatsChange)
local function getEquippedAttributes(player)
	local totalDodge = 0
	local totalAbsorb = 0
	local totalFireRes = 0
	local totalEnergyRes = 0
	local totalPoisonRes = 0
	local totalArmorBonus = 0
	local totalCrit = 0
	local totalLeech = 0
	local totalPierce = 0

	local slots = {CONST_SLOT_HEAD, CONST_SLOT_ARMOR, CONST_SLOT_LEGS, CONST_SLOT_FEET, CONST_SLOT_LEFT, CONST_SLOT_RIGHT}
	for _, slot in ipairs(slots) do
		local item = player:getSlotItem(slot)
		if item then
			local desc = item:getAttribute(ITEM_ATTRIBUTE_DESCRIPTION) or ""
			local lifo = desc:match("%[ENCH:(.-)%]")
			if lifo then
				for pair in lifo.gmatch(lifo, "[^|]+") do
					local k, v = pair:match("([^:]+):(%d+)")
					if k and v then
						local val = tonumber(v) or 0
						if k == "dodge" then totalDodge = totalDodge + val
						elseif k == "absorb" then totalAbsorb = totalAbsorb + val
						elseif k == "res_fire" then totalFireRes = totalFireRes + val
						elseif k == "res_energy" then totalEnergyRes = totalEnergyRes + val
						elseif k == "res_poison" then totalPoisonRes = totalPoisonRes + val
						elseif k == "armor" then totalArmorBonus = totalArmorBonus + val
						elseif k == "crit" then totalCrit = math.max(totalCrit, val)
						elseif k == "lleech" or k == "mleech" then totalLeech = math.max(totalLeech, val)
						elseif k == "pierce" then totalPierce = math.max(totalPierce, val)
						end
					end
				end
			end
		end
	end

	return {
		dodge = math.min(15, totalDodge),
		absorb = math.min(30, totalAbsorb),
		fireRes = math.min(20, totalFireRes),
		energyRes = math.min(20, totalEnergyRes),
		poisonRes = math.min(20, totalPoisonRes),
		crit = totalCrit,
		leech = totalLeech,
		pierce = totalPierce
	}
end

function onStatsChange(creature, attacker, type, combatType, value)
	if not creature or not creature:isPlayer() then
		return true
	end

	local player = creature:asPlayer()
	local attrs = getEquippedAttributes(player)

	if type == STATSCHANGE_HEALTHGAIN or type == STATSCHANGE_HPGAIN or type > 0 then
		if attrs.dodge > 0 and math.random(1, 100) <= attrs.dodge then
			creature:getPosition():sendMagicEffect(CONST_ME_POFF)
			creature:say("DODGE!", TALKTYPE_MONSTER_SAY)
			return false
		end

		if combatType == COMBAT_FIREDAMAGE and attrs.fireRes > 0 then
			value = math.floor(value * (1 - attrs.fireRes / 100))
		elseif combatType == COMBAT_ENERGYDAMAGE and attrs.energyRes > 0 then
			value = math.floor(value * (1 - attrs.energyRes / 100))
		elseif combatType == COMBAT_POISONDAMAGE and attrs.poisonRes > 0 then
			value = math.floor(value * (1 - attrs.poisonRes / 100))
		elseif combatType == COMBAT_PHYSICALDAMAGE and attrs.absorb > 0 then
			value = math.floor(value * (1 - attrs.absorb / 100))
		end
	end

	if attacker and attacker:isPlayer() and combatType == COMBAT_PHYSICALDAMAGE then
		local atkAttrs = getEquippedAttributes(attacker:asPlayer())
		if atkAttrs.crit > 0 and math.random(1, 100) <= 10 then
			value = math.floor(value * (1 + (atkAttrs.crit / 100)))
			attacker:getPosition():sendMagicEffect(CONST_ME_CRITICAL_DAMAGE)
		end
		if atkAttrs.leech > 0 and math.random(1, 100) <= 10 then
			local healed = math.floor(value * (atkAttrs.leech / 100))
			attacker:addHealth(healed)
			attacker:getPosition():sendMagicEffect(CONST_ME_MAGIC_GREEN)
		end
	end

	return value
end
