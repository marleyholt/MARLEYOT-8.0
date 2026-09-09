import { VocationInfo, SpellInfo, MonsterInfo, YurotsLocation, ServerConfig, Account } from '../types';

export const VOCATIONS: Record<number, VocationInfo> = {
  0: {
    id: 0,
    name: 'Nenhum (Rookgaard)',
    description: 'Sem vocação definida. Pronto para escolher seu destino no templo.',
    hpGain: 5,
    manaGain: 5,
    capGain: 10,
    icon: 'Sword',
  },
  1: {
    id: 1,
    name: 'Sorcerer',
    promotedName: 'Master Sorcerer',
    description: 'Mestres da destruição elemental, fogo, energia e morte. Maior avanço em Magic Level.',
    hpGain: 5,
    manaGain: 30,
    capGain: 10,
    icon: 'Flame',
  },
  2: {
    id: 2,
    name: 'Druid',
    promotedName: 'Elder Druid',
    description: 'Mestres da cura, natureza, terra e gelo. Indispensáveis para caçadas em grupo e criação de UH.',
    hpGain: 5,
    manaGain: 30,
    capGain: 10,
    icon: 'Leaf',
  },
  3: {
    id: 3,
    name: 'Paladin',
    promotedName: 'Royal Paladin',
    description: 'Arqueiros letais de longa distância. Equilíbrio formidável entre dano físico, munições e cura sagrada.',
    hpGain: 10,
    manaGain: 15,
    capGain: 20,
    icon: 'Target',
  },
  4: {
    id: 4,
    name: 'Knight',
    promotedName: 'Elite Knight',
    description: 'Guerreiros de armadura pesada com vitalidade colossal. Os tanques da linha de frente do servidor.',
    hpGain: 15,
    manaGain: 5,
    capGain: 25,
    icon: 'Shield',
  },
};

export const INITIAL_CONFIG: ServerConfig = {
  serverName: 'MARLEYOT Yurots 7.72',
  serverIp: '137.131.196.66', // IP Público da instância Oracle Cloud do usuário (MARLEYOT-SERVIDOR)
  gamePort: 7172,
  loginPort: 7171,
  worldType: 'open-pvp',
  location: 'Brazil / São Paulo (Oracle Cloud Always Free)',
  ownerName: 'Administrador (GOD)',
  ownerEmail: 'admin@marleyot.com',
  motd: 'Bem-vindo ao MARLEYOT Yurots 7.72! Hospedado 24/7 na Oracle Cloud Always Free.',
  rateExp: 50,
  rateSkill: 25,
  rateLoot: 3,
  rateMagic: 12,
  rateSpawn: 2,
  mysqlHost: '127.0.0.1',
  mysqlUser: 'root',
  mysqlPass: 'MARLEY22@@##',
  mysqlDatabase: 'yurots_db',
  mysqlPort: 3306,
  clientVersion: '7.72',
  mapName: 'yurots',
  mapAuthor: 'MARLEYOT Staff',
};

export const SPELLS_80: SpellInfo[] = [
  {
    id: 'exori',
    name: 'Berserk',
    words: 'exori',
    level: 35,
    mana: 115,
    price: 2500,
    vocations: ['Knight'],
    type: 'Attack',
    premium: true,
    description: 'O clássico golpe em área 3x3 que atinge todos os monstros ao redor do Knight.',
  },
  {
    id: 'exori-gran',
    name: 'Fierce Berserk',
    words: 'exori gran',
    level: 70,
    mana: 340,
    price: 7500,
    vocations: ['Knight'],
    type: 'Attack',
    premium: true,
    description: 'Golpe devastador de área para Knights em combate corporal.',
  },
  {
    id: 'exori-vis',
    name: 'Energy Strike',
    words: 'exori vis',
    level: 12,
    mana: 20,
    price: 800,
    vocations: ['Sorcerer', 'Druid'],
    type: 'Attack',
    premium: true,
    description: 'Dispara uma rajada curta de energia no alvo frontal.',
  },
  {
    id: 'exori-flam',
    name: 'Flame Strike',
    words: 'exori flam',
    level: 14,
    mana: 20,
    price: 800,
    vocations: ['Sorcerer', 'Druid'],
    type: 'Attack',
    premium: true,
    description: 'Rajada de fogo que incinera o alvo adjacente.',
  },
  {
    id: 'exevo-gran-mas-vis',
    name: 'Rage of the Skies',
    words: 'exevo gran mas vis',
    level: 55,
    mana: 650,
    price: 6000,
    vocations: ['Sorcerer'],
    type: 'Attack',
    premium: true,
    description: 'Grande magia de tempestade elétrica que limpa telas inteiras de monstros.',
  },
  {
    id: 'exevo-gran-mas-flam',
    name: 'Hell\'s Core',
    words: 'exevo gran mas flam',
    level: 60,
    mana: 1200,
    price: 8000,
    vocations: ['Sorcerer'],
    type: 'Attack',
    premium: true,
    description: 'A lendária UE (Ultimate Explosion de fogo) do Tibia 7.72, icônica dos Sorcerers.',
  },
  {
    id: 'exevo-gran-mas-tera',
    name: 'Wrath of Nature',
    words: 'exevo gran mas tera',
    level: 55,
    mana: 770,
    price: 6000,
    vocations: ['Druid'],
    type: 'Attack',
    premium: true,
    description: 'Tremor e raízes da terra que atingem toda a tela.',
  },
  {
    id: 'exevo-mas-san',
    name: 'Divine Caldera',
    words: 'exevo mas san',
    level: 50,
    mana: 160,
    price: 3000,
    vocations: ['Paladin'],
    type: 'Attack',
    premium: true,
    description: 'Aura sagrada que causa dano sagrado instantâneo em área.',
  },
  {
    id: 'exura-vita',
    name: 'Ultimate Healing',
    words: 'exura vita',
    level: 20,
    mana: 160,
    price: 1000,
    vocations: ['Sorcerer', 'Druid'],
    type: 'Healing',
    premium: false,
    description: 'Restaura totalmente a barra de vida de magos com base no magic level.',
  },
  {
    id: 'exura-sio',
    name: 'Heal Friend',
    words: 'exura sio "Nome',
    level: 18,
    mana: 140,
    price: 800,
    vocations: ['Druid'],
    type: 'Healing',
    premium: true,
    description: 'Cura outro jogador à distância. O feitiço central que faz dos Druidas o pilar das hunts.',
  },
  {
    id: 'adori-vita-vis',
    name: 'Sudden Death Rune',
    words: 'adori vita vis',
    level: 45,
    mana: 985,
    price: 3000,
    vocations: ['Sorcerer'],
    type: 'Rune',
    premium: false,
    description: 'Cria a famosa runa de SD (Sudden Death) com dano altíssimo de morte.',
  },
  {
    id: 'adura-vita',
    name: 'Ultimate Healing Rune',
    words: 'adura vita',
    level: 24,
    mana: 400,
    price: 1500,
    vocations: ['Druid'],
    type: 'Rune',
    premium: false,
    description: 'A sagrada UH do Tibia clássico, usada em PVP e para curar Knights.',
  },
];

export const MONSTERS_80: MonsterInfo[] = [
  {
    id: 'demon',
    name: 'Demon',
    health: 8200,
    experience: 6000,
    difficulty: 'Difícil',
    summonable: false,
    loot: ['Magic Plate Armor', 'Mastermind Shield', 'Demon Shield', 'Fire Axe', 'Golden Legs', 'Ice Rapier'],
    location: 'Yurots Demon Hell, Annihilator, POI, Demon Oak',
    notes: 'O monstro mais lendário do Tibia 7.72. Causa dano massivo de Fireball, Energy Beam e drena mana.',
  },
  {
    id: 'dragon-lord',
    name: 'Dragon Lord',
    health: 1900,
    experience: 2100,
    difficulty: 'Médio',
    summonable: false,
    loot: ['Dragon Slayer', 'Royal Helmet', 'Dragon Scale Mail', 'Tower Shield', 'Fire Sword'],
    location: 'Yurots DL Lair Norte e Sul (Teleports)',
    notes: 'A caçada clássica para subir de nível velozmente em servidores Yurots.',
  },
  {
    id: 'behemoth',
    name: 'Behemoth',
    health: 4000,
    experience: 2500,
    difficulty: 'Difícil',
    summonable: false,
    loot: ['Titan Axe', 'Steel Boots', 'Giant Sword', 'Dark Armor'],
    location: 'Yurots Behemoth Mountain / Subsolo',
    notes: 'Monstro bruto corpo a corpo. Lança pedregulhos pesados.',
  },
  {
    id: 'warlock',
    name: 'Warlock',
    health: 3500,
    experience: 4000,
    difficulty: 'Difícil',
    summonable: false,
    loot: ['Golden Armor', 'Skull Staff', 'Ring of the Sky', 'Blue Robe', 'Energy Ring'],
    location: 'Yurots Warlock Castle / Subsolo dos Magos',
    notes: 'Fica invisível, solta Great Energy Beam, combo de SD e se cura rapidamente.',
  },
  {
    id: 'hero',
    name: 'Hero',
    health: 1400,
    experience: 1200,
    difficulty: 'Médio',
    summonable: false,
    loot: ['Crown Armor', 'Crown Shield', 'Crown Legs', 'Fire Sword'],
    location: 'Yurots Hero Cave',
    notes: 'Excelente para Knights e Paladins intermediários farmarem equipamentos raros.',
  },
  {
    id: 'orshabaal',
    name: 'Orshabaal',
    health: 22500,
    experience: 10000,
    difficulty: 'Boss',
    summonable: false,
    loot: ['Thunder Hammer', 'Teddy Bear', 'Demon Shield', 'Silver Mace', 'Great Axe'],
    location: 'Invasão Yurots nas planícies do templo',
    notes: 'Primeiro Boss lendário dos Triângulos do Terror. Exige dezenas de magos e Elite Knights bem treinados.',
  },
  {
    id: 'ferumbras',
    name: 'Ferumbras',
    health: 35000,
    experience: 12000,
    difficulty: 'Lendário',
    summonable: false,
    loot: ['Ferumbras Hat', 'Great Shield', 'Spellbook of Dark Mysteries', 'Havoc Blade', 'Tempest Rod'],
    location: 'Torre de Ferumbras (Teleport de Quests Yurots)',
    notes: 'Invoca múltiplos Demons ao redor, paralisa e lança magias colossais.',
  },
];

export const YUROTS_LOCATIONS: YurotsLocation[] = [
  {
    id: 'temple-depot',
    title: 'Templo & Depot Central de Yurots',
    category: 'Cidade',
    recommendedLevel: 'Todos os Níveis',
    description: 'O coração nostálgico do mapa criado por Yurez. O templo com piso de mármore e tapetes azuis, com o Depot a poucos passos ao norte e a sala de teleports.',
    features: ['Área de Proteção (PZ)', 'Depot com 16 baús', 'NPC Vendedor de Runas & Vocações', 'NPC Comprador de Loots'],
    coordinates: 'X: 160, Y: 54, Z: 7',
  },
  {
    id: 'teleport-room',
    title: 'Sala de Teleports das Hunts',
    category: 'Hunt',
    recommendedLevel: 'Nível 20 ao 250+',
    description: 'A sala mais frequentada de todo servidor Yurots. Portais diretos para Rotworms, Cyclops, Dragons, Dragon Lords, Warlocks, Demons e Hydras.',
    features: ['Acesso rápido sem caminhar horas', 'Divisão por dificuldade', 'Área de treino com trainers embaixo'],
    coordinates: 'X: 160, Y: 45, Z: 7',
  },
  {
    id: 'annihilator',
    title: 'The Annihilator Quest',
    category: 'Quest',
    recommendedLevel: 'Nível 100+',
    description: 'A prova definitiva de 4 guerreiros trancados em um corredor estreito contra 6 Demons cuspir de fogo.',
    features: ['Recompensas: Demon Armor, Magic Sword (SOV), Stonecutter Axe (SCA) ou Present Box (Annihilation Bear)'],
    coordinates: 'X: 247, Y: 65, Z: 13',
  },
  {
    id: 'demon-helmet',
    title: 'Demon Helmet Quest (DHQ)',
    category: 'Quest',
    recommendedLevel: 'Nível 100+',
    description: 'Sala com alavanca que libera horda de Demons e Banshees para conquistar o lendário Demon Helmet.',
    features: ['Recompensas: Demon Helmet, Steel Boots, Demon Shield'],
    coordinates: 'X: 173, Y: 110, Z: 10',
  },
  {
    id: 'poi-yurots',
    title: 'Pits of Inferno (POI Adaptado)',
    category: 'Quest',
    recommendedLevel: 'Nível 120+',
    description: 'A adaptação dos 7 tronos dos Ruthless Seven para a versão Yurots 7.72, com bosses e caminhos de fogo.',
    features: ['Soft Boots', 'Arcane Staff', 'Avenger', 'Backpack of Holding'],
    coordinates: 'X: 300, Y: 210, Z: 14',
  },
  {
    id: 'training-monks',
    title: 'Sala de Treinamento (Training Monks)',
    category: 'Cidade',
    recommendedLevel: 'Nível 8+',
    description: 'Subsolo seguro com dezenas de cabines de Training Monks para avançar Shielding, Sword, Axe e Distance AFK.',
    features: ['Monks invulneráveis com regeneração contínua', 'PZ local', 'Perto do depot'],
    coordinates: 'X: 160, Y: 54, Z: 8',
  },
];

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 1,
    name: '1',
    password_hash: '1', // Classic default GOD account
    email: 'god@yurots80.com',
    premdays: 365,
    coins: 1000,
    created: 1700000000,
    type: 5,
    characters: [
      {
        id: 1,
        account_id: 1,
        name: 'GOD Yurots',
        vocation: 1,
        level: 350,
        experience: 71250000,
        health: 2100,
        healthmax: 2100,
        mana: 10500,
        manamax: 10500,
        maglevel: 120,
        sex: 1,
        town_id: 1,
        town_name: 'Yurots',
        online: true,
        group_id: 5,
        lastlogin: Date.now() - 3600000,
        created: 1700000000,
        skills: {
          fist: 110,
          club: 115,
          sword: 120,
          axe: 120,
          dist: 115,
          shield: 120,
          fish: 100,
        },
      },
    ],
  },
  {
    id: 2,
    name: 'player1',
    password_hash: 'player1',
    email: 'eternal@otserv.com',
    premdays: 90,
    coins: 250,
    created: 1700050000,
    type: 1,
    characters: [
      {
        id: 2,
        account_id: 2,
        name: 'Eternal Yurots',
        vocation: 4,
        level: 210,
        experience: 15400000,
        health: 3150,
        healthmax: 3150,
        mana: 1050,
        manamax: 1050,
        maglevel: 9,
        sex: 1,
        town_id: 1,
        town_name: 'Yurots',
        online: true,
        group_id: 1,
        lastlogin: Date.now() - 1800000,
        created: 1700050000,
        skills: {
          fist: 30,
          club: 20,
          sword: 102,
          axe: 25,
          dist: 20,
          shield: 98,
          fish: 45,
        },
      },
      {
        id: 3,
        account_id: 2,
        name: 'Sniper Archer',
        vocation: 3,
        level: 165,
        experience: 7450000,
        health: 1650,
        healthmax: 1650,
        mana: 2475,
        manamax: 2475,
        maglevel: 23,
        sex: 1,
        town_id: 1,
        town_name: 'Yurots',
        online: false,
        group_id: 1,
        lastlogin: Date.now() - 86400000,
        created: 1700080000,
        skills: {
          fist: 20,
          club: 20,
          sword: 20,
          axe: 20,
          dist: 97,
          shield: 84,
          fish: 50,
        },
      },
    ],
  },
  {
    id: 3,
    name: 'cachero',
    password_hash: '123456',
    email: 'cachero@nostalgia.com',
    premdays: 30,
    coins: 50,
    created: 1700100000,
    type: 1,
    characters: [
      {
        id: 4,
        account_id: 3,
        name: 'Cachero Yurots',
        vocation: 1,
        level: 195,
        experience: 12300000,
        health: 975,
        healthmax: 975,
        mana: 5850,
        manamax: 5850,
        maglevel: 85,
        sex: 1,
        town_id: 1,
        town_name: 'Yurots',
        online: true,
        group_id: 1,
        lastlogin: Date.now() - 7200000,
        created: 1700100000,
        skills: {
          fist: 20,
          club: 20,
          sword: 20,
          axe: 20,
          dist: 20,
          shield: 35,
          fish: 60,
        },
      },
    ],
  },
  {
    id: 4,
    name: 'bubble',
    password_hash: '123456',
    email: 'bubble@legend.com',
    premdays: 60,
    coins: 100,
    created: 1700120000,
    type: 1,
    characters: [
      {
        id: 5,
        account_id: 4,
        name: 'Lady Bubble',
        vocation: 4,
        level: 180,
        experience: 9700000,
        health: 2700,
        healthmax: 2700,
        mana: 900,
        manamax: 900,
        maglevel: 8,
        sex: 0,
        town_id: 1,
        town_name: 'Yurots',
        online: false,
        group_id: 1,
        lastlogin: Date.now() - 172800000,
        created: 1700120000,
        skills: {
          fist: 25,
          club: 20,
          sword: 95,
          axe: 20,
          dist: 20,
          shield: 92,
          fish: 40,
        },
      },
    ],
  },
  {
    id: 5,
    name: 'healer',
    password_hash: '123456',
    email: 'druid@healing.com',
    premdays: 45,
    coins: 75,
    created: 1700150000,
    type: 1,
    characters: [
      {
        id: 6,
        account_id: 5,
        name: 'Mystic Sio Maker',
        vocation: 2,
        level: 140,
        experience: 4550000,
        health: 700,
        healthmax: 700,
        mana: 4200,
        manamax: 4200,
        maglevel: 76,
        sex: 0,
        town_id: 1,
        town_name: 'Yurots',
        online: true,
        group_id: 1,
        lastlogin: Date.now() - 1200000,
        created: 1700150000,
        skills: {
          fist: 20,
          club: 20,
          sword: 20,
          axe: 20,
          dist: 20,
          shield: 32,
          fish: 72,
        },
      },
    ],
  },
];

export function generateConfigLua(config: ServerConfig): string {
  return `-- Yurots 7.72 Server Configuration for TFS 1.5 Downgrade / 7.72
-- Generated automatically for Oracle Cloud Always Free
-- Protocol: 7.72 | World: ${config.serverName}

-- Connection Settings
ip = "${config.serverIp}"
bindOnlyConfiguredIpAddress = false
loginPort = ${config.loginPort}
gamePort = ${config.gamePort}
statusPort = ${config.loginPort}

-- Server Description & Identity
serverName = "${config.serverName}"
ownerName = "${config.ownerName}"
ownerEmail = "${config.ownerEmail}"
url = "http://${config.serverIp}"
location = "${config.location}"
motd = "${config.motd}"
worldType = "${config.worldType}"

-- Map Settings (Yurots Classic)
mapName = "${config.mapName}"
mapAuthor = "${config.mapAuthor}"

-- Rates Configuration
rateExp = ${config.rateExp}
rateSkill = ${config.rateSkill}
rateLoot = ${config.rateLoot}
rateMagic = ${config.rateMagic}
rateSpawn = ${config.rateSpawn}

-- MySQL / MariaDB Database Connection
sqlType = "mysql"
sqlHost = "${config.mysqlHost}"
sqlPort = ${config.mysqlPort}
sqlUser = "${config.mysqlUser}"
sqlPass = "${config.mysqlPass}"
sqlDatabase = "${config.mysqlDatabase}"
encryptionType = "sha1"

-- Gameplay & PVP (Classic 7.72)
stamina = true
freePremium = false
classicEquipmentSlots = true
pushCreatureDelay = 1000
stairhopDelay = 2000

-- Frags and Skull System
killsToRedSkull = 5
killsToBlackSkull = 10
pzLocked = 60 * 1000
whiteSkullTime = 15 * 60 * 1000
redSkullLength = 3 * 24 * 60 * 60

-- House settings
housePriceEachSQM = 1000
houseRentPeriod = "never"
cleanProtectionZones = true
`;
}

export function generateTfsSchemaSql(config: ServerConfig): string {
  return `-- TFS Database Schema for Tibia 7.72 (Yurots)
-- Database: ${config.mysqlDatabase}
-- Compatible with MariaDB 10.6+ and MySQL 8.0+

CREATE DATABASE IF NOT EXISTS \`${config.mysqlDatabase}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`${config.mysqlDatabase}\`;

-- Accounts Table
CREATE TABLE IF NOT EXISTS \`accounts\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(32) NOT NULL,
  \`password\` VARCHAR(40) NOT NULL,
  \`secret\` CHAR(16) NULL,
  \`type\` INT UNSIGNED NOT NULL DEFAULT 1,
  \`premdays\` INT NOT NULL DEFAULT 0,
  \`lastday\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`email\` VARCHAR(255) NOT NULL DEFAULT '',
  \`creation\` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Players Table
CREATE TABLE IF NOT EXISTS \`players\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`group_id\` INT NOT NULL DEFAULT 1,
  \`account_id\` INT UNSIGNED NOT NULL,
  \`level\` INT NOT NULL DEFAULT 1,
  \`vocation\` INT NOT NULL DEFAULT 0,
  \`health\` INT NOT NULL DEFAULT 150,
  \`healthmax\` INT NOT NULL DEFAULT 150,
  \`experience\` BIGINT NOT NULL DEFAULT 0,
  \`lookbody\` INT NOT NULL DEFAULT 0,
  \`lookfeet\` INT NOT NULL DEFAULT 0,
  \`lookhead\` INT NOT NULL DEFAULT 0,
  \`looklegs\` INT NOT NULL DEFAULT 0,
  \`looktype\` INT NOT NULL DEFAULT 136,
  \`lookaddons\` INT NOT NULL DEFAULT 0,
  \`maglevel\` INT NOT NULL DEFAULT 0,
  \`mana\` INT NOT NULL DEFAULT 0,
  \`manamax\` INT NOT NULL DEFAULT 0,
  \`manaspent\` BIGINT NOT NULL DEFAULT 0,
  \`soul\` INT UNSIGNED NOT NULL DEFAULT 100,
  \`town_id\` INT NOT NULL DEFAULT 1,
  \`posx\` INT NOT NULL DEFAULT 160,
  \`posy\` INT NOT NULL DEFAULT 54,
  \`posz\` INT NOT NULL DEFAULT 7,
  \`conditions\` BLOB NULL,
  \`cap\` INT NOT NULL DEFAULT 400,
  \`sex\` INT NOT NULL DEFAULT 1,
  \`lastlogin\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`lastip\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`save\` TINYINT(1) NOT NULL DEFAULT 1,
  \`skull\` TINYINT(1) NOT NULL DEFAULT 0,
  \`skulltime\` BIGINT NOT NULL DEFAULT 0,
  \`lastlogout\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`blessings\` TINYINT NOT NULL DEFAULT 0,
  \`onlinetime\` BIGINT NOT NULL DEFAULT 0,
  \`deletion\` BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`name\` (\`name\`),
  KEY \`account_id\` (\`account_id\`),
  KEY \`vocation\` (\`vocation\`),
  CONSTRAINT \`players_account_fk\` FOREIGN KEY (\`account_id\`) REFERENCES \`accounts\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Player Skills Table
CREATE TABLE IF NOT EXISTS \`player_skills\` (
  \`player_id\` INT UNSIGNED NOT NULL,
  \`skillid\` TINYINT NOT NULL DEFAULT 0,
  \`value\` INT UNSIGNED NOT NULL DEFAULT 10,
  \`count\` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (\`player_id\`, \`skillid\`),
  CONSTRAINT \`player_skills_fk\` FOREIGN KEY (\`player_id\`) REFERENCES \`players\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default Town (Yurots Temple)
CREATE TABLE IF NOT EXISTS \`towns\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`posx\` INT NOT NULL DEFAULT 160,
  \`posy\` INT NOT NULL DEFAULT 54,
  \`posz\` INT NOT NULL DEFAULT 7,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO \`towns\` (\`id\`, \`name\`, \`posx\`, \`posy\`, \`posz\`) VALUES (1, 'Yurots', 160, 54, 7);

-- Seed Initial GOD Account (1 / 1) and Character
INSERT IGNORE INTO \`accounts\` (\`id\`, \`name\`, \`password\`, \`type\`, \`premdays\`, \`email\`, \`creation\`)
VALUES (1, '1', SHA1('1'), 5, 365, 'god@yurots80.com', UNIX_TIMESTAMP());

INSERT IGNORE INTO \`players\` (\`id\`, \`name\`, \`group_id\`, \`account_id\`, \`level\`, \`vocation\`, \`health\`, \`healthmax\`, \`experience\`, \`looktype\`, \`maglevel\`, \`mana\`, \`manamax\`, \`town_id\`, \`posx\`, \`posy\`, \`posz\`, \`cap\`, \`sex\`)
VALUES (1, 'GOD Yurots', 5, 1, 300, 1, 1850, 1850, 44250000, 302, 110, 9000, 9000, 1, 160, 54, 7, 3000, 1);
`;
}

export interface YurotsRepoInfo {
  name: string;
  githubUrl: string;
  author: string;
  engine: string;
  protocol: string;
  features: {
    title: string;
    description: string;
    tag: string;
  }[];
}

export const YUROTS_REPO_DATA: YurotsRepoInfo = {
  name: 'MARLEYOT 7.72 Old School',
  githubUrl: '#',
  author: 'MARLEYOT Staff',
  engine: 'The Forgotten Server 1.2 / Nostalrius Core C++',
  protocol: 'Tibia 7.72 (Old School Retro)',
  features: [
    {
      title: 'Sistema de Gemas de Encantamento (Até 100 Gemas)',
      description: 'Até 100 gemas por arma! Ataque e Defesa sem limites. Roubo de Vida, Roubo de Mana e Acerto Crítico travam no teto balanceado de 50% cada, direcionando todo o excedente para ataque e defesa!',
      tag: 'Custom C++ & Lua'
    },
    {
      title: 'Fast Attack Proporcional ao Fist Fighting',
      description: 'Cada 1 ponto na habilidade de Fist Fighting acelera a velocidade de ataque físico em 1%. Com 100 de Fist, o personagem atinge velocidade dobrada (2 hits por turno)!',
      tag: 'Mecânica Exclusiva'
    },
    {
      title: 'Mercado Pessoal (Lojistas Offline no Depot)',
      description: 'Jogadores podem montar pequenos lojistas (shopkeepers) no Depot para comprar e vender itens automaticamente, mesmo deslogados ou sem janela de trade aberta.',
      tag: 'Economia Dinâmica'
    },
    {
      title: 'Double Experience System & Shared Party EXP',
      description: 'Sistema nativo para eventos de Double EXP configuráveis via comando/config.lua e partilha balanceada de experiência em grupo (Shared Party).',
      tag: 'Jogabilidade'
    },
    {
      title: 'Quiver (Aljava de Munições)',
      description: 'Suporte à aljava no inventário para paladinos carregarem flechas e virotes sem ocupar a mão de escudo.',
      tag: 'Paladin QoL'
    },
    {
      title: 'Mapa Clássico YurOTS Nostálgico Integrado',
      description: 'Mapa original completo com o templo sagrado dos tapetes azuis, Depot central, sala de teleports, montanha dos Wyrms, Dragon Lair e Annihilator.',
      tag: 'Mapa Nostálgico'
    }
  ]
};

export const TIBIA_80_SPELLS = SPELLS_80;
export const TIBIA_80_MONSTERS = MONSTERS_80;

