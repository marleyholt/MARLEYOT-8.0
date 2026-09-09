function onSay(player, words, param)
	local fistSkill = player:getSkillLevel(SKILL_FIST)
	local voc = player:getVocation()
	local baseSpeed = voc and voc:getAttackSpeed() or 2000
	if baseSpeed <= 0 then
		baseSpeed = 2000
	end

	local currentSpeed = math.max(100, math.floor((baseSpeed * 100) / (100 + fistSkill)))
	local hitsPerTurn = string.format("%.2f", (2000 / currentSpeed))

	player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, string.format(
		"Attack Speed Info:\n- Fist Fighting Skill: %d\n- Attack Speed Bonus: +%d%%\n- Attack Interval: %d ms (Base: %d ms)\n- Hits per turn (2s): %s",
		fistSkill, fistSkill, currentSpeed, baseSpeed, hitsPerTurn
	))
	return false
end
