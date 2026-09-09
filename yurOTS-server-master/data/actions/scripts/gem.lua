local weaponTypes = {WEAPON_SWORD, WEAPON_CLUB, WEAPON_AXE}

local attrConfig = {maxValue = 10}
local attrs = {
	[1] = {code = ITEM_ATTRIBUTE_LIFELEECH, effect = CONST_ME_MAGIC_GREEN, name = "Life Leech"},
	[2] = {code = ITEM_ATTRIBUTE_MANALEECH, effect = CONST_ME_MAGIC_BLUE, name = "Mana Leech"},
	[3] = {code = ITEM_ATTRIBUTE_CRITICAL, effect = CONST_ME_CRITICAL_DAMAGE, name = "Critical"},
	[4] = {code = ITEM_ATTRIBUTE_ATTACK, effect = CONST_ME_DRAWBLOOD, base = true, name = "Attack"},
	[5] = {code = ITEM_ATTRIBUTE_DEFENSE, effect = CONST_ME_BLOCKHIT, base = true, name = "Defense"}
}

local gemsEeffect = {
	[5245] = {chance = 10},
	[5246] = {chance = 15},
	[5247] = {chance = 35},
	[5248] = {chance = 50},
	[5249] = {chance = 100},
	-- Support for standard Tibia gems (3036..3041)
	[3036] = {chance = 25}, -- violet gem
	[3037] = {chance = 40}, -- yellow gem
	[3038] = {chance = 60}, -- green gem
	[3039] = {chance = 80}, -- red gem
	[3041] = {chance = 100}, -- blue gem
}

-- Safe helper to read enchant count without crashing on engines without getCustomAttribute
local function getEnchantCount(item)
	if item.getCustomAttribute then
		local ok, val = pcall(function() return item:getCustomAttribute('maxattr') end)
		if ok and val and tonumber(val) then
			return tonumber(val)
		end
	end
	local desc = item:getAttribute(ITEM_ATTRIBUTE_DESCRIPTION)
	if desc and type(desc) == "string" then
		local count = desc:match("enchanted (%d+) time")
		if count then
			return tonumber(count) or 0
		end
	end
	local aid = item:getActionId()
	if aid >= 1001 and aid <= 1010 then
		return aid - 1000
	end
	return 0
end

-- Safe helper to store enchant count in description and actionId
local function setEnchantCount(item, count)
	if item.setCustomAttribute then
		pcall(function() item:setCustomAttribute('maxattr', count) end)
	end
	item:setActionId(1000 + count)
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
	if currentEnchants >= 10 then
		player:sendTextMessage(MESSAGE_INFO_DESCR, "This equipment cannot be enchanted more than 10 times.")
		return false
	end

	local gemId = item:getId()
	local currentGem = gemsEeffect[gemId] or {chance = 100}
	local successChance = math.min(100, math.max(10, currentGem.chance))

	if item:remove(1) then
		if math.random(1, 100) > successChance then
			target:getPosition():sendMagicEffect(CONST_ME_POFF)
			player:sendTextMessage(MESSAGE_STATUS_SMALL, "The gem shattered and the enchantment failed!")
			return true
		end

		local randomAttr = math.random(1, #attrs)
		local selectedAttr = attrs[randomAttr]
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

		local nextEnchantLevel = currentEnchants + 1
		local crackChance = math.min(10, nextEnchantLevel)

		if gemId ~= 5249 and math.random(1, 100) <= crackChance then
			player:say('Crack..!', TALKTYPE_MONSTER_SAY)
			target:getPosition():sendMagicEffect(CONST_ME_BLOCKHIT)
			target:remove()
			player:sendTextMessage(MESSAGE_INFO_DESCR, "The immense power broke the weapon!")
		else
			target:setAttribute(selectedAttr.code, currentAttrVal)
			setEnchantCount(target, nextEnchantLevel)
			target:getPosition():sendMagicEffect(selectedAttr.effect)
			player:sendTextMessage(MESSAGE_INFO_DESCR, string.format("Success! Your weapon was enchanted (+1 %s). Current level: %d/10.", selectedAttr.name, nextEnchantLevel))
		end
	end

	return true
end
