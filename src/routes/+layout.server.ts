import type { LayoutServerLoad } from './$types';
import { Profile } from '$lib/server/profile';
import { auth } from '$lib/server/auth';
import { GenreRepo } from '$lib/server/repos/genre.repo';

export const load: LayoutServerLoad = async ({ request }) => {
  const session = await auth.api.getSession({
    headers: request.headers
  });

  const user = session?.user;

  if (!user) {
      return { session };
    }
  
    const profile = Profile.forUser(session.user.id);
  
    const [watched, watchNext, reviews] = await Promise.all([
      profile.watched.list(),
      profile.watchNext.list(),
      profile.reviews.list()
    ]);

    const genres = await GenreRepo.list();
  
    return {
      session,
      user,
      watched,
      watchNext,
      reviews,
      genres
    };

};
