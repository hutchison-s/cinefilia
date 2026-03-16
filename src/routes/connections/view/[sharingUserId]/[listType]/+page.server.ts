import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ConnectionService } from '$lib/server/connection';
import { Profile } from '$lib/server/profile';
import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/auth.schema';
import { eq } from 'drizzle-orm';

function isListType(value: string): value is 'watched' | 'watch-next' {
  return value === 'watched' || value === 'watch-next';
}

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!isListType(params.listType)) {
    throw error(404, 'Shared list not found.');
  }

  const canView = await ConnectionService.hasConnection(locals.user!.id, params.sharingUserId);

  if (!canView) {
    throw error(403, 'You do not have access to this shared list.');
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

  const profile = Profile.forUser(owner.id);
  const items =
    params.listType === 'watched'
      ? await profile.watched.list()
      : await profile.watchNext.list();

  return {
    owner,
    listType: params.listType,
    items: items.map((item) => ({
      id: item.mediaId,
      title: item.title,
      posterPath: item.posterPath || undefined,
      releaseYear: item.releaseYear || undefined,
      rating: 'rating' in item && item.rating ? Number(item.rating) : undefined
    }))
  };
};
