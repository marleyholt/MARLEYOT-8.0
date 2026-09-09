-- Sistema de Comprar Todas as Bênçãos (!bless / !buybless) - MarleyOT / YurOTS 7.72

local config = {
	price = 50000, -- Preço total para comprar todas as 5 bênçãos (50.000 gold coins)
	maxBlessings = 5
}

function onSay(player, words, param)
	-- Verificar se o jogador já possui todas as bênçãos
	local hasAll = true
	for i = 1, config.maxBlessings do
		if not player:hasBlessing(i) then
			hasAll = false
			break
		end
	end

	if hasAll then
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Você já possui todas as 5 bênçãos ativas.")
		player:getPosition():sendMagicEffect(CONST_ME_POFF)
		return false
	end

	if player:removeMoney(config.price) then
		for i = 1, config.maxBlessings do
			if not player:hasBlessing(i) then
				player:addBlessing(i)
			end
		end
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Parabéns! Você adquiriu todas as 5 bênçãos por " .. config.price .. " gold coins.")
		player:getPosition():sendMagicEffect(CONST_ME_MAGIC_BLUE)
	else
		player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Você não tem dinheiro suficiente. O custo total para todas as bênçãos é de " .. config.price .. " gold coins.")
		player:getPosition():sendMagicEffect(CONST_ME_POFF)
	end
	return false
end
