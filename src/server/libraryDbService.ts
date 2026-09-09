import { Pool } from 'mysql2/promise';

export interface DbSpell {
  id: string;
  name: string;
  words: string;
  level: number;
  mana: number;
  price: number;
  vocations: string[];
  type: string;
  premium: boolean;
  description: string;
}

export interface DbMonster {
  id: string;
  name: string;
  health: number;
  experience: number;
  difficulty: string;
  summonable: boolean;
  loot: string[];
  location: string;
  notes: string;
}

export interface DbLocation {
  id: string;
  title: string;
  category: string;
  recommendedLevel: string;
  description: string;
  features: string[];
  coordinates: string;
}

export interface DbRate {
  key: string;
  value: string;
  description: string;
}

// Catálogo Oficial de Spells Protocolo 7.72
export const DEFAULT_772_SPELLS: DbSpell[] = [
  {
    id: 'exura',
    name: 'Light Healing',
    words: 'exura',
    level: 9,
    mana: 25,
    price: 170,
    vocations: ['Sorcerer', 'Druid', 'Paladin'],
    type: 'Healing',
    premium: false,
    description: 'Cura leve básica essencial para economizar mana no início de jornada.',
  },
  {
    id: 'exura-gran',
    name: 'Intense Healing',
    words: 'exura gran',
    level: 11,
    mana: 70,
    price: 350,
    vocations: ['Sorcerer', 'Druid', 'Paladin'],
    type: 'Healing',
    premium: false,
    description: 'Cura de média intensidade indispensável para Paladins e Mages em hunts normais.',
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
    description: 'Restaura a barra de vida por completo dos magos. Magia crucial em perigos extremos.',
  },
  {
    id: 'exana-pox',
    name: 'Cure Poison',
    words: 'exana pox',
    level: 10,
    mana: 30,
    price: 200,
    vocations: ['Sorcerer', 'Druid', 'Paladin', 'Knight'],
    type: 'Healing',
    premium: false,
    description: 'Remove envenenamentos causados por Scorpions, Slimes, Snakes e Spiders.',
  },
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
    description: 'Golpe circular icônico do Knight no protocolo 7.72, acertando todos os alvos ao redor.',
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
    description: 'Dispara um choque concentrado de energia no alvo frontal.',
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
    description: 'Rajada incandescente que queima o monstro adjacente.',
  },
  {
    id: 'exori-mort',
    name: 'Death Strike',
    words: 'exori mort',
    level: 16,
    mana: 20,
    price: 1000,
    vocations: ['Sorcerer', 'Druid'],
    type: 'Attack',
    premium: true,
    description: 'Disparo de dano físico/morte de curto alcance.',
  },
  {
    id: 'exevo-gran-mas-flam',
    name: 'Hell\'s Core (Ultimate Explosion)',
    words: 'exevo gran mas flam',
    level: 60,
    mana: 1200,
    price: 8000,
    vocations: ['Sorcerer'],
    type: 'Attack',
    premium: true,
    description: 'A mais famosa e temida Ultimate Explosion (UE) de fogo da história do Tibia 7.72.',
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
    description: 'Tempestade elétrica devastadora que atinge toda a tela do jogador.',
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
    description: 'Terremoto de raízes e espinhos que atinge todos os monstros na tela.',
  },
  {
    id: 'exevo-pan',
    name: 'Create Food',
    words: 'exevo pan',
    level: 14,
    mana: 120,
    price: 500,
    vocations: ['Druid', 'Paladin'],
    type: 'Support',
    premium: false,
    description: 'Conjura alimentos frescos (pães, queijos, uvas) para recuperação contínua.',
  },
  {
    id: 'utamo-vita',
    name: 'Magic Shield',
    words: 'utamo vita',
    level: 14,
    mana: 50,
    price: 450,
    vocations: ['Sorcerer', 'Druid'],
    type: 'Support',
    premium: false,
    description: 'Faz todo o dano recebido ser absorvido pela mana ao invés da vida.',
  },
  {
    id: 'utani-hur',
    name: 'Haste',
    words: 'utani hur',
    level: 14,
    mana: 60,
    price: 600,
    vocations: ['Sorcerer', 'Druid', 'Paladin', 'Knight'],
    type: 'Support',
    premium: true,
    description: 'Acelera significativamente a velocidade de movimento do personagem.',
  },
  {
    id: 'utani-gran-hur',
    name: 'Strong Haste',
    words: 'utani gran hur',
    level: 20,
    mana: 100,
    price: 1300,
    vocations: ['Sorcerer', 'Druid'],
    type: 'Support',
    premium: true,
    description: 'Super velocidade lendária dos magos ("Time").',
  },
  {
    id: 'adura-vita',
    name: 'Ultimate Healing Rune (UH)',
    words: 'adura vita',
    level: 24,
    mana: 400,
    price: 1500,
    vocations: ['Druid'],
    type: 'Rune',
    premium: false,
    description: 'A runa pilar do 7.72. Cura volumosa usada no target ou chão por Knights e Mages.',
  },
  {
    id: 'adori-gran',
    name: 'Sudden Death Rune (SD)',
    words: 'adori gran',
    level: 45,
    mana: 885,
    price: 3000,
    vocations: ['Sorcerer'],
    type: 'Rune',
    premium: false,
    description: 'Dano de morte concentrado e fulminante. A arma suprema de PVP no 7.72.',
  },
  {
    id: 'adori-tera',
    name: 'Heavy Magic Missile (HMM)',
    words: 'adori tera',
    level: 25,
    mana: 280,
    price: 1500,
    vocations: ['Sorcerer', 'Druid'],
    type: 'Rune',
    premium: false,
    description: 'Runa clássica de projéteis múltiplos de energia para caçadas de Dragons e Behemoths.',
  },
  {
    id: 'adevo-grav-vita',
    name: 'Wild Growth',
    words: 'adevo grav vita',
    level: 27,
    mana: 220,
    price: 2000,
    vocations: ['Druid'],
    type: 'Rune',
    premium: true,
    description: 'Cria uma barreira de arbustos intransponíveis para trapar inimigos em guerras e PVP.',
  },
  {
    id: 'adevo-mas-hur',
    name: 'Magic Wall Rune',
    words: 'adevo mas hur',
    level: 32,
    mana: 750,
    price: 2100,
    vocations: ['Sorcerer'],
    type: 'Rune',
    premium: true,
    description: 'Runa lendária de bloqueio tático temporal para fechamento de corredores no PVP.',
  },
];

// Catálogo Oficial de Monstros 7.72
export const DEFAULT_772_MONSTERS: DbMonster[] = [
  {
    id: 'demon',
    name: 'Demon',
    health: 8200,
    experience: 6000,
    difficulty: 'Difícil',
    summonable: false,
    loot: ['Magic Plate Armor', 'Mastermind Shield', 'Demon Shield', 'Fire Axe', 'Golden Legs', 'Ice Rapier'],
    location: 'Yurots Demon Hell, Annihilator, POI',
    notes: 'O monstro mais emblemático do Tibia 7.72. Causa dano massivo de Great Fireball e Energy Beam.',
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
    notes: 'A caçada clássica de Knights e Mages para avanço frenético de níveis no Yurots.',
  },
  {
    id: 'dragon',
    name: 'Dragon',
    health: 1000,
    experience: 700,
    difficulty: 'Médio',
    summonable: false,
    loot: ['Dragon Hammer', 'Dragon Shield', 'Broadsword', 'Serpent Sword', 'Steel Helmet'],
    location: 'Yurots Dragon Lair Oeste',
    notes: 'Monstro lendário de transição do mid-game. Exige cuidado com fire wave frontal.',
  },
  {
    id: 'giant-spider',
    name: 'Giant Spider',
    health: 790,
    experience: 900,
    difficulty: 'Médio',
    summonable: false,
    loot: ['Knight Legs', 'Knight Armor', 'Platinum Amulet', 'Time Ring'],
    location: 'Floresta Sul de Yurots & PoI Entrance',
    notes: 'Famosa pela velocidade avassaladora e summons de Poison Spiders. Perigo fatal para low levels.',
  },
  {
    id: 'behemoth',
    name: 'Behemoth',
    health: 4000,
    experience: 2500,
    difficulty: 'Difícil',
    summonable: false,
    loot: ['Giant Sword', 'Titan Axe', 'Steel Boots', 'Crowbar'],
    location: 'Montanha Profunda dos Ciclopes',
    notes: 'Gigante com força bruta esmagadora. Arremessa pedras pesadas à distância.',
  },
  {
    id: 'warlock',
    name: 'Warlock',
    health: 3500,
    experience: 4000,
    difficulty: 'Difícil',
    summonable: false,
    loot: ['Golden Armor', 'Skull Staff', 'Blue Robe', 'Ring of the Sky', 'Energy Ring'],
    location: 'Yurots Warlock Sanctuary & Demona',
    notes: 'Mago supremo com invisibilidade frequente, Energy Waves e summons de Stone Golems.',
  },
  {
    id: 'hero',
    name: 'Hero',
    health: 1400,
    experience: 1200,
    difficulty: 'Médio',
    summonable: false,
    loot: ['Crown Armor', 'Crown Shield', 'Crown Legs', 'Fire Sword'],
    location: 'Hero Cave no subsolo leste',
    notes: 'Guerreiro de elite que ataca de perto com flechas e flechas mágicas.',
  },
  {
    id: 'black-knight',
    name: 'Black Knight',
    health: 1800,
    experience: 1600,
    difficulty: 'Médio',
    summonable: false,
    loot: ['Knight Armor', 'Knight Axe', 'Boots of Haste', 'Warrior Helmet'],
    location: 'Black Knight Villa Subsolo',
    notes: 'Cavaleiro solitário com lança pesada, ataque de veneno e velocidade moderada.',
  },
  {
    id: 'ferumbras',
    name: 'Ferumbras',
    health: 35000,
    experience: 12000,
    difficulty: 'Boss',
    summonable: false,
    loot: ['Ferumbras\' Hat', 'Great Shield', 'Demon Armor', 'Mastermind Shield', 'Teddy Bear'],
    location: 'Torre Proibida de Kharos',
    notes: 'O maior arquinimigo da história do Tibia. Invoca Demons contínuos e casta tempestades de fogo.',
  },
  {
    id: 'orshabaal',
    name: 'Orshabaal',
    health: 22500,
    experience: 10000,
    difficulty: 'Boss',
    summonable: false,
    loot: ['Thunder Hammer', 'Demon Helmet', 'Demon Shield', 'Silver Mace'],
    location: 'Entrada de Edron / Pits de Yurots',
    notes: 'O primeiro grande boss a desafiar servidores inteiros. Exige coordenação estrita de shooters e bloker.',
  },
  {
    id: 'morgaroth',
    name: 'Morgaroth',
    health: 45000,
    experience: 15000,
    difficulty: 'Boss',
    summonable: false,
    loot: ['Great Axe', 'Demonwing Axe', 'Chain Bolter', 'The Stomper'],
    location: 'Vulcão dos Ruthless Seven',
    notes: 'General demoníaco que cura a si mesmo e invoca Demon minions quando enfurecido.',
  },
];

// Catálogo Oficial de Localizações Yurots 7.72
export const DEFAULT_772_LOCATIONS: DbLocation[] = [
  {
    id: 'templo-yurots',
    title: 'Templo Central de Yurots',
    category: 'Cidade',
    recommendedLevel: 'Nível 1+',
    description: 'Ponto de respawn e renascimento com tapetes azuis e NPC de cura no protocolo 7.72.',
    features: ['Área de Proteção (PZ)', 'Tapetes clássicos', 'Depot conectado', 'Acesso direto aos Teleports'],
    coordinates: 'X: 160, Y: 54, Z: 7',
  },
  {
    id: 'sala-teleports',
    title: 'Sala de Teleports de Caça',
    category: 'Hunt',
    recommendedLevel: 'Nível 8 ao 200+',
    description: 'O marco dos servidores Yurots dos anos 2000: portais que levam instantaneamente às melhores áreas de monstros.',
    features: ['Rotworms (Iniciantes)', 'Dragon Lair', 'Giant Spiders', 'Demons', 'Warlocks', 'Frost Dragons'],
    coordinates: 'X: 160, Y: 40, Z: 7',
  },
  {
    id: 'annihilator-quest',
    title: 'Annihilator Quest 7.72',
    category: 'Quest',
    recommendedLevel: 'Nível 100+',
    description: 'A sala mais aterrorizante da história de Tibia: 4 jogadores cercados por 6 Demons em um corredor apertado.',
    features: ['Demon Armor', 'Magic Sword (Sovel)', 'Stonecutter Axe', 'Annihilator Bear'],
    coordinates: 'X: 245, Y: 180, Z: 13',
  },
  {
    id: 'demon-helmet-quest',
    title: 'Demon Helmet Quest (DH)',
    category: 'Quest',
    recommendedLevel: 'Nível 100+',
    description: 'A lendária sala das alavancas vigiada por Demons, Banshees e Fire Elementals.',
    features: ['Demon Helmet', 'Steel Boots', 'Shield of Honour'],
    coordinates: 'X: 210, Y: 195, Z: 12',
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
    recommendedLevel: 'Todos os níveis',
    description: 'Monks imortais para treino contínuo de skills de Sword, Axe, Club e Distância.',
    features: ['Anti-Push Tiles', 'Regeneração instantânea dos Monks', 'Proteção contra PK'],
    coordinates: 'X: 180, Y: 60, Z: 8',
  },
];

export const DEFAULT_772_RATES: DbRate[] = [
  { key: 'rate_exp', value: '50', description: 'Multiplicador de Experiência ao abater monstros' },
  { key: 'rate_skill', value: '25', description: 'Velocidade de avanço de armas (Sword, Axe, Club, Distance, Shielding)' },
  { key: 'rate_magic', value: '12', description: 'Velocidade de avanço em Magic Level com mana consumida' },
  { key: 'rate_loot', value: '3', description: 'Multiplicador de chance de drop de equipamentos e ouro' },
  { key: 'rate_spawn', value: '2', description: 'Velocidade de reaparecimento de monstros no mapa' },
  { key: 'protocol_version', value: '7.72', description: 'Protocolo de Rede e Mecânicas de Combate' },
  { key: 'pvp_type', value: 'Open-PVP', description: 'PVP clássico com UH no target/chão e skulls balanceadas' },
];

/**
 * Cria tabelas caso não existam no MySQL yurots_db
 */
export async function ensureLibraryTables(pool: Pool): Promise<void> {
  const conn = await pool.getConnection();
  try {
    // 1. Spells Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`library_spells\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`words\` VARCHAR(100) NOT NULL,
        \`level\` INT NOT NULL DEFAULT 1,
        \`mana\` INT NOT NULL DEFAULT 0,
        \`price\` INT NOT NULL DEFAULT 0,
        \`vocations\` TEXT NOT NULL,
        \`type\` VARCHAR(50) NOT NULL DEFAULT 'Attack',
        \`premium\` TINYINT(1) NOT NULL DEFAULT 0,
        \`description\` TEXT,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Monsters Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`library_monsters\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`health\` INT NOT NULL DEFAULT 100,
        \`experience\` INT NOT NULL DEFAULT 100,
        \`difficulty\` VARCHAR(50) NOT NULL DEFAULT 'Médio',
        \`summonable\` TINYINT(1) NOT NULL DEFAULT 0,
        \`loot\` TEXT NOT NULL,
        \`location\` TEXT NOT NULL,
        \`notes\` TEXT,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Locations Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`library_locations\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`title\` VARCHAR(100) NOT NULL,
        \`category\` VARCHAR(50) NOT NULL DEFAULT 'Hunt',
        \`recommended_level\` VARCHAR(50) NOT NULL DEFAULT 'Nível 1+',
        \`description\` TEXT NOT NULL,
        \`features\` TEXT NOT NULL,
        \`coordinates\` VARCHAR(100) NOT NULL DEFAULT 'X: 160, Y: 54, Z: 7',
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Rates & Rules Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`library_rates\` (
        \`rate_key\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`rate_value\` VARCHAR(100) NOT NULL,
        \`description\` TEXT,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed Spells if empty
    const [spellRows]: any = await conn.query('SELECT COUNT(*) as count FROM `library_spells`');
    if (spellRows && spellRows[0] && spellRows[0].count === 0) {
      console.log('[Library] Seeding library_spells with 7.72 spells in MySQL...');
      for (const spell of DEFAULT_772_SPELLS) {
        await conn.query(
          `INSERT INTO \`library_spells\` (\`id\`, \`name\`, \`words\`, \`level\`, \`mana\`, \`price\`, \`vocations\`, \`type\`, \`premium\`, \`description\`)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`), \`words\`=VALUES(\`words\`);`,
          [
            spell.id,
            spell.name,
            spell.words,
            spell.level,
            spell.mana,
            spell.price,
            JSON.stringify(spell.vocations),
            spell.type,
            spell.premium ? 1 : 0,
            spell.description,
          ]
        );
      }
    }

    // Seed Monsters if empty
    const [monRows]: any = await conn.query('SELECT COUNT(*) as count FROM `library_monsters`');
    if (monRows && monRows[0] && monRows[0].count === 0) {
      console.log('[Library] Seeding library_monsters with 7.72 monsters in MySQL...');
      for (const m of DEFAULT_772_MONSTERS) {
        await conn.query(
          `INSERT INTO \`library_monsters\` (\`id\`, \`name\`, \`health\`, \`experience\`, \`difficulty\`, \`summonable\`, \`loot\`, \`location\`, \`notes\`)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);`,
          [
            m.id,
            m.name,
            m.health,
            m.experience,
            m.difficulty,
            m.summonable ? 1 : 0,
            JSON.stringify(m.loot),
            m.location,
            m.notes,
          ]
        );
      }
    }

    // Seed Locations if empty
    const [locRows]: any = await conn.query('SELECT COUNT(*) as count FROM `library_locations`');
    if (locRows && locRows[0] && locRows[0].count === 0) {
      console.log('[Library] Seeding library_locations with 7.72 locations in MySQL...');
      for (const l of DEFAULT_772_LOCATIONS) {
        await conn.query(
          `INSERT INTO \`library_locations\` (\`id\`, \`title\`, \`category\`, \`recommended_level\`, \`description\`, \`features\`, \`coordinates\`)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE \`title\`=VALUES(\`title\`);`,
          [
            l.id,
            l.title,
            l.category,
            l.recommendedLevel,
            l.description,
            JSON.stringify(l.features),
            l.coordinates,
          ]
        );
      }
    }

    // Seed Rates if empty
    const [rateRows]: any = await conn.query('SELECT COUNT(*) as count FROM `library_rates`');
    if (rateRows && rateRows[0] && rateRows[0].count === 0) {
      console.log('[Library] Seeding library_rates with 7.72 rates in MySQL...');
      for (const r of DEFAULT_772_RATES) {
        await conn.query(
          `INSERT INTO \`library_rates\` (\`rate_key\`, \`rate_value\`, \`description\`)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE \`rate_value\`=VALUES(\`rate_value\`);`,
          [r.key, r.value, r.description]
        );
      }
    }
  } finally {
    conn.release();
  }
}

/**
 * Lê todos os dados da biblioteca do banco de dados MySQL
 */
export async function fetchLibraryData(pool: Pool | null): Promise<{
  source: 'mysql' | 'cache_772';
  dbConnected: boolean;
  spells: DbSpell[];
  monsters: DbMonster[];
  locations: DbLocation[];
  rates: DbRate[];
}> {
  if (!pool) {
    return {
      source: 'cache_772',
      dbConnected: false,
      spells: DEFAULT_772_SPELLS,
      monsters: DEFAULT_772_MONSTERS,
      locations: DEFAULT_772_LOCATIONS,
      rates: DEFAULT_772_RATES,
    };
  }

  try {
    await ensureLibraryTables(pool);
    const conn = await pool.getConnection();
    try {
      // 1. Spells
      const [rawSpells]: any = await conn.query('SELECT * FROM `library_spells` ORDER BY `level` ASC, `name` ASC');
      const spells: DbSpell[] = (rawSpells || []).map((row: any) => {
        let vocs: string[] = [];
        try {
          vocs = typeof row.vocations === 'string' ? JSON.parse(row.vocations) : row.vocations;
        } catch {
          vocs = [row.vocations];
        }
        return {
          id: row.id,
          name: row.name,
          words: row.words,
          level: Number(row.level),
          mana: Number(row.mana),
          price: Number(row.price),
          vocations: Array.isArray(vocs) ? vocs : [],
          type: row.type || 'Attack',
          premium: Boolean(row.premium),
          description: row.description || '',
        };
      });

      // 2. Monsters
      const [rawMonsters]: any = await conn.query('SELECT * FROM `library_monsters` ORDER BY `experience` DESC');
      const monsters: DbMonster[] = (rawMonsters || []).map((row: any) => {
        let loot: string[] = [];
        try {
          loot = typeof row.loot === 'string' ? JSON.parse(row.loot) : row.loot;
        } catch {
          loot = [row.loot];
        }
        return {
          id: row.id,
          name: row.name,
          health: Number(row.health),
          experience: Number(row.experience),
          difficulty: row.difficulty || 'Médio',
          summonable: Boolean(row.summonable),
          loot: Array.isArray(loot) ? loot : [],
          location: row.location || '',
          notes: row.notes || '',
        };
      });

      // 3. Locations
      const [rawLocations]: any = await conn.query('SELECT * FROM `library_locations` ORDER BY `id` ASC');
      const locations: DbLocation[] = (rawLocations || []).map((row: any) => {
        let features: string[] = [];
        try {
          features = typeof row.features === 'string' ? JSON.parse(row.features) : row.features;
        } catch {
          features = [row.features];
        }
        return {
          id: row.id,
          title: row.title,
          category: row.category || 'Hunt',
          recommendedLevel: row.recommended_level || 'Nível 1+',
          description: row.description || '',
          features: Array.isArray(features) ? features : [],
          coordinates: row.coordinates || '',
        };
      });

      // 4. Rates
      const [rawRates]: any = await conn.query('SELECT * FROM `library_rates` ORDER BY `rate_key` ASC');
      const rates: DbRate[] = (rawRates || []).map((row: any) => ({
        key: row.rate_key,
        value: row.rate_value,
        description: row.description || '',
      }));

      return {
        source: 'mysql',
        dbConnected: true,
        spells: spells.length > 0 ? spells : DEFAULT_772_SPELLS,
        monsters: monsters.length > 0 ? monsters : DEFAULT_772_MONSTERS,
        locations: locations.length > 0 ? locations : DEFAULT_772_LOCATIONS,
        rates: rates.length > 0 ? rates : DEFAULT_772_RATES,
      };
    } finally {
      conn.release();
    }
  } catch (err: any) {
    console.warn('[Library DB] Failed to read from MySQL tables, falling back to cached 7.72 data:', err.message);
    return {
      source: 'cache_772',
      dbConnected: false,
      spells: DEFAULT_772_SPELLS,
      monsters: DEFAULT_772_MONSTERS,
      locations: DEFAULT_772_LOCATIONS,
      rates: DEFAULT_772_RATES,
    };
  }
}

/**
 * Força a re-sincronização do catálogo 7.72 no banco de dados MySQL
 */
export async function resetLibraryTo772(pool: Pool): Promise<{ success: boolean; message: string }> {
  const conn = await pool.getConnection();
  try {
    await ensureLibraryTables(pool);
    // Limpa e reinsere
    await conn.query('DELETE FROM `library_spells`');
    for (const spell of DEFAULT_772_SPELLS) {
      await conn.query(
        `INSERT INTO \`library_spells\` (\`id\`, \`name\`, \`words\`, \`level\`, \`mana\`, \`price\`, \`vocations\`, \`type\`, \`premium\`, \`description\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          spell.id,
          spell.name,
          spell.words,
          spell.level,
          spell.mana,
          spell.price,
          JSON.stringify(spell.vocations),
          spell.type,
          spell.premium ? 1 : 0,
          spell.description,
        ]
      );
    }

    await conn.query('DELETE FROM `library_monsters`');
    for (const m of DEFAULT_772_MONSTERS) {
      await conn.query(
        `INSERT INTO \`library_monsters\` (\`id\`, \`name\`, \`health\`, \`experience\`, \`difficulty\`, \`summonable\`, \`loot\`, \`location\`, \`notes\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.id,
          m.name,
          m.health,
          m.experience,
          m.difficulty,
          m.summonable ? 1 : 0,
          JSON.stringify(m.loot),
          m.location,
          m.notes,
        ]
      );
    }

    await conn.query('DELETE FROM `library_locations`');
    for (const l of DEFAULT_772_LOCATIONS) {
      await conn.query(
        `INSERT INTO \`library_locations\` (\`id\`, \`title\`, \`category\`, \`recommended_level\`, \`description\`, \`features\`, \`coordinates\`)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          l.id,
          l.title,
          l.category,
          l.recommendedLevel,
          l.description,
          JSON.stringify(l.features),
          l.coordinates,
        ]
      );
    }

    await conn.query('DELETE FROM `library_rates`');
    for (const r of DEFAULT_772_RATES) {
      await conn.query(
        `INSERT INTO \`library_rates\` (\`rate_key\`, \`rate_value\`, \`description\`)
         VALUES (?, ?, ?)`,
        [r.key, r.value, r.description]
      );
    }

    return { success: true, message: 'Catálogo de magias, monstros, locais e rates 7.72 sincronizado com sucesso no MySQL!' };
  } finally {
    conn.release();
  }
}
