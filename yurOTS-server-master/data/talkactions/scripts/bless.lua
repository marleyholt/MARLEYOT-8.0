-- Sistema de Bless para YurOTS 7.72 via Storage Values
local config = {
    price = 50000, -- 50k gold coins
    storages = {30001, 30002, 30003, 30004, 30005}
}

function onSay(player, words, param)
    local hasAll = true
    for _, stor in ipairs(config.storages) do
        if player:getStorageValue(stor) < 1 then
            hasAll = false
            break
        end
    end

    if hasAll then
        player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Você já possui todas as 5 bênçãos ativas.")
        return false
    end

    if player:removeMoney(config.price) then
        for _, stor in ipairs(config.storages) do
            player:setStorageValue(stor, 1)
        end
        player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Parabéns! Você adquiriu todas as 5 bênçãos por " .. config.price .. " gold coins.")
        player:getPosition():sendMagicEffect(CONST_ME_MAGIC_BLUE)
    else
        player:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "Você não tem dinheiro suficiente. O custo total para as bênçãos é de " .. config.price .. " gold coins.")
    end
    return false
end
