import { execute } from './turso';

export interface PlayerRecord {
  id: number;
  username: string;
  email: string;
  playerName: string;
  verified: boolean;
}

export interface PlayerWithToken extends PlayerRecord {
  verificationToken: string | null;
}

let schemaPromise: Promise<void> | null = null;

const ensureSchema = (): Promise<void> => {
  if (!schemaPromise) {
    schemaPromise = execute(
      `CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE COLLATE NOCASE,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        player_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        verification_token TEXT,
        verified_at DATETIME,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    )
      .then(() => undefined)
      .catch((error) => {
        schemaPromise = null;
        throw error;
      });
  }

  return schemaPromise!;
};

const cryptoApi = globalThis.crypto;

if (!cryptoApi) {
  throw new Error('Crypto API is not available in this runtime.');
}

const encoder = new TextEncoder();

const randomHex = (length: number): string => {
  const bytes = new Uint8Array(length);
  cryptoApi.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const digestPassword = async (salt: string, password: string): Promise<string> => {
  const data = encoder.encode(`${salt}:${password}`);
  const hashBuffer = await cryptoApi.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

const constantTimeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return result === 0;
};

const hashPassword = async (password: string): Promise<string> => {
  const salt = randomHex(16);
  const digest = await digestPassword(salt, password);
  return `${salt}:${digest}`;
};

const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) {
    return false;
  }

  const digest = await digestPassword(salt, password);
  return constantTimeEqual(digest, hash);
};

const mapPlayerRow = (row: Record<string, unknown>): PlayerRecord => ({
  id: Number(row.id),
  username: String(row.username ?? ''),
  email: String(row.email ?? ''),
  playerName: String(row.player_name ?? ''),
  verified: row.verified_at != null,
});

export interface CreatePlayerInput {
  username: string;
  email: string;
  playerName: string;
  password: string;
}

export interface CreatePlayerResult extends PlayerWithToken {}

export const createPlayer = async (input: CreatePlayerInput): Promise<CreatePlayerResult> => {
  await ensureSchema();

  const username = input.username.trim();
  const email = input.email.trim();
  const playerName = input.playerName.trim();
  const password = input.password;

  if (!username) {
    throw new Error('ต้องระบุชื่อผู้ใช้');
  }

  if (!email) {
    throw new Error('ต้องระบุอีเมล');
  }

  if (!playerName) {
    throw new Error('ต้องระบุชื่อผู้เล่น');
  }

  if (password.length < 8) {
    throw new Error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
  }

  const existingUsername = await execute(
    `SELECT id FROM players WHERE username = ? COLLATE NOCASE LIMIT 1`,
    [username]
  );

  if (existingUsername.rows.length > 0) {
    throw new Error('ชื่อผู้ใช้นี้ถูกใช้แล้ว');
  }

  const existingEmail = await execute(
    `SELECT id FROM players WHERE email = ? COLLATE NOCASE LIMIT 1`,
    [email]
  );

  if (existingEmail.rows.length > 0) {
    throw new Error('อีเมลนี้ถูกใช้แล้ว');
  }

  const verificationToken = randomHex(32);
  const passwordHash = await hashPassword(password);

  const { rows } = await execute(
    `INSERT INTO players (username, email, player_name, password_hash, verification_token)
     VALUES (?, ?, ?, ?, ?)
     RETURNING id, username, email, player_name, verification_token, verified_at`,
    [username, email, playerName, passwordHash, verificationToken]
  );

  const [row] = rows;
  if (!row) {
    throw new Error('ไม่สามารถสร้างผู้เล่นได้');
  }

  return {
    ...mapPlayerRow(row),
    verificationToken: String(row.verification_token ?? ''),
  };
};

export const verifyPlayerByToken = async (token: string): Promise<PlayerRecord> => {
  await ensureSchema();

  const trimmed = token.trim();
  if (!trimmed) {
    throw new Error('โทเค็นไม่ถูกต้อง');
  }

  const { rows } = await execute(
    `UPDATE players
     SET verified_at = CURRENT_TIMESTAMP,
         verification_token = NULL
     WHERE verification_token = ?
     RETURNING id, username, email, player_name, verified_at`,
    [trimmed]
  );

  const [row] = rows;
  if (!row) {
    throw new Error('ไม่พบโทเค็นยืนยันตัวตนนี้');
  }

  return mapPlayerRow(row);
};

export const authenticatePlayer = async (
  username: string,
  password: string
): Promise<PlayerRecord> => {
  await ensureSchema();

  const trimmedUsername = username.trim();
  if (!trimmedUsername) {
    throw new Error('ต้องระบุชื่อผู้ใช้');
  }

  const { rows } = await execute(
    `SELECT id, username, email, player_name, password_hash, verified_at
     FROM players
     WHERE username = ? COLLATE NOCASE
     LIMIT 1`,
    [trimmedUsername]
  );

  const [row] = rows as Array<Record<string, unknown> & { password_hash?: string }>;
  if (!row || typeof row.password_hash !== 'string') {
    throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  }

  const isValidPassword = await verifyPassword(password, row.password_hash);
  if (!isValidPassword) {
    throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  }

  return mapPlayerRow(row);
};
