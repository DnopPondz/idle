// ไฟล์: src/routes/players/+page.server.ts

import { db } from '$lib/server/db';
import { players } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    const allPlayers = await db.select().from(players);
    return {
        players: allPlayers
    };
};

export const actions: Actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const name = data.get('name');

        if (!name || typeof name !== 'string' || name.length < 3) {
            return fail(400, { error: 'Name must be at least 3 characters long.' });
        }

        try {
            await db.insert(players).values({
                name: name,
            });
        } catch (error) {
            console.error(error);
            return fail(500, { error: 'Could not create a new player.' });
        }

        return { success: true };
    }
};