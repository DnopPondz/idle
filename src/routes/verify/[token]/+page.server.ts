import type { PageServerLoad } from './$types';
import { verifyPlayerByToken } from '$lib/server/players';
import { TursoConfigurationError, TursoRequestError } from '$lib/server/turso';

export const load: PageServerLoad = async ({ params }) => {
  const token = params.token ?? '';

  try {
    const player = await verifyPlayerByToken(token);
    return {
      success: true,
      player: {
        username: player.username,
        playerName: player.playerName,
      },
    } as const;
  } catch (error) {
    if (error instanceof TursoConfigurationError) {
      return {
        success: false,
        error:
          'ยังไม่ได้ตั้งค่า TURSO_DATABASE_URL หรือ TURSO_AUTH_TOKEN สำหรับการเชื่อมต่อฐานข้อมูล',
      } as const;
    }

    if (error instanceof TursoRequestError) {
      return {
        success: false,
        error: error.message,
      } as const;
    }

    const message = error instanceof Error ? error.message : 'ไม่สามารถยืนยันอีเมลได้';
    return { success: false, error: message } as const;
  }
};
