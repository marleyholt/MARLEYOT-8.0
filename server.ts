import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
import { createServer as createViteServer } from 'vite';
import { fetchLibraryData, resetLibraryTo772 } from './src/server/libraryDbService';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// MySQL configuration and connection pool (lazy / fault-tolerant)
interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

let dbConfig: DbConfig = {
  host: process.env.MYSQL_HOST || '137.131.196.66',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'MARLEY22@@##',
  database: process.env.MYSQL_DATABASE || 'yurots_db',
};

let pool: Pool | null = null;
let dbConnected = false;
let dbLastError: string | null = null;

async function tryConnectWithCredentials(user: string, pass: string): Promise<Pool | null> {
  const testPool = mysql.createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user,
    password: pass,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 3500,
  });
  const conn = await testPool.getConnection();
  await conn.ping();
  conn.release();
  dbConfig.user = user;
  dbConfig.password = pass;
  return testPool;
}

async function initOrGetPool(): Promise<Pool | null> {
  if (pool && dbConnected) return pool;
  try {
    if (pool) {
      try { await pool.end(); } catch {}
      pool = null;
    }

    // Try primary config first
    const candidates = [
      { user: dbConfig.user, pass: dbConfig.password },
      { user: 'yurots_user', pass: 'MARLEY22@@##' },
      { user: 'yurots_user', pass: 'Yurots80Secret!' },
      { user: 'root', pass: 'MARLEY22@@##' },
      { user: 'root', pass: 'Yurots80Secret!' },
    ];

    let lastCandidateErr: any = null;
    for (const c of candidates) {
      try {
        const successfulPool = await tryConnectWithCredentials(c.user, c.pass);
        if (successfulPool) {
          pool = successfulPool;
          dbConnected = true;
          dbLastError = null;
          console.log(`[DB] Connected successfully to MySQL at ${dbConfig.host}:${dbConfig.port} as '${c.user}' (${dbConfig.database})`);
          return pool;
        }
      } catch (err: any) {
        lastCandidateErr = err;
        // If it's a network timeout or connection refused, breaking early avoids wasting time
        if (err?.code === 'ETIMEDOUT' || err?.code === 'ECONNREFUSED') {
          throw err;
        }
      }
    }

    if (lastCandidateErr) {
      throw lastCandidateErr;
    }
    return null;
  } catch (err: any) {
    dbConnected = false;
    let friendly = err?.message || String(err);
    if (err?.code === 'ETIMEDOUT') {
      friendly = `Tempo esgotado ao conectar em ${dbConfig.host}:${dbConfig.port}. A porta 3306 pode estar bloqueada no firewall da Oracle Cloud (VCN Ingress) ou no iptables da VPS.`;
    } else if (err?.code === 'ECONNREFUSED') {
      friendly = `Conexão recusada em ${dbConfig.host}:${dbConfig.port}. O MariaDB/MySQL está com bind-address local ou parado. Altere para bind-address = 0.0.0.0 no /etc/mysql/ e reinicie o serviço.`;
    } else if (err?.code === 'ER_ACCESS_DENIED_ERROR') {
      friendly = `Acesso negado para o usuário '${dbConfig.user}'. Verifique a senha ou execute: GRANT ALL PRIVILEGES ON ${dbConfig.database}.* TO '${dbConfig.user}'@'%' IDENTIFIED BY 'senha';`;
    } else if (err?.code === 'ER_BAD_DB_ERROR') {
      friendly = `Banco de dados '${dbConfig.database}' não encontrado na VPS.`;
    }
    dbLastError = friendly;
    console.warn(`[DB] Failed to connect to MySQL at ${dbConfig.host}:${dbConfig.port}:`, dbLastError);
    return null;
  }
}

async function configureAndTestDb(newConfig: Partial<DbConfig>) {
  if (newConfig.host !== undefined) dbConfig.host = String(newConfig.host).trim();
  if (newConfig.port !== undefined) dbConfig.port = Number(newConfig.port) || 3306;
  if (newConfig.user !== undefined) dbConfig.user = String(newConfig.user).trim();
  if (newConfig.password !== undefined) dbConfig.password = String(newConfig.password);
  if (newConfig.database !== undefined) dbConfig.database = String(newConfig.database).trim();

  try {
    if (pool) {
      try { await pool.end(); } catch {}
      pool = null;
    }
    pool = mysql.createPool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 5000,
    });
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    dbConnected = true;
    dbLastError = null;
    return { 
      success: true, 
      message: `Conexão estabelecida com sucesso ao banco '${dbConfig.database}' em ${dbConfig.host}:${dbConfig.port}!` 
    };
  } catch (err: any) {
    dbConnected = false;
    let friendly = err?.message || 'Erro desconhecido ao conectar ao MySQL.';
    if (err?.code === 'ETIMEDOUT') {
      friendly = `Tempo esgotado ao conectar em ${dbConfig.host}:${dbConfig.port}. A porta 3306 pode estar bloqueada no firewall da Oracle Cloud (VCN Ingress) ou no iptables da VPS.`;
    } else if (err?.code === 'ECONNREFUSED') {
      friendly = `Conexão recusada em ${dbConfig.host}:${dbConfig.port}. O MariaDB pode estar parado ou com bind-address = 127.0.0.1 (altere para 0.0.0.0 no /etc/mysql/mariadb.conf.d/50-server.cnf).`;
    } else if (err?.code === 'ER_ACCESS_DENIED_ERROR') {
      friendly = `Acesso negado para o usuário '${dbConfig.user}'. Verifique se a senha está correta e se o usuário tem permissão remota (ex: 'root'@'%' ou 'tfs'@'%').`;
    } else if (err?.code === 'ER_BAD_DB_ERROR') {
      friendly = `Banco de dados '${dbConfig.database}' não encontrado na VPS. Verifique o nome do schema.`;
    }
    dbLastError = friendly;
    return { success: false, message: friendly, error: err?.message, code: err?.code };
  }
}

// ---------------- API ROUTES ----------------

// 0. Database Configuration & Live Test
app.get('/api/database/config', (req: Request, res: Response) => {
  res.json({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    hasPassword: Boolean(dbConfig.password),
    connected: dbConnected,
    lastError: dbLastError,
  });
});

app.post('/api/database/connect', async (req: Request, res: Response) => {
  const result = await configureAndTestDb(req.body);
  res.json({
    ...result,
    config: {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      hasPassword: Boolean(dbConfig.password),
      connected: dbConnected,
      lastError: dbLastError,
    }
  });
});

// 1. Server & Database Status
app.get('/api/status', async (req: Request, res: Response) => {
  const currentPool = await initOrGetPool();
  let onlineCount = 0;
  let totalPlayers = 0;
  let totalAccounts = 0;

  if (currentPool && dbConnected) {
    try {
      // Use players_online table first to show ONLY players who are actually connected right now
      try {
        const [onlineRows]: any = await currentPool.query("SELECT COUNT(*) as count FROM players_online");
        onlineCount = onlineRows[0]?.count || 0;
      } catch {
        const [fallbackOnline]: any = await currentPool.query(
          "SELECT COUNT(*) as count FROM players WHERE lastlogin > lastlogout"
        );
        onlineCount = fallbackOnline[0]?.count || 0;
      }

      const [playerRows]: any = await currentPool.query("SELECT COUNT(*) as count FROM players");
      totalPlayers = playerRows[0]?.count || 0;

      const [accRows]: any = await currentPool.query("SELECT COUNT(*) as count FROM accounts");
      totalAccounts = accRows[0]?.count || 0;
    } catch (e: any) {
      console.warn('[Status] query failed:', e.message);
    }
  }

  res.json({
    status: 'online',
    serverName: 'MARLEYOT 7.72 Old School',
    serverIp: dbConfig.host,
    loginPort: 7171,
    gamePort: 7172,
    version: '7.72 (Old School Protocol Engine)',
    map: 'Yurots 12000x12000 (Temple: 5999, 6045, 7)',
    database: {
      connected: dbConnected,
      host: dbConfig.host,
      databaseName: dbConfig.database,
      source: dbConnected ? 'mysql' : 'disconnected',
      lastError: dbLastError,
    },
    onlineCount,
    totalPlayers,
    totalAccounts,
    rates: {
      exp: '15x (stages)',
      skills: '25x (Fist Fast Attack)',
      magic: '10x',
      loot: '3x',
    }
  });
});

// 2. Who is Online List - Only genuinely connected players
app.get('/api/online', async (req: Request, res: Response) => {
  const currentPool = await initOrGetPool();

  if (!currentPool || !dbConnected) {
    return res.json({ 
      success: true, 
      source: 'mysql', 
      connected: false, 
      players: [],
      message: 'Banco de dados MySQL desconectado. Conecte ao banco de dados para ver os jogadores online em tempo real.'
    });
  }

  try {
    let rows: any[] = [];
    try {
      const [onlineRows]: any = await currentPool.query(
        `SELECT p.id, p.name, p.group_id, p.level, p.vocation, p.looktype, p.sex, p.lastlogin, p.onlinetime 
         FROM players p 
         INNER JOIN players_online po ON p.id = po.player_id 
         ORDER BY p.level DESC LIMIT 100`
      );
      rows = onlineRows;
    } catch (tblErr) {
      // Fallback only if players_online table not found
      const [fallbackRows]: any = await currentPool.query(
        `SELECT id, name, group_id, level, vocation, looktype, sex, lastlogin, onlinetime 
         FROM players 
         WHERE lastlogin > lastlogout 
         ORDER BY level DESC LIMIT 100`
      );
      rows = fallbackRows;
    }
    return res.json({ success: true, source: 'mysql', connected: true, players: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, connected: true, error: err.message, players: [] });
  }
});

// 3. Highscores
app.get('/api/highscores', async (req: Request, res: Response) => {
  const category = (req.query.category as string) || 'level';
  const vocation = req.query.vocation as string;
  const currentPool = await initOrGetPool();

  if (!currentPool || !dbConnected) {
    return res.json({
      success: true,
      source: 'mysql',
      connected: false,
      category,
      players: [],
      message: 'Banco de dados MySQL desconectado. Conecte ao banco de dados para consultar o ranking real.'
    });
  }

  let sortColumn = 'experience';
  if (category === 'maglevel') sortColumn = 'maglevel';
  else if (category === 'sword') sortColumn = 'skill_sword';
  else if (category === 'axe') sortColumn = 'skill_axe';
  else if (category === 'club') sortColumn = 'skill_club';
  else if (category === 'dist') sortColumn = 'skill_dist';
  else if (category === 'shield') sortColumn = 'skill_shielding';
  else if (category === 'fishing') sortColumn = 'skill_fishing';
  else sortColumn = 'experience';

  try {
    let query = `
      SELECT id, name, group_id, level, vocation, maglevel, looktype, sex,
             skill_sword, skill_axe, skill_club, skill_dist, skill_shielding, skill_fishing, experience
      FROM players 
      WHERE group_id < 4
    `;
    const params: any[] = [];
    if (vocation && vocation !== 'all') {
      query += ' AND vocation = ?';
      params.push(Number(vocation));
    }
    query += ` ORDER BY ${sortColumn} DESC, level DESC LIMIT 50`;

    const [rows]: any = await currentPool.query(query, params);
    return res.json({ success: true, source: 'mysql', connected: true, category, players: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message, players: [] });
  }
});

// 4. Register Account
app.post('/api/accounts/register', async (req: Request, res: Response) => {
  const { account, password } = req.body;
  const trimmedAcc = String(account || '').trim();
  const trimmedPass = String(password || '').trim();

  if (!trimmedAcc || trimmedAcc.length < 3) {
    return res.status(400).json({ success: false, message: 'O número ou nome da conta deve ter pelo menos 3 caracteres.' });
  }
  if (!trimmedPass || trimmedPass.length < 4) {
    return res.status(400).json({ success: false, message: 'A senha deve conter pelo menos 4 caracteres.' });
  }

  const currentPool = await initOrGetPool();
  if (!currentPool || !dbConnected) {
    return res.status(503).json({
      success: false,
      connected: false,
      message: `Não foi possível criar a conta: O banco MySQL não está conectado. Configure o IP e a senha da sua VPS no topo do site. Erro: ${dbLastError || 'Desconectado.'}`,
    });
  }

  const passHash = crypto.createHash('sha1').update(trimmedPass).digest('hex');

  try {
    // Check if account already exists
    const [existing]: any = await currentPool.query('SELECT id, name FROM accounts WHERE name = ? OR id = ?', [
      trimmedAcc,
      isNaN(Number(trimmedAcc)) ? -1 : Number(trimmedAcc),
    ]);

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: `A conta '${trimmedAcc}' já existe no banco de dados.` });
    }

    const accId = !isNaN(Number(trimmedAcc)) ? Number(trimmedAcc) : Math.floor(100000 + Math.random() * 900000);

    await currentPool.query(
      'INSERT INTO accounts (id, name, password, type, premdays, lastday) VALUES (?, ?, ?, 1, 30, 0)',
      [accId, trimmedAcc, passHash]
    );

    return res.json({
      success: true,
      message: 'Conta gravada com sucesso no MySQL! Pode entrar no OTClient e no site.',
      account: {
        id: accId,
        name: trimmedAcc,
        type: 1,
        premdays: 30,
      },
    });
  } catch (err: any) {
    console.error('[Register] Error inserting into MySQL:', err);
    return res.status(500).json({ success: false, message: 'Erro no banco MySQL: ' + (err.message || 'Falha ao salvar conta.') });
  }
});

// 5. Login Account
app.post('/api/accounts/login', async (req: Request, res: Response) => {
  const { account, password } = req.body;
  const trimmedAcc = String(account || '').trim();
  const trimmedPass = String(password || '').trim();

  if (!trimmedAcc || !trimmedPass) {
    return res.status(400).json({ success: false, message: 'Preencha o número/nome da conta e a senha.' });
  }

  const currentPool = await initOrGetPool();
  if (!currentPool || !dbConnected) {
    return res.status(503).json({
      success: false,
      connected: false,
      message: `Banco de dados MySQL não está conectado. Configure a conexão com a sua VPS para entrar na sua conta real. Detalhes: ${dbLastError || 'Desconectado.'}`,
    });
  }

  const passHash = crypto.createHash('sha1').update(trimmedPass).digest('hex');

  try {
    const [accRows]: any = await currentPool.query(
      'SELECT id, name, password, type, premdays FROM accounts WHERE (name = ? OR id = ?)',
      [trimmedAcc, isNaN(Number(trimmedAcc)) ? -1 : Number(trimmedAcc)]
    );

    if (accRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Conta '${trimmedAcc}' não encontrada no banco MySQL. Verifique o número digitado ou crie uma nova conta.`,
      });
    }

    const acc = accRows[0];
    const isPasswordValid =
      acc.password.toLowerCase() === passHash.toLowerCase() ||
      acc.password === trimmedPass;

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Senha incorreta para esta conta.' });
    }

    // Fetch characters from MySQL
    const [charRows]: any = await currentPool.query(
      `SELECT id, name, group_id, account_id, level, vocation, health, healthmax, 
              mana, manamax, maglevel, looktype, sex, town_id, posx, posy, posz 
       FROM players WHERE account_id = ?`,
      [acc.id]
    );

    return res.json({
      success: true,
      account: {
        id: acc.id,
        name: acc.name,
        type: acc.type,
        premdays: acc.premdays,
      },
      characters: charRows,
    });
  } catch (err: any) {
    console.error('[Login] MySQL error:', err);
    return res.status(500).json({ success: false, message: 'Erro no banco MySQL: ' + err.message });
  }
});

// 5.1 Change Account Password
app.post('/api/accounts/change-password', async (req: Request, res: Response) => {
  const { accountId, oldPassword, newPassword } = req.body;
  const trimmedNewPass = String(newPassword || '').trim();

  if (!trimmedNewPass || trimmedNewPass.length < 4) {
    return res.status(400).json({ success: false, message: 'A nova senha deve ter no mínimo 4 caracteres.' });
  }

  const currentPool = await initOrGetPool();
  if (!currentPool || !dbConnected) {
    return res.status(503).json({ success: false, message: 'Banco MySQL não conectado.' });
  }

  try {
    const [accRows]: any = await currentPool.query(
      'SELECT id, name, password FROM accounts WHERE id = ?',
      [accountId]
    );

    if (accRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Conta não encontrada.' });
    }

    if (oldPassword) {
      const oldHash = crypto.createHash('sha1').update(String(oldPassword).trim()).digest('hex');
      if (accRows[0].password.toLowerCase() !== oldHash.toLowerCase() && accRows[0].password !== oldPassword) {
        return res.status(401).json({ success: false, message: 'Senha atual incorreta.' });
      }
    }

    const newHash = crypto.createHash('sha1').update(trimmedNewPass).digest('hex');
    await currentPool.query('UPDATE accounts SET password = ? WHERE id = ?', [newHash, accountId]);

    return res.json({
      success: true,
      message: 'Senha alterada com sucesso no banco MySQL! Já pode usar no jogo e no site.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Erro ao alterar senha: ' + err.message });
  }
});

// 6. Create Character
app.post('/api/characters/create', async (req: Request, res: Response) => {
  const { accountId, name, sex, vocation } = req.body;
  const trimmedName = String(name || '').trim();

  if (!trimmedName || trimmedName.length < 3 || trimmedName.length > 25) {
    return res.status(400).json({ success: false, message: 'O nome do personagem deve ter de 3 a 25 caracteres.' });
  }

  const validVoc = [1, 2, 3, 4].includes(Number(vocation)) ? Number(vocation) : 1;
  const validSex = Number(sex) === 0 ? 0 : 1;
  const looktype = validSex === 1 ? 128 : 136; // Citizen outfit male/female

  const currentPool = await initOrGetPool();
  if (!currentPool || !dbConnected) {
    return res.status(503).json({
      success: false,
      connected: false,
      message: `Não foi possível criar o personagem: O banco MySQL não está conectado. Detalhes: ${dbLastError || 'Desconectado.'}`,
    });
  }

  try {
    // Check if character name is already taken
    const [existing]: any = await currentPool.query('SELECT id FROM players WHERE name = ?', [trimmedName]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: `O nome de personagem '${trimmedName}' já está em uso.` });
    }

    // Temple Coordinates confirmed: 5999, 6045, 7, town_id 1
    const [insertResult]: any = await currentPool.query(
      `INSERT INTO players (
        name, group_id, account_id, level, vocation, health, healthmax, experience, 
        lookbody, lookfeet, lookhead, looklegs, looktype, maglevel, mana, manamax, 
        manaspent, soul, town_id, posx, posy, posz, conditions, cap, sex, 
        lastlogin, lastip, save, skull, skulltime, lastlogout, blessings, 
        onlinetime, deletion
      ) VALUES (
        ?, 1, ?, 8, ?, 185, 185, 4200, 
        0, 0, 0, 0, ?, 0, 35, 35, 
        0, 100, 1, 5999, 6045, 7, '', 450, ?, 
        0, 0, 1, 0, 0, 0, 0, 
        0, 0
      )`,
      [trimmedName, accountId, validVoc, looktype, validSex]
    );

    const charId = insertResult.insertId;
    try {
      await currentPool.query(
        `INSERT INTO player_skills (player_id, skillid, value, count) VALUES 
         (?, 0, 10, 0), (?, 1, 10, 0), (?, 2, 10, 0), (?, 3, 10, 0), (?, 4, 10, 0), (?, 5, 10, 0), (?, 6, 10, 0)
         ON DUPLICATE KEY UPDATE value = 10`,
        [charId, charId, charId, charId, charId, charId, charId]
      );
    } catch (skillErr) {
      console.warn('[CreateChar] player_skills table optional or failed:', skillErr);
    }

    const newChar = {
      id: charId,
      name: trimmedName,
      group_id: 1,
      account_id: accountId,
      level: 8,
      vocation: validVoc,
      health: 185,
      healthmax: 185,
      mana: 35,
      manamax: 35,
      maglevel: 0,
      looktype,
      sex: validSex,
      town_id: 1,
      posx: 5999,
      posy: 6045,
      posz: 7,
    };

    return res.json({
      success: true,
      message: `Personagem '${trimmedName}' criado com sucesso no Templo (5999, 6045, 7)! Pode logar no OTClient!`,
      character: newChar,
    });
  } catch (err: any) {
    console.error('[CreateChar] MySQL error:', err);
    return res.status(500).json({ success: false, message: 'Erro ao criar personagem no MySQL: ' + err.message });
  }
});

// 6.1 Get Character Detailed Profile from Real MySQL
app.get('/api/characters/profile', async (req: Request, res: Response) => {
  const charName = String(req.query.name || '').trim();
  if (!charName) {
    return res.status(400).json({ success: false, message: 'Nome do personagem não informado.' });
  }

  const currentPool = await initOrGetPool();
  if (!currentPool || !dbConnected) {
    return res.status(503).json({
      success: false,
      message: `Banco MySQL desconectado. Erro: ${dbLastError || 'Desconectado.'}`,
    });
  }

  try {
    // 1. Fetch player base data
    const [playerRows]: any = await currentPool.query(
      `SELECT id, name, group_id, account_id, level, vocation, health, healthmax, 
              mana, manamax, maglevel, looktype, lookhead, lookbody, looklegs, lookfeet, 
              sex, town_id, posx, posy, posz, lastlogin 
       FROM players WHERE name = ? LIMIT 1`,
      [charName]
    );

    if (playerRows.length === 0) {
      return res.status(404).json({ success: false, message: `Personagem '${charName}' não encontrado no banco de dados.` });
    }

    const player = playerRows[0];

    // 2. Fetch account info (premium, etc)
    let account = {};
    try {
      const [accRows]: any = await currentPool.query(
        'SELECT id, name, premdays, type FROM accounts WHERE id = ? LIMIT 1',
        [player.account_id]
      );
      if (accRows.length > 0) account = accRows[0];
    } catch {}

    // 3. Fetch skills from player_skills or players table
    let skills: any = {
      maglevel: player.maglevel || 0,
      fist: 10,
      sword: 10,
      axe: 10,
      club: 10,
      dist: 10,
      shielding: 10,
      fishing: 10,
    };

    try {
      const [skillRows]: any = await currentPool.query(
        'SELECT skillid, value FROM player_skills WHERE player_id = ?',
        [player.id]
      );
      // OTServ skill ids: 0=fist, 1=club, 2=sword, 3=axe, 4=dist, 5=shield, 6=fishing
      for (const s of skillRows) {
        if (s.skillid === 0) skills.fist = s.value;
        if (s.skillid === 1) skills.club = s.value;
        if (s.skillid === 2) skills.sword = s.value;
        if (s.skillid === 3) skills.axe = s.value;
        if (s.skillid === 4) skills.dist = s.value;
        if (s.skillid === 5) skills.shielding = s.value;
        if (s.skillid === 6) skills.fishing = s.value;
      }
    } catch {
      // Fallback if player_skills table has different schema
    }

    // 4. Fetch player equipment (player_items table)
    let equipment: any[] = [];
    try {
      const slotNamesMap: Record<number, string> = {
        1: 'necklace',
        2: 'helmet',
        3: 'backpack',
        4: 'armor',
        5: 'weapon',
        6: 'shield',
        7: 'legs',
        8: 'boots',
        9: 'ring',
        10: 'ammo'
      };

      // Try flexible column selection in case schema uses item_id/slot instead of itemtype/pid
      let itemRows: any[] = [];
      try {
        const [rows]: any = await currentPool.query(
          'SELECT pid as slot_id, itemtype as item_id, count FROM player_items WHERE player_id = ? AND pid BETWEEN 1 AND 10',
          [player.id]
        );
        itemRows = rows;
      } catch {
        try {
          const [rows2]: any = await currentPool.query(
            'SELECT slot as slot_id, item_id, count FROM player_items WHERE player_id = ? AND slot BETWEEN 1 AND 10',
            [player.id]
          );
          itemRows = rows2;
        } catch {
          const [rows3]: any = await currentPool.query(
            'SELECT * FROM player_items WHERE player_id = ?',
            [player.id]
          );
          itemRows = rows3;
        }
      }

      for (const item of itemRows) {
        const slotId = item.slot_id !== undefined ? item.slot_id : (item.pid !== undefined ? item.pid : item.slot);
        const itemId = item.item_id !== undefined ? item.item_id : (item.itemtype !== undefined ? item.itemtype : 0);
        
        if (slotId >= 1 && slotId <= 10 && itemId > 0) {
          equipment.push({
            slot: slotNamesMap[slotId] || `slot_${slotId}`,
            slot_id: slotId,
            item_id: itemId,
            count: item.count || 1,
            name: `Item ID ${itemId}`
          });
        }
      }
    } catch (e) {
      console.warn('[Profile] player_items fetch error:', e);
    }

    // 5. Fetch house
    let house = null;
    try {
      const [houseRows]: any = await currentPool.query(
        'SELECT id, owner, paid, name, town FROM houses WHERE owner = ? LIMIT 1',
        [player.id]
      );
      if (houseRows.length > 0) house = houseRows[0];
    } catch {}

    // 6. Fetch deaths
    let deaths: any[] = [];
    try {
      const [deathRows]: any = await currentPool.query(
        'SELECT player_id, time, level, killer FROM player_deaths WHERE player_id = ? ORDER BY time DESC LIMIT 10',
        [player.id]
      );
      deaths = deathRows;
    } catch {}

    return res.json({
      success: true,
      character: {
        player,
        account,
        skills,
        equipment,
        house,
        deaths,
      }
    });
  } catch (err: any) {
    console.error('[Character Profile] Error:', err);
    return res.status(500).json({ success: false, message: 'Erro ao buscar perfil: ' + err.message });
  }
});

// 6.2 Get Server-wide Last Deaths
app.get('/api/server/deaths', async (req: Request, res: Response) => {
  const currentPool = await initOrGetPool();
  if (!currentPool || !dbConnected) {
    return res.status(503).json({ success: false, message: 'Banco MySQL desconectado.' });
  }

  try {
    let deaths: any[] = [];
    try {
      const [rows]: any = await currentPool.query(`
        SELECT d.player_id, d.time, d.level, d.killer, p.name as player_name 
        FROM player_deaths d 
        JOIN players p ON d.player_id = p.id 
        ORDER BY d.time DESC 
        LIMIT 30
      `);
      deaths = rows;
    } catch {
      // Fallback if joined query fails
      try {
        const [rows2]: any = await currentPool.query(`
          SELECT * FROM player_deaths ORDER BY time DESC LIMIT 30
        `);
        for (const r of rows2) {
          let playerName = `Player #${r.player_id}`;
          try {
            const [pRow]: any = await currentPool.query('SELECT name FROM players WHERE id = ?', [r.player_id]);
            if (pRow.length > 0) playerName = pRow[0].name;
          } catch {}
          deaths.push({
            player_name: playerName,
            level: r.level || 8,
            time: r.time || Math.floor(Date.now() / 1000),
            killer: r.killer || 'Monster'
          });
        }
      } catch {}
    }

    return res.json({ success: true, deaths });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Erro ao buscar mortes: ' + err.message });
  }
});

// 7. Delete Character
app.post('/api/characters/delete', async (req: Request, res: Response) => {
  const { characterId, accountId } = req.body;
  const currentPool = await initOrGetPool();

  if (!currentPool || !dbConnected) {
    return res.status(503).json({
      success: false,
      connected: false,
      message: 'Banco MySQL não conectado para remoção de personagem.',
    });
  }

  try {
    try {
      await currentPool.query('DELETE FROM players WHERE id = ? AND account_id = ?', [characterId, accountId]);
    } catch {
      await currentPool.query('UPDATE players SET deletion = 1 WHERE id = ? AND account_id = ?', [characterId, accountId]);
    }
    return res.json({ success: true, message: 'Personagem deletado com sucesso do banco MySQL.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Erro ao deletar: ' + err.message });
  }
});

// 8. Execute SQL Query directly on real MySQL
app.post('/api/sql/execute', async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, message: 'Comando SQL não informado.' });
  }

  const currentPool = await initOrGetPool();
  if (!currentPool || !dbConnected) {
    return res.status(503).json({
      success: false,
      connected: false,
      message: `Banco MySQL desconectado. Conecte ao MySQL para executar comandos SQL. Detalhes: ${dbLastError || 'Desconectado.'}`,
    });
  }

  try {
    const [result]: any = await currentPool.query(query);
    return res.json({
      success: true,
      message: 'Comando executado com sucesso no MySQL!',
      rows: Array.isArray(result) ? result : [result],
      affectedRows: result?.affectedRows,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: 'Erro na execução SQL: ' + err.message,
      error: err.message,
    });
  }
});

// 9. GM / Admin Character Management
// 9.1 List All Players with Account Info for GM
app.get('/api/admin/players', async (req: Request, res: Response) => {
  const currentPool = await initOrGetPool();
  if (!currentPool || !dbConnected) {
    return res.status(503).json({ success: false, message: 'Banco MySQL desconectado.' });
  }

  try {
    const [players]: any = await currentPool.query(`
      SELECT p.id, p.name, p.group_id, p.account_id, p.level, p.vocation, p.experience,
             p.health, p.healthmax, p.mana, p.manamax, p.maglevel, p.cap, p.sex, p.looktype,
             p.town_id, p.posx, p.posy, p.posz,
             p.skill_fist, p.skill_club, p.skill_sword, p.skill_axe, p.skill_dist, p.skill_shielding, p.skill_fishing,
             a.name as account_name, a.premdays as account_premdays, a.type as account_type
      FROM players p
      LEFT JOIN accounts a ON p.account_id = a.id
      ORDER BY p.level DESC LIMIT 500
    `);

    return res.json({ success: true, players });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Erro ao listar personagens: ' + err.message });
  }
});

// 9.2 Update Player and Account (Level, Skills, Name, Vocation/Promotion, Premdays, Health, Mana, Unstuck)
app.post('/api/admin/player/save', async (req: Request, res: Response) => {
  const currentPool = await initOrGetPool();
  if (!currentPool || !dbConnected) {
    return res.status(503).json({ success: false, message: 'Banco MySQL desconectado.' });
  }

  const {
    id,
    name,
    level,
    experience,
    maglevel,
    vocation,
    group_id,
    health,
    healthmax,
    mana,
    manamax,
    cap,
    skill_fist,
    skill_club,
    skill_sword,
    skill_axe,
    skill_dist,
    skill_shielding,
    skill_fishing,
    account_id,
    account_premdays,
    teleportToTemple,
  } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, message: 'ID do personagem é obrigatório.' });
  }

  try {
    // 1. Calculate Experience if level was modified and exp not explicitly passed
    let finalExp = Number(experience);
    const targetLevel = Number(level) || 1;
    if (isNaN(finalExp) || finalExp <= 0) {
      finalExp = Math.floor((50 / 3) * (Math.pow(targetLevel, 3) - 6 * Math.pow(targetLevel, 2) + 17 * targetLevel - 12));
      if (finalExp < 0) finalExp = 4200;
    }

    // 2. Build update query for player
    let updateSql = `
      UPDATE players SET
        name = ?,
        level = ?,
        experience = ?,
        maglevel = ?,
        vocation = ?,
        group_id = ?,
        health = ?,
        healthmax = ?,
        mana = ?,
        manamax = ?,
        cap = ?,
        skill_fist = ?,
        skill_club = ?,
        skill_sword = ?,
        skill_axe = ?,
        skill_dist = ?,
        skill_shielding = ?,
        skill_fishing = ?
    `;

    const params: any[] = [
      String(name || '').trim(),
      targetLevel,
      finalExp,
      Number(maglevel) || 0,
      Number(vocation) || 0,
      Number(group_id) || 1,
      Number(health) || 150,
      Number(healthmax) || 150,
      Number(mana) || 0,
      Number(manamax) || 0,
      Number(cap) || 400,
      Number(skill_fist) || 10,
      Number(skill_club) || 10,
      Number(skill_sword) || 10,
      Number(skill_axe) || 10,
      Number(skill_dist) || 10,
      Number(skill_shielding) || 10,
      Number(skill_fishing) || 10,
    ];

    if (teleportToTemple) {
      updateSql += `, posx = 5999, posy = 6045, posz = 7, town_id = 1`;
    }

    updateSql += ` WHERE id = ?`;
    params.push(Number(id));

    await currentPool.query(updateSql, params);

    // 3. Update account premium days if account_id is provided
    if (account_id && account_premdays !== undefined) {
      await currentPool.query(`UPDATE accounts SET premdays = ? WHERE id = ?`, [
        Number(account_premdays) || 0,
        Number(account_id),
      ]);
    }

    return res.json({
      success: true,
      message: `Personagem '${name}' e dados de conta atualizados com sucesso no banco MySQL!`,
    });
  } catch (err: any) {
    console.error('[Admin Player Save] Error:', err);
    return res.status(500).json({ success: false, message: 'Erro ao salvar alterações: ' + err.message });
  }
});

// Client Download Configuration (Persistent JSON file)
const CLIENT_CONFIG_FILE = path.join(process.cwd(), 'client-download.json');

interface ClientDownloadConfig {
  url: string;
  version: string;
  notes: string;
  updatedAt: string;
}

function getClientDownloadConfig(): ClientDownloadConfig {
  try {
    if (fs.existsSync(CLIENT_CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CLIENT_CONFIG_FILE, 'utf-8'));
      if (data && typeof data.url === 'string') {
        return data;
      }
    }
  } catch (e) {
    console.warn('Failed to read client-download.json', e);
  }
  return {
    url: '',
    version: '8.00 Custom YurOTS',
    notes: 'Cliente MarleyOT Yurots 8.00 com IP 137.131.196.66 pré-configurado.',
    updatedAt: new Date().toISOString(),
  };
}

function saveClientDownloadConfig(config: Partial<ClientDownloadConfig>): ClientDownloadConfig {
  const current = getClientDownloadConfig();
  const updated: ClientDownloadConfig = {
    url: typeof config.url === 'string' ? config.url.trim() : current.url,
    version: config.version || current.version,
    notes: config.notes !== undefined ? config.notes : current.notes,
    updatedAt: new Date().toISOString(),
  };
  try {
    fs.writeFileSync(CLIENT_CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to write client-download.json', e);
  }
  return updated;
}

// Client Download API endpoints
app.get('/api/client-download', (req: Request, res: Response) => {
  const config = getClientDownloadConfig();
  res.json({ success: true, ...config });
});

app.post('/api/client-download', (req: Request, res: Response) => {
  const { url, version, notes } = req.body || {};
  if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
    return res.status(400).json({ 
      success: false, 
      message: 'Por favor, informe uma URL válida com http:// ou https:// (ex: link do Mediafire, Google Drive, Mega).' 
    });
  }
  const updated = saveClientDownloadConfig({ url, version, notes });
  return res.json({ 
    success: true, 
    message: 'Link de download do cliente atualizado com sucesso!', 
    config: updated 
  });
});

// Direct redirection shortcut for players
app.get('/download/client', (req: Request, res: Response) => {
  const config = getClientDownloadConfig();
  if (config.url && config.url.startsWith('http')) {
    return res.redirect(config.url);
  }
  return res.redirect('/?tab=portal&subTab=download');
});

// Download portal bundle (.tar.gz) for VPS deployment
app.get('/api/download/portal-bundle', (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), 'public', 'marleyot-portal.tar.gz');
  if (fs.existsSync(filePath)) {
    return res.download(filePath, 'marleyot-portal.tar.gz');
  }
  return res.status(404).json({ success: false, message: 'Bundle não encontrado. Execute npm run build.' });
});

// ---------------- Marley Shop API Endpoints ----------------

// Get shop offers
app.get('/api/shop/offers', async (req: Request, res: Response) => {
  try {
    const currentPool = await initOrGetPool();
    if (!currentPool) {
      return res.json({ success: true, offers: [] });
    }
    const [rows]: any = await currentPool.query('SELECT * FROM shop_offers ORDER BY id DESC');
    return res.json({ success: true, offers: rows });
  } catch (err: any) {
    return res.json({ success: true, offers: [] });
  }
});

// GM: Add or Delete shop offer
app.post('/api/shop/offers', async (req: Request, res: Response) => {
  const { action, id, itemId, name, price, count } = req.body || {};
  try {
    const currentPool = await initOrGetPool();
    if (!currentPool) {
      return res.status(503).json({ success: false, message: 'Banco de dados não conectado.' });
    }

    if (action === 'delete') {
      await currentPool.query('DELETE FROM shop_offers WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Item removido da loja com sucesso!' });
    }

    if (action === 'add') {
      if (!itemId || !name || !price) {
        return res.status(400).json({ success: false, message: 'Informe Item ID, Nome e Preço.' });
      }
      await currentPool.query(
        'INSERT INTO shop_offers (item_id, name, price, count) VALUES (?, ?, ?, ?)',
        [Number(itemId), String(name), Number(price), Number(count || 1)]
      );
      return res.json({ success: true, message: 'Item adicionado à loja com sucesso!' });
    }

    return res.status(400).json({ success: false, message: 'Ação inválida.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Erro ao gerenciar ofertas da loja.' });
  }
});

// Get PIX Config
app.get('/api/shop/pix', async (req: Request, res: Response) => {
  try {
    const currentPool = await initOrGetPool();
    if (!currentPool) {
      return res.json({ success: true, pix: { qr_code_url: '', pix_key: 'marleyot@empresa.com' } });
    }
    const [rows]: any = await currentPool.query('SELECT * FROM pix_config WHERE id = 1');
    return res.json({ success: true, pix: rows[0] || { qr_code_url: '', pix_key: 'marleyot@empresa.com' } });
  } catch (err: any) {
    return res.json({ success: true, pix: { qr_code_url: '', pix_key: 'marleyot@empresa.com' } });
  }
});

// GM: Update PIX Config
app.post('/api/shop/pix', async (req: Request, res: Response) => {
  const { qr_code_url, pix_key } = req.body || {};
  try {
    const currentPool = await initOrGetPool();
    if (!currentPool) {
      return res.status(503).json({ success: false, message: 'Banco de dados não conectado.' });
    }
    await currentPool.query(
      'INSERT INTO pix_config (id, qr_code_url, pix_key) VALUES (1, ?, ?) ON DUPLICATE KEY UPDATE qr_code_url = ?, pix_key = ?',
      [String(qr_code_url || ''), String(pix_key || ''), String(qr_code_url || ''), String(pix_key || '')]
    );
    return res.json({ success: true, message: 'Configuração PIX atualizada com sucesso!' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Erro ao atualizar PIX.' });
  }
});

// GM: List accounts and coins
app.get('/api/admin/accounts-coins', async (req: Request, res: Response) => {
  try {
    const currentPool = await initOrGetPool();
    if (!currentPool) {
      return res.status(503).json({ success: false, message: 'Banco de dados não conectado.' });
    }
    const [rows]: any = await currentPool.query('SELECT id, name, coins FROM accounts ORDER BY id DESC LIMIT 50');
    return res.json({ success: true, accounts: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Erro ao listar contas.' });
  }
});

// GM: Adjust account coins
app.post('/api/admin/accounts-coins', async (req: Request, res: Response) => {
  const { accountId, amount, mode } = req.body || {}; // mode: 'set' | 'add' | 'sub'
  try {
    const currentPool = await initOrGetPool();
    if (!currentPool) {
      return res.status(503).json({ success: false, message: 'Banco de dados não conectado.' });
    }
    if (!accountId) {
      return res.status(400).json({ success: false, message: 'Conta não informada.' });
    }

    const val = Number(amount || 0);
    if (mode === 'set') {
      await currentPool.query('UPDATE accounts SET coins = ? WHERE id = ?', [val, accountId]);
    } else if (mode === 'sub') {
      await currentPool.query('UPDATE accounts SET coins = GREATEST(0, coins - ?) WHERE id = ?', [val, accountId]);
    } else {
      await currentPool.query('UPDATE accounts SET coins = coins + ? WHERE id = ?', [val, accountId]);
    }

    return res.json({ success: true, message: 'Pontos da conta atualizados com sucesso!' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Erro ao ajustar pontos.' });
  }
});

// Player: Buy shop offer and deliver to character depot
app.post('/api/shop/buy', async (req: Request, res: Response) => {
  const { accountId, characterName, offerId } = req.body || {};
  try {
    const currentPool = await initOrGetPool();
    if (!currentPool) {
      return res.status(503).json({ success: false, message: 'Banco de dados não conectado.' });
    }

    if (!accountId || !characterName || !offerId) {
      return res.status(400).json({ success: false, message: 'Dados incompletos para a compra.' });
    }

    // 1. Get offer details
    const [offerRows]: any = await currentPool.query('SELECT * FROM shop_offers WHERE id = ?', [offerId]);
    if (!offerRows || offerRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Oferta não encontrada.' });
    }
    const offer = offerRows[0];

    // 2. Get account coins
    const [accRows]: any = await currentPool.query('SELECT id, coins FROM accounts WHERE id = ?', [accountId]);
    if (!accRows || accRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Conta não encontrada.' });
    }
    const account = accRows[0];
    const currentCoins = Number(account.coins || 0);

    if (currentCoins < offer.price) {
      return res.status(400).json({ 
        success: false, 
        message: `Saldo insuficiente! Você tem ${currentCoins} Marley Points e o item custa ${offer.price} pontos.` 
      });
    }

    // 3. Get character id and check if belongs to account
    const [charRows]: any = await currentPool.query('SELECT id, account_id, name FROM players WHERE name = ? AND account_id = ?', [characterName, accountId]);
    if (!charRows || charRows.length === 0) {
      return res.status(404).json({ success: false, message: `Personagem '${characterName}' não pertence à sua conta.` });
    }
    const player = charRows[0];

    // 4. Deduct coins from account
    await currentPool.query('UPDATE accounts SET coins = coins - ? WHERE id = ?', [offer.price, accountId]);

    // 5. Deliver item to player depot / items table (pid = player.id, slot = 0 for depot or similar table schema)
    try {
      // Standard OTServ player_items structure: player_id, pid, sid, itemtype, count, attributes
      await currentPool.query(
        'INSERT INTO player_items (player_id, pid, sid, itemtype, count) VALUES (?, 0, 100, ?, ?)',
        [player.id, offer.item_id, offer.count || 1]
      );
    } catch (deliveryErr: any) {
      console.warn('[Shop Buy] Delivery to player_items fallback:', deliveryErr.message);
      // Fallback table structure check if player_id vs pid differs
      try {
        await currentPool.query(
          'INSERT INTO player_items (player_id, slot, item_id, count) VALUES (?, 0, ?, ?)',
          [player.id, offer.item_id, offer.count || 1]
        );
      } catch (e2: any) {
        console.warn('[Shop Buy] Second delivery fallback failed:', e2.message);
      }
    }

    return res.json({
      success: true,
      message: `Parabéns! Você comprou '${offer.name}' por ${offer.price} Marley Points. O item foi entregue no depot do personagem ${player.name}!`
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Erro ao processar a compra.' });
  }
});

// ---------------- Library Database Endpoints (Protocol 7.72) ----------------
app.get('/api/library/data', async (req: Request, res: Response) => {
  try {
    const currentPool = await initOrGetPool().catch(() => null);
    const data = await fetchLibraryData(currentPool);
    return res.json({
      success: true,
      database: dbConfig.database,
      host: dbConfig.host,
      ...data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err?.message || 'Erro ao carregar dados da biblioteca',
      error: String(err),
    });
  }
});

app.post('/api/library/sync', async (req: Request, res: Response) => {
  try {
    const currentPool = await initOrGetPool();
    if (!currentPool) {
      return res.status(503).json({
        success: false,
        message: 'Banco de dados MySQL não está conectado no momento. Conecte ao banco primeiro para sincronizar.',
      });
    }
    const result = await resetLibraryTo772(currentPool);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err?.message || 'Falha ao sincronizar biblioteca no banco',
      error: String(err),
    });
  }
});

// ---------------- Vite / Static Frontend ----------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MARLEYOT Portal] Server running on http://0.0.0.0:${PORT}`);
    initOrGetPool().catch((err: any) => {
      console.warn('[MARLEYOT Portal] Initial DB connection attempt:', err?.message || err);
    });
  });
}

startServer();
