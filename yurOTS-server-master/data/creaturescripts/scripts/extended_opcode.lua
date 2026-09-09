-- Extended Opcode Handler (OTClient <-> Server)
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
		if not success then
			AutoLoot.sendError(player, msg)
		end
	elseif action == "remove" then
		local input = data.item or data.id
		local success, msg = AutoLoot.removeItem(player, input)
		if not success then
			AutoLoot.sendError(player, msg)
		end
	elseif action == "toggle_gold" then
		AutoLoot.toggleGold(player)
	elseif action == "clear" then
		AutoLoot.clear(player)
	end

	return true
end
