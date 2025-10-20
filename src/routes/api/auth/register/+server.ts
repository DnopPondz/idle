import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createPlayer } from '$lib/server/players';
import { TursoConfigurationError, TursoRequestError } from '$lib/server/turso';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: RequestHandler = async ({ request, url }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      username,
      password,
      confirmPassword,
      email,
      playerName,
    } = body as Record<string, unknown>;

    if (typeof username !== 'string' || !username.trim()) {
      return json({ error: 'กรุณาระบุชื่อผู้ใช้' }, { status: 400 });
    }

    if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
      return json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' }, { status: 400 });
    }

    if (typeof playerName !== 'string' || !playerName.trim()) {
      return json({ error: 'กรุณาระบุชื่อผู้เล่น' }, { status: 400 });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return json({ error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }, { status: 400 });
    }

    if (typeof confirmPassword !== 'string' || password !== confirmPassword) {
      return json({ error: 'รหัสผ่านและการยืนยันไม่ตรงกัน' }, { status: 400 });
    }

    const player = await createPlayer({
      username,
      email,
      playerName,
      password,
    });

    const verificationToken = player.verificationToken ?? '';
    const verificationLink = verificationToken
      ? `${url.origin}/verify/${verificationToken}`
      : null;

    if (verificationLink) {
      console.info('Player verification link:', verificationLink);
    }

    return json(
      {
        message: 'สร้างบัญชีสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตนก่อนเข้าสู่ระบบ',
        verificationLink,
      },
      { status: 201 }
    );
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

    const message = error instanceof Error ? error.message : 'ไม่สามารถสร้างบัญชีได้';
    return json({ error: message }, { status: 400 });
  }
};
