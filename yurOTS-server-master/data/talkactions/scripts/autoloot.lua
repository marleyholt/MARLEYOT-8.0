-- AutoLoot Talkaction for yurOTS 7.72
function onSay(player, words, param)
	param = param:trim()

	-- If no parameters, open OTClient UI and show list in console
	if param == "" or param == "open" or param == "gui" then
		AutoLoot.sendSync(player)
		local list = AutoLoot.getFormattedList(player)
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, list)
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "Comandos: !autoloot add, <item> | !autoloot remove, <item> | !autoloot gold | !autoloot clear")
		return false
	end

	local cmd = ""
	local itemInput = ""
	if param:find(",") then
		local split = param:split(",")
		cmd = split[1] and split[1]:trim():lower() or ""
		itemInput = split[2] and split[2]:trim() or ""
	else
		local spaceIdx = param:find(" ")
		if spaceIdx then
			cmd = param:sub(1, spaceIdx - 1):trim():lower()
			itemInput = param:sub(spaceIdx + 1):trim()
		else
			cmd = param:trim():lower()
		end
	end

	if cmd == "gold" or cmd == "ouro" then
		local enabled = AutoLoot.toggleGold(player)
		local statusStr = enabled and "LIGADO" or "DESLIGADO"
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "[AutoLoot] Coleta de moedas de ouro foi " .. statusStr .. ".")
		return false
	elseif cmd == "clear" or cmd == "limpar" then
		AutoLoot.clear(player)
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "[AutoLoot] Sua lista de itens foi limpa com sucesso.")
		return false
	elseif cmd == "list" or cmd == "lista" then
		local list = AutoLoot.getFormattedList(player)
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, list)
		return false
	elseif cmd == "add" or cmd == "adicionar" then
		if itemInput == "" then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "Uso correto: !autoloot add, <nome do item ou id>")
			return false
		end
		local success, msg = AutoLoot.addItem(player, itemInput)
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "[AutoLoot] " .. msg)
		return false
	elseif cmd == "remove" or cmd == "remover" or cmd == "del" then
		if itemInput == "" then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "Uso correto: !autoloot remove, <nome do item ou id>")
			return false
		end
		local success, msg = AutoLoot.removeItem(player, itemInput)
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "[AutoLoot] " .. msg)
		return false
	end

	player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "Comandos AutoLoot:\n!autoloot\n!autoloot gold\n!autoloot add, <item>\n!autoloot remove, <item>\n!autoloot clear")
	return false
end
