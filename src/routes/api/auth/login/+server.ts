import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authenticatePlayer } from '$lib/server/players';
import { TursoConfigurationError, TursoRequestError } from '$lib/server/turso';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { username, password } = body as Record<string, unknown>;

    if (typeof username !== 'string' || !username.trim()) {
      return json({ error: 'กรุณาระบุชื่อผู้ใช้' }, { status: 400 });
    }

    if (typeof password !== 'string' || !password) {
      return json({ error: 'กรุณาระบุรหัสผ่าน' }, { status: 400 });
    }

    const player = await authenticatePlayer(username, password);

    if (!player.verified) {
      return json({ error: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ' }, { status: 403 });
    }

    return json({
      message: 'เข้าสู่ระบบสำเร็จ! เตรียมพร้อมผจญภัยใน Idle MMO ได้เลย',
      player: {
        id: player.id,
        username: player.username,
        email: player.email,
        playerName: player.playerName,
      },
    });
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

    const message = error instanceof Error ? error.message : 'ไม่สามารถเข้าสู่ระบบได้';
    return json({ error: message }, { status: 400 });
  }
};
