-- AutoLoot Library for yurOTS 7.72 (TFS 1.5 Downgrade)
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
	-- Load Gold Setting (default enabled)
	local goldVal = player:getStorageValue(AutoLoot.STORAGE_GOLD)
	if goldVal == -1 then
		player:setAutoLootGold(true)
		player:setStorageValue(AutoLoot.STORAGE_GOLD, 1)
	else
		player:setAutoLootGold(goldVal == 1)
	end

	-- Load Items from storage
	player:clearAutoLoot()
	local maxSlots = AutoLoot.getMaxSlots(player)
	for i = 1, maxSlots do
		local key = AutoLoot.STORAGE_SLOTS[i]
		local itemId = player:getStorageValue(key)
		if itemId and itemId > 0 then
			player:addAutoLootItem(itemId)
		end
	end

	-- Send initial sync to OTClient
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
		local jsonStr = json.encode(payload)
		player:sendExtendedOpcode(AutoLoot.OPCODE, jsonStr)
	end
end

function AutoLoot.sendError(player, msg)
	if json and json.encode then
		local payload = {
			action = "error",
			message = msg
		}
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

	-- Block gold coins from manual item slots since gold has its own toggle
	if itemId == 2148 or itemId == 2152 or itemId == 2160 then
		return false, "Moedas de ouro sao gerenciadas pelo botao/comando de Gold."
	end

	local items = player:getAutoLootItems() or {}
	for _, id in ipairs(items) do
		if id == itemId then
			return false, "O item '" .. ItemType(itemId):getName() .. "' ja esta na sua lista de AutoLoot."
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
		return true, "Item '" .. ItemType(itemId):getName() .. "' adicionado com sucesso ao AutoLoot."
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
