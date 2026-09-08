local MAX_STAMINA = 42 * 60 -- 2520 min (42h)
local ADD_STAMINA = 2       -- +2 min por ciclo
local MIN_MONKS = 2
local STORAGE_TRAINER_ACTIVE = 89998

function onThink(interval, lastExecution)
    local players = getPlayersOnline()
    for _, cid in ipairs(players) do
        if isPlayer(cid) then
            local pPos = getCreaturePosition(cid)
            local monkCount = 0

            -- Varrer um raio de 2 SQMs ao redor do jogador (cobre as celas da foto)
            for dx = -2, 2 do
                for dy = -2, 2 do
                    if not (dx == 0 and dy == 0) then
                        local checkPos = {x = pPos.x + dx, y = pPos.y + dy, z = pPos.z, stackpos = 253}
                        local thing = getThingFromPos(checkPos).uid
                        if isMonster(thing) then
                            local name = string.lower(getCreatureName(thing))
                            if string.find(name, "monk") or string.find(name, "training") then
                                monkCount = monkCount + 1
                            end
                        end
                    end
                end
            end

            local isNearTrainers = (monkCount >= MIN_MONKS)
            local wasNearTrainers = (getPlayerStorageValue(cid, STORAGE_TRAINER_ACTIVE) == 1)

            -- Dispara a mensagem e efeito visual
            if isNearTrainers and not wasNearTrainers then
                setPlayerStorageValue(cid, STORAGE_TRAINER_ACTIVE, 1)
                doPlayerSendTextMessage(cid, MESSAGE_INFO_DESCR, "Stamina comecou a recuperar em 1 para 2.")
                doSendMagicEffect(pPos, CONST_ME_MAGIC_GREEN)
            elseif not isNearTrainers and wasNearTrainers then
                setPlayerStorageValue(cid, STORAGE_TRAINER_ACTIVE, -1)
            end

            -- Adiciona stamina
            if isNearTrainers then
                local currentStamina = getPlayerStamina(cid)
                if currentStamina < MAX_STAMINA then
                    local newStamina = math.min(MAX_STAMINA, currentStamina + ADD_STAMINA)
                    setPlayerStamina(cid, newStamina)
                end
            end
        end
    end
    return true
end
