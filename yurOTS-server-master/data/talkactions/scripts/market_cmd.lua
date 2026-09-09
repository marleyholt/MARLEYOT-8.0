-- Sistema de Market via Comandos de Chat com Janela de Livro (yurOTS 7.72)

function onSay(player, words, param)
	local wordsLower = words:lower()

	-- Menu de Ajuda (!shop)
	if wordsLower == "!shop" or wordsLower == "/shop" then
		local text = "=== [ MERCADO GLOBAL - AJUDA ] ===\n\n" ..
			"1. Anunciar item:\n   Coloque o item no Arrow Slot e digite:\n   !shopsell <preco>\n\n" ..
			"2. Ver ofertas (Abre Janela):\n   !shopoffers (ou !shopoffer)\n\n" ..
			"3. Comprar item:\n   !shopbuy <id_da_oferta>\n\n" ..
			"4. Cancelar anuncio:\n   !shopremove <id_da_oferta>\n"
		player:showTextDialog(2195, text)
		return true
	end

	-- 1. !shopsell <preco>
	if wordsLower == "!shopsell" then
		local price = tonumber(param)
		if not price or price <= 0 then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Uso correto: !shopsell <preco>. Exemplo: !shopsell 5000 (Coloque o item no slot de flecha/arrow antes).")
			return false
		end

		local item = player:getSlotItem(CONST_SLOT_AMMO)
		if not item or item:getId() == 0 then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce nao tem nenhum item no slot de flecha (arrow slot) para colocar a venda.")
			return false
		end

		local itemtype = item:getId()
		local amount = item:getCount()
		if not amount or amount == 0 then amount = 1 end

		local playerId = player:getGuid()
		local created = os.time()

		db.query("INSERT INTO `market_offers` (`player_id`, `sale`, `itemtype`, `amount`, `created`, `anonymous`, `price`) VALUES (" .. playerId .. ", 1, " .. itemtype .. ", " .. amount .. ", " .. created .. ", 0, " .. price .. ")")
		item:remove()

		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Oferta criada com sucesso! Seu item foi anunciado por " .. price .. " gold coins.")
		return true

	-- 2. !shopoffers / !shopoffer (Abre Janela Flutuante tipo Spellbook)
	elseif wordsLower == "!shopoffers" or wordsLower == "!shopoffer" then
		local resultId = db.storeQuery("SELECT o.id, p.name as seller, o.itemtype, o.amount, o.price FROM `market_offers` o INNER JOIN `players` p ON p.id = o.player_id WHERE o.sale = 1 LIMIT 50")
		if not resultId then
			player:showTextDialog(2195, "=== MERCADO GLOBAL ===\n\nNao ha ofertas ativas no momento.\n\nUse !shopsell <preco> no seu Arrow Slot para anunciar um item.")
			return false
		end

		local text = "=== MERCADO GLOBAL - OFERTAS ===\n\n"
		repeat
			local id = result.getNumber(resultId, "id")
			local seller = result.getString(resultId, "seller")
			local itemtype = result.getNumber(resultId, "itemtype")
			local amount = result.getNumber(resultId, "amount")
			local price = result.getNumber(resultId, "price")
			text = text .. "ID [" .. id .. "] | Vendedor: " .. seller .. "\nItem ID: " .. itemtype .. " | Qtd: " .. amount .. "\nPreco: " .. price .. " gps\nComprar: !shopbuy " .. id .. "\n-----------------------------------\n"
		until not result.next(resultId)
		result.free(resultId)

		text = text .. "\nPara cancelar sua oferta:\n!shopremove <id>"
		player:showTextDialog(2195, text)
		return true

	-- 3. !shopremove <id> / !shopcancel <id>
	elseif wordsLower == "!shopremove" or wordsLower == "!shopcancel" then
		local offerId = tonumber(param)
		if not offerId then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Uso correto: !shopremove <id_da_oferta>. Exemplo: !shopremove 1")
			return false
		end

		local resultId = db.storeQuery("SELECT * FROM `market_offers` WHERE `id` = " .. offerId .. " AND `sale` = 1 LIMIT 1")
		if not resultId then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Oferta nao encontrada ou ID invalido.")
			return false
		end

		local sellerId = result.getNumber(resultId, "player_id")
		local itemtype = result.getNumber(resultId, "itemtype")
		local amount = result.getNumber(resultId, "amount")
		result.free(resultId)

		if sellerId ~= player:getGuid() then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce so pode remover ofertas que pertencem a voce.")
			return false
		end

		player:addItem(itemtype, amount)
		db.query("DELETE FROM `market_offers` WHERE `id` = " .. offerId)

		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Oferta removida com sucesso! O item foi devolvido para a sua mochila.")
		return true

	-- 4. !shopbuy <id>
	elseif wordsLower == "!shopbuy" then
		local offerId = tonumber(param)
		if not offerId then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Uso correto: !shopbuy <id_da_oferta>. Exemplo: !shopbuy 1")
			return false
		end

		local resultId = db.storeQuery("SELECT * FROM `market_offers` WHERE `id` = " .. offerId .. " AND `sale` = 1 LIMIT 1")
		if not resultId then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Oferta nao encontrada, ID invalido ou ja foi vendida.")
			return false
		end

		local sellerId = result.getNumber(resultId, "player_id")
		local itemtype = result.getNumber(resultId, "itemtype")
		local amount = result.getNumber(resultId, "amount")
		local price = result.getNumber(resultId, "price")
		result.free(resultId)

		if sellerId == player:getGuid() then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce nao pode comprar sua propria oferta. Use !shopremove " .. offerId .. " para retira-la.")
			return false
		end

		if player:getMoney() < price then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Voce nao tem dinheiro suficiente (" .. price .. " gps) para comprar esta oferta. Voce possui: " .. player:getMoney() .. " gps.")
			return false
		end

		player:removeMoney(price)
		player:addItem(itemtype, amount)
		db.query("UPDATE `players` SET `balance` = `balance` + " .. price .. " WHERE `id` = " .. sellerId)
		db.query("DELETE FROM `market_offers` WHERE `id` = " .. offerId)

		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Parabens! Transacao concluida com sucesso. O item foi adicionado a sua mochila.")
		return true
	end

	return false
end
