import { env } from '$env/dynamic/private';

interface TursoColumn {
  name: string;
  decltype?: string | null;
}

interface TursoExecuteResult {
  cols?: TursoColumn[];
  columns?: TursoColumn[];
  rows?: unknown[][];
  rowsAffected?: number | string;
  affectedRowCount?: number | string;
  lastInsertRowid?: number | string | null;
}

interface TursoPipelineExecuteResult {
  type: 'execute';
  result?: TursoExecuteResult;
  error?: { message?: string };
}

interface TursoPipelineErrorResult {
  type: string;
  error: { message?: string };
  result?: TursoExecuteResult;
}

interface TursoPipelineResponse {
  results?: Array<TursoPipelineExecuteResult | TursoPipelineErrorResult>;
}

class TursoConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TursoConfigurationError';
  }
}

class TursoRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TursoRequestError';
  }
}

const toHttpsUrl = (databaseUrl: string): string => {
  if (databaseUrl.startsWith('http://') || databaseUrl.startsWith('https://')) {
    return databaseUrl;
  }

  if (databaseUrl.startsWith('libsql://')) {
    return databaseUrl.replace('libsql://', 'https://');
  }

  throw new TursoConfigurationError(`Unsupported Turso URL protocol: ${databaseUrl}`);
};

const getCredentials = () => {
  const url = env.TURSO_DATABASE_URL;
  const authToken = env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new TursoConfigurationError(
      'Turso credentials are not configured. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.'
    );
  }

  return { url: toHttpsUrl(url), authToken };
};

const request = async (sql: string, args: unknown[] = []) => {
  const { url, authToken } = getCredentials();

  const response = await fetch(`${url}/v2/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql,
            args,
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new TursoRequestError(
      `Turso responded with ${response.status} ${response.statusText}${detail ? `: ${detail}` : ''}`
    );
  }

  const payload = (await response.json()) as TursoPipelineResponse;
  const [firstResult] = payload.results ?? [];

  if (!firstResult) {
    throw new TursoRequestError('Received an empty response from Turso.');
  }

  if ('error' in firstResult && firstResult.error) {
    throw new TursoRequestError(firstResult.error.message ?? 'Unknown Turso error.');
  }

  if (!('result' in firstResult) || !firstResult.result) {
    throw new TursoRequestError('Turso response did not include a result payload.');
  }

  return firstResult.result;
};

const mapRows = (result: TursoExecuteResult) => {
  const columns = (result.cols ?? result.columns ?? []).map((column, index) => column?.name ?? `column_${index}`);
  const rows = result.rows ?? [];

  return rows.map((row) => {
    const entry: Record<string, unknown> = {};
    row.forEach((value, index) => {
      const key = columns[index] ?? `column_${index}`;
      entry[key] = value;
    });
    return entry;
  });
};

export const execute = async (sql: string, args: unknown[] = []) => {
  const result = await request(sql, args);
  return {
    rows: mapRows(result),
    rowsAffected: Number(result.rowsAffected ?? result.affectedRowCount ?? 0),
    lastInsertRowid: result.lastInsertRowid ? Number(result.lastInsertRowid) : undefined,
  };
};

export const executeWithoutRows = async (sql: string, args: unknown[] = []) => {
  const result = await request(sql, args);
  return {
    rowsAffected: Number(result.rowsAffected ?? result.affectedRowCount ?? 0),
    lastInsertRowid: result.lastInsertRowid ? Number(result.lastInsertRowid) : undefined,
  };
};

export class TursoError extends Error {}
export { TursoConfigurationError, TursoRequestError };
