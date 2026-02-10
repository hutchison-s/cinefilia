import { redirect } from '@sveltejs/kit';
import { Profile } from '$lib/server/profile';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  const profile = Profile.forUser(locals.user.id);
  const items = await profile.watched.list();

  return {
    items: items.map((item) => ({
      id: item.mediaId,
      title: item.title,
      posterPath: item.posterPath || undefined,
      releaseYear: item.releaseYear || undefined,
      rating: item.rating ? parseInt(item.rating) : undefined
    }))
  };
};
