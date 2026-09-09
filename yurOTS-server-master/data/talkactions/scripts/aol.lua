-- Sistema de Comprar 1 Amulet of Loss (!aol) - MarleyOT / YurOTS 7.72

local config = {
	price = 10000, -- Preço de 1 Amulet of Loss (10.000 gold coins)
	itemId = 2173  -- ID do Amulet of Loss
}

function onSay(player, words, param)
	if player:removeMoney(config.price) then
		local item = player:addItem(config.itemId, 1)
		if item then
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Você comprou 1 Amulet of Loss por " .. config.price .. " gold coins.")
			player:getPosition():sendMagicEffect(CONST_ME_MAGIC_BLUE)
		else
			-- Devolver o dinheiro se a mochila estiver cheia
			player:addMoney(config.price)
			player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Sua mochila está cheia! Esvazie espaço para comprar o Amulet of Loss.")
			player:getPosition():sendMagicEffect(CONST_ME_POFF)
		end
	else
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Você não tem dinheiro suficiente. Um Amulet of Loss custa " .. config.price .. " gold coins.")
		player:getPosition():sendMagicEffect(CONST_ME_POFF)
	end
	return false
end
