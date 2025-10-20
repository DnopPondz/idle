import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCommand, listCommands } from '$lib/server/commands';
import { TursoConfigurationError, TursoRequestError } from '$lib/server/turso';

export const GET: RequestHandler = async () => {
  try {
    const commands = await listCommands();
    return json({ commands });
  } catch (error) {
    if (error instanceof TursoConfigurationError) {
      return json(
        {
          error: 'ยังไม่ได้ตั้งค่า TURSO_DATABASE_URL หรือ TURSO_AUTH_TOKEN สำหรับการเชื่อมต่อฐานข้อมูล',
        },
        { status: 503 }
      );
    }

    if (error instanceof TursoRequestError) {
      return json({ error: error.message }, { status: 502 });
    }

    const message = error instanceof Error ? error.message : 'Unexpected error fetching commands.';
    return json({ error: message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { command } = body as { command?: unknown };

    if (typeof command !== 'string') {
      return json({ error: 'A command string is required.' }, { status: 400 });
    }

    const record = await createCommand(command);
    return json({ command: record }, { status: 201 });
  } catch (error) {
    if (error instanceof TursoConfigurationError) {
      return json(
        {
          error: 'ยังไม่ได้ตั้งค่า TURSO_DATABASE_URL หรือ TURSO_AUTH_TOKEN สำหรับการเชื่อมต่อฐานข้อมูล',
        },
        { status: 503 }
      );
    }

    if (error instanceof TursoRequestError) {
      return json({ error: error.message }, { status: 502 });
    }

    const message = error instanceof Error ? error.message : 'Unexpected error saving the command.';
    return json({ error: message }, { status: 500 });
  }
};
