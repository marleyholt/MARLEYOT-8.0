-- Gema de Reversão / Talon (ID 3034) - LIFO System (YurOTS / TFS 7.72)
function onUse(player, item, fromPosition, target, toPosition)
	if not target or not target:isItem() then
		player:sendCancelMessage("You can only use this on enchanted equipment.")
		return false
	end

	local desc = target:getAttribute(ITEM_ATTRIBUTE_DESCRIPTION) or ""
	local lifo = desc:match("%[ENCH:(.-)%]")
	if not lifo or lifo == "" then
		player:sendCancelMessage("This item has no enchantments to revert.")
		return false
	end

	local list = {}
	for pair in lifo.gmatch(lifo, "[^|]+") do
		local k, valStr = pair:match("([^:]+):(%d+)")
		if k and valStr then
			table.insert(list, {key = k, val = tonumber(valStr)})
		end
	end

	if #list == 0 then
		player:sendCancelMessage("No enchantments to revert.")
		return false
	end

	local removed = table.remove(list)
	
	local newParts = {}
	local totalGems = 0
	for _, p in ipairs(list) do
		table.insert(newParts, p.key .. ":" .. p.val)
		totalGems = totalGems + p.val
	end

	local baseDesc = desc:gsub("%s*%[ENCH:.-%]", "")
	if #newParts > 0 then
		baseDesc = baseDesc .. string.format(" [ENCH:%s]", table.concat(newParts, "|"))
	end

	if item:remove(1) then
		target:setAttribute(ITEM_ATTRIBUTE_DESCRIPTION, baseDesc)
		target:setActionId(1000 + math.max(0, totalGems))
		target:getPosition():sendMagicEffect(CONST_ME_MAGIC_RED)
		player:sendTextMessage(MESSAGE_INFO_DESCR, string.format("Reverted last enchantment (%s).", removed.key))
	end
	return true
end
