import { execute } from './turso';

export interface CommandRecord {
  id: number;
  content: string;
  created_at: string;
}

let schemaPromise: Promise<void> | null = null;

const ensureSchema = (): Promise<void> => {
  if (!schemaPromise) {
    schemaPromise = execute(
      `CREATE TABLE IF NOT EXISTS command_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
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

export const listCommands = async (limit = 50): Promise<CommandRecord[]> => {
  await ensureSchema();
  const { rows } = await execute(
    `SELECT id, content, created_at
     FROM command_history
     ORDER BY datetime(created_at) DESC, id DESC
     LIMIT ?`,
    [limit]
  );

  return rows.map((row) => ({
    id: Number(row.id),
    content: String(row.content ?? ''),
    created_at: String(row.created_at ?? ''),
  }));
};

export const createCommand = async (content: string): Promise<CommandRecord> => {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error('Command cannot be empty.');
  }

  await ensureSchema();

  const { rows } = await execute(
    `INSERT INTO command_history (content)
     VALUES (?)
     RETURNING id, content, created_at`,
    [trimmed]
  );

  const [row] = rows;
  if (!row) {
    throw new Error('Failed to create command record.');
  }

  return {
    id: Number(row.id),
    content: String(row.content ?? ''),
    created_at: String(row.created_at ?? ''),
  };
};
