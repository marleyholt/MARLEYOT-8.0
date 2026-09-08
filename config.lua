# (ou onde estiver a pasta do seu servidor, ex: ~/server772/config.lua)-- Combat settings
-- NOTE: valid values for worldType are: "pvp", "no-pvp" and "pvp-enforced"
worldType = "pvp"
protectionLevel = 8
pzLocked = 10000
removeChargesFromRunes = true
stairJumpExhaustion = 0
experienceByKillingPlayers = true
expFromPlayersLevelRange = 75

-- Skull System
banLength = 2 * 24 * 60 * 60
whiteSkullTime = 15 * 60
redSkullTime = 2 * 24 * 60 * 60
killsDayRedSkull = 5
killsWeekRedSkull = 14
killsMonthRedSkull = 38
killsDayBanishment = 8
killsWeekBanishment = 26
killsMonthBanishment = 52

-- Connection Config
-- NOTE: maxPlayers set to 0 means no limit
ip = "137.131.196.66"
bindOnlyGlobalAddress = false
loginProtocolPort = 7171
gameProtocolPort = 7172
statusProtocolPort = 7171
maxPlayers = 0
motd = "Bem vindo ao beta teste MarleyOT, em caso de bug envie uma mensagem pra https://discord.gg/V4yKQRC8."
onePlayerOnlinePerAccount = true
allowClones = false
serverName = "MarleyOT"
statusTimeout = 5000
replaceKickOnLogin = true
maxPacketsPerSecond = 50
autoStackCumulatives = true
moneyRate = 1
runesCharges = 2
extraOnline = 1

-- Deaths
-- NOTE: Leave deathLosePercent as -1 if you want to use the default
-- death penalty formula. For the old formula, set it to 10. For
-- no skill/experience loss, set it to 0.
deathLosePercent = 10

-- Houses
houseRentPeriod = "weekly"

-- Item Usage
timeBetweenActions = 600
timeBetweenExActions = 900

-- Map
-- NOTE: set mapName WITHOUT .otbm at the end
mapName = "map"
mapAuthor = "Yurez - Rodi"

-- MySQL
mysqlHost = "127.0.0.1"
mysqlUser = "yurots_user"
mysqlPass = "Yurots80Secret!"
mysqlDatabase = "yurots_db"
mysqlPort = 3306
mysqlSock = ""

-- Misc.
allowChangeOutfit = true
freePremium = false
kickIdlePlayerAfterMinutes = 60 * 24
maxMessageBuffer = 4
showMonsterLoot = true
queryPlayerContainers = true

-- Character Rooking
-- Level threshold is the level requirement to teleport players back to newbie town
teleportNewbies = false
newbieTownId = 1
newbieLevelThreshold = 5

-- Rates
-- NOTE: rateExp is not used if you have enabled stages in data/XML/stages.xml
experienceStages = true
rateExp = 1
rateSkill = 1
rateMagic = 1
rateLoot = 1
rateSpawn = 2

-- Monsters
deSpawnRange = 99999
deSpawnRadius = 99999

-- Scripts
warnUnsafeScripts = true
convertUnsafeScripts = true

-- Startup
-- NOTE: defaultPriority only works on Windows and sets process
-- priority, valid values are: "normal", "above-normal", "high"
defaultPriority = "high"
startupDatabaseOptimization = false

-- Status server information
ownerName = ""
ownerEmail = "yourEmail@gmail.com"
url = "https://127.0.0.1/"
location = "Canada"

-- Auto Save & Player Save
autoSave = true
autoSaveInterval = 15 * 60 * 1000
saveGlobalStorage = true
savePlayerOnLogout = true

-- Stamina Configuration
staminaSystem = true
extraRateStamina = 1.5
staminaHoursBonus = 40
-- 1 minuto offline (60000 ms) recupera 1 minuto de stamina
timeToStaminaOffline = 60 * 1000
