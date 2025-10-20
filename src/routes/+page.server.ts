import type { PageServerLoad } from './$types';
import { listCommands } from '$lib/server/commands';
import { TursoConfigurationError, TursoRequestError } from '$lib/server/turso';

export const load: PageServerLoad = async () => {
  try {
    const history = await listCommands();
    return { history };
  } catch (error) {
    if (error instanceof TursoConfigurationError) {
      return {
        history: [],
        error: 'ยังไม่ได้ตั้งค่า TURSO_DATABASE_URL หรือ TURSO_AUTH_TOKEN สำหรับการเชื่อมต่อฐานข้อมูล',
      };
    }

    if (error instanceof TursoRequestError) {
      return { history: [], error: error.message };
    }

    const message = error instanceof Error ? error.message : 'Unable to load command history.';
    return { history: [], error: message };
  }
};
