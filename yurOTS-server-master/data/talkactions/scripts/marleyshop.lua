function onSay(player, words, param)
    local accountId = player:getAccountId()
    local playerId = player:getGuid()
    if not accountId or accountId <= 0 or not playerId then
        player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "[Marley Shop] Erro ao identificar conta.")
        return false
    end
    words = words:lower()
    if words == "!points" or words == "/points" then
        local resultId = db.storeQuery("SELECT `coins` FROM `accounts` WHERE `id` = " .. accountId .. ";")
        if resultId then
            local coins = result.getNumber(resultId, "coins")
            result.free(resultId)
            player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "[Marley Shop] Você possui " .. coins .. " Marley Points.")
        else
            player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "[Marley Shop] Erro ao consultar pontos.")
        end
        return true
    end
    if words == "!resgatar" or words == "/resgatar" then
        local resultId = db.storeQuery("SELECT `player_id`, `itemtype`, `count` FROM `player_items` WHERE `player_id` = " .. playerId .. " AND `pid` = 0 LIMIT 1;")
        if not resultId then
            player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "[Marley Shop] Nenhum item pendente para resgate.")
            return false
        end
        local itemId = result.getNumber(resultId, "itemtype")
        local count = result.getNumber(resultId, "count")
        result.free(resultId)
        if not itemId or itemId <= 0 then return false end
        if not count or count <= 0 then count = 1 end
        local item = player:addItem(itemId, count)
        if item then
            db.query("DELETE FROM `player_items` WHERE `player_id` = " .. playerId .. " AND `pid` = 0 AND `itemtype` = " .. itemId .. " LIMIT 1;")
            player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "[Marley Shop] Sucesso! Item resgatado para a mochila.")
            player:getPosition():sendMagicEffect(CONST_ME_MAGIC_BLUE)
        else
            player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "[Marley Shop] Mochila cheia! Esvazie espaço.")
        end
        return true
    end
    return false
end
