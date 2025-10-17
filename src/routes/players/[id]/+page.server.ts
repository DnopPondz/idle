// src/routes/players/[id]/+page.server.ts

import { db } from '$lib/server/db';
import { players } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm'; // นำเข้า 'eq' สำหรับการเปรียบเทียบ
import { error } from '@sveltejs/kit'; // นำเข้า 'error' สำหรับหน้า 404
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const playerId = parseInt(params.id, 10);

    // ตรวจสอบว่า id ที่ได้มาเป็นตัวเลขที่ถูกต้องหรือไม่
    if (isNaN(playerId)) {
        throw error(404, 'Not found');
    }

    // ใช้ Drizzle เพื่อค้นหาผู้เล่นที่มี id ตรงกับที่ระบุใน URL
    const playerResult = await db.select()
        .from(players)
        .where(eq(players.id, playerId));

    // Drizzle จะคืนค่าเป็น array เสมอ, ดังนั้นเราจึงต้องเอาตัวแรก
    const player = playerResult[0];

    // ถ้าไม่พบผู้เล่นในฐานข้อมูล ให้ส่งหน้า 404 Not Found
    if (!player) {
        throw error(404, 'Player not found');
    }

    // ส่งข้อมูลผู้เล่นที่พบไปให้หน้า +page.svelte
    return {
        player: player
    };
};