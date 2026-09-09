export type VocationId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface VocationInfo {
  id: VocationId;
  name: string;
  promotedName?: string;
  description: string;
  hpGain: number;
  manaGain: number;
  capGain: number;
  icon: string;
}

export interface PlayerCharacter {
  id: number;
  account_id: number;
  name: string;
  vocation: VocationId;
  level: number;
  experience: number;
  health: number;
  healthmax: number;
  mana: number;
  manamax: number;
  maglevel: number;
  sex: 0 | 1; // 0 = female, 1 = male
  town_id: number;
  town_name: string;
  online: boolean;
  group_id: number; // 1 = player, 2 = tutor, 3 = GM, 4 = Community Manager, 5 = GOD
  lastlogin: number;
  created: number;
  skills: {
    fist: number;
    club: number;
    sword: number;
    axe: number;
    dist: number;
    shield: number;
    fish: number;
  };
}

export interface Account {
  id: number;
  name: string; // Account Number / Name
  password_hash: string;
  email: string;
  premdays: number;
  coins: number;
  created: number;
  type: number; // 1 = standard, 5 = GOD
  characters: PlayerCharacter[];
}

export interface ServerConfig {
  serverName: string;
  serverIp: string;
  gamePort: number;
  loginPort: number;
  worldType: 'open-pvp' | 'optional-pvp' | 'hardcore-pvp';
  location: string;
  ownerName: string;
  ownerEmail: string;
  motd: string;
  rateExp: number;
  rateSkill: number;
  rateLoot: number;
  rateMagic: number;
  rateSpawn: number;
  mysqlHost: string;
  mysqlUser: string;
  mysqlPass: string;
  mysqlDatabase: string;
  mysqlPort: number;
  clientVersion: string;
  mapName: string;
  mapAuthor: string;
}

export interface SpellInfo {
  id: string;
  name: string;
  words: string;
  level: number;
  mana: number;
  price: number;
  vocations: string[];
  type: 'Attack' | 'Healing' | 'Support' | 'Rune' | 'Summon';
  premium: boolean;
  description: string;
}

export interface MonsterInfo {
  id: string;
  name: string;
  health: number;
  experience: number;
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Boss' | 'Lendário';
  summonable: boolean;
  loot: string[];
  location: string;
  notes: string;
}

export interface YurotsLocation {
  id: string;
  title: string;
  category: 'Cidade' | 'Hunt' | 'Quest' | 'Mistério';
  recommendedLevel: string;
  description: string;
  features: string[];
  coordinates: string;
}

export interface GuideStep {
  id: string;
  title: string;
  shortDesc: string;
  difficulty: 'Fácil' | 'Intermediário' | 'Importante';
  estimatedMinutes: number;
  content: {
    summary: string;
    instructions: string[];
    commands?: {
      label: string;
      cmd: string;
      desc?: string;
    }[];
    tips: string[];
    warning?: string;
  };
}

export interface DbConnectionInfo {
  host: string;
  port: number;
  user: string;
  database: string;
  hasPassword?: boolean;
  connected: boolean;
  lastError: string | null;
}

export interface ClientDownloadInfo {
  url: string;
  version: string;
  notes: string;
  updatedAt?: string;
}
