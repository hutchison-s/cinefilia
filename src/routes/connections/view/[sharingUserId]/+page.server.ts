import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ConnectionService } from '$lib/server/connection';
import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/auth.schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, params }) => {
  const isConnected = await ConnectionService.hasConnection(locals.user!.id, params.sharingUserId);

  if (!isConnected) {
    throw error(403, 'You do not have access to this shared connection.');
  }

  const [owner] = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email
    })
    .from(userTable)
    .where(eq(userTable.id, params.sharingUserId))
    .limit(1);

  if (!owner) {
    throw error(404, 'List owner not found.');
  }

  return {
    owner,
    availableLists: {
      watched: true,
      watchNext: true
    }
  };
};
