-- Sistema de Marley Coins (Converte em 1 Marley Point no site) - MarleyOT
-- Ao usar o item Marley Coin (ID 6527), adiciona +1 coin na conta do jogador.

local MARLEY_COIN_ID = 6527

function onUse(player, item, fromPosition, target, toPosition, isHotkey)
    if not player or not player:isPlayer() then
        return false
    end

    local accountId = player:getAccountId()
    if not accountId or accountId <= 0 then
        player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "[Marley Shop] Erro ao identificar a conta do jogador.")
        return false
    end

    -- Adicionar 1 ponto na conta via MariaDB
    db.query("UPDATE `accounts` SET `coins` = `coins` + 1 WHERE `id` = " .. accountId .. ";")

    -- Remover o item da mochila
    item:remove(1)

    -- Efeito visual e mensagem de sucesso
    player:getPosition():sendMagicEffect(CONST_ME_MAGIC_BLUE)
    player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "[Marley Shop] Parabéns! Você utilizou 1 Marley Coin e resgatou +1 Marley Point na sua conta do portal!")
    return true
end
