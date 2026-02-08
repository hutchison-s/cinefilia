import { Profile } from '$lib/server/profile';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;

  if (!user) {
    return { user: null };
  }

  const profile = Profile.forUser(user.id);

  const [watched, watchNext, reviews] = await Promise.all([
    profile.watched.list(),
    profile.watchNext.list(),
    profile.reviews.list()
  ]);

  return {
    user,
    watched,
    watchNext,
    reviews
  };
};
