function onKill(creature, target)
	local monsterName = target:getName():lower()
	if monsterName == DailyMonster:lower() then
		local monster = MonsterType(monsterName)
		if monster then
			local monsterExp = monster:getExperience()
			local bonusExp = (monsterExp * DailyBonus) / 100
			creature:addExperience(bonusExp, true)
			creature:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "[Monstro do Dia] Você matou um " .. DailyMonster .. " e ganhou +" .. bonusExp .. " de EXP bônus (+100%)!")
		end
	end
	return true
end
