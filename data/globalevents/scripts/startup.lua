DailyMonster = 'Dragon'
DailyBonus = 100

function newDailyMonster()
local monsterList = {
'amazon', 'dragon', 'dragon lord', 'demon', 'giant spider', 
'hydra', 'warlock', 'hero', 'necromancer', 'behemoth', 
'lich', 'banshee', 'vampire', 'beholder', 'cyclops', 
'minotaur', 'orc berserker', 'orc warlord', 'rotworm', 
'skeleton', 'ghoul', 'slime', 'minotaur guard', 'fire devil',
'stone golem', 'minotaur mage', 'dwarf guard', 'elf arcanist'
}

math.randomseed(os.time() + os.mtime())
local randomName = monsterList[math.random(#monsterList)]

DailyMonster = randomName
DailyBonus = 100

-- Salvar no banco para o site exibir automaticamente
db.asyncQuery("REPLACE INTO `server_config` (`config`, `value`) VALUES ('boosted_monster', '".. randomName .."'), ('boosted_bonus', '100')")

print(">> [Monstro do Dia Sorteado]: " .. randomName .. " (+100% EXP)")
return {name = randomName, bonus = 100}
end

function onStartup()
math.randomseed(os.time() + os.mtime())
local npcsList = {
{name='perac',pos=Position(5983,6045,5)},
{name='darkrodo',pos=Position(5967,6041,6)},
{name='lector',pos=Position(5966,6040,7)},
{name='darkrodo',pos=Position(6046,6062,7)},
{name='seller',pos=Position(6047,6071,7)},
{name='darkrodo',pos=Position(6166,6075,6)},
{name='dufi',pos=Position(6173,6069,6)},
{name='perac',pos=Position(6173,6075,6)},
{name='captain3',pos=Position(6012,6055,7)},
{name='captain4',pos=Position(6120,6077,7)},
{name='captain2',pos=Position(6195,6094,7)},
{name='angel',pos=Position(6139,6042,7)},
{name='obi',pos=Position(6012,6037,7)},
{name='geralt',pos=Position(5971,6021,4)},
}
for ni=1,#npcsList do
Game.createNpc(npcsList[ni].name,npcsList[ni].pos)
end
db.query("TRUNCATE TABLE `players_online`")
db.asyncQuery("DELETE FROM `guild_wars` WHERE `status` = 0")
db.asyncQuery("DELETE FROM `players` WHERE `deletion` != 0 AND `deletion` < " .. os.time())
db.asyncQuery("DELETE FROM `ip_bans` WHERE `expires_at` != 0 AND `expires_at` <= " .. os.time())

-- Move expired bans to ban history (Clean original implementation)
local resultId = db.storeQuery("SELECT * FROM `account_bans` WHERE `expires_at` != 0 AND `expires_at` <= " .. os.time())
if resultId ~= false then
repeat
local accountId = result.getDataInt(resultId, "account_id")
db.asyncQuery("INSERT INTO `account_ban_history` (`account_id`, `reason`, `banned_at`, `expired_at`, `banned_by`) VALUES (" .. accountId .. ", " .. db.escapeString(result.getDataString(resultId, "reason")) .. ", " .. result.getDataLong(resultId, "banned_at") .. ", " .. result.getDataLong(resultId, "expires_at") .. ", " .. result.getDataInt(resultId, "banned_by") .. ")")
db.asyncQuery("DELETE FROM `account_bans` WHERE `account_id` = " .. accountId)
until not result.next(resultId)
result.free(resultId)
end

newDailyMonster()
end
