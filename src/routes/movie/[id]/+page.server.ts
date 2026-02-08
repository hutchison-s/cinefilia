import { Profile } from "$lib/server/profile";
import { TMDB } from "$lib/server/tmdb/controller";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;
  const movie = await TMDB.getMovie(Number(id), [
  'credits',
  'videos',
  'images',
  'recommendations'
].join(','));

  return {
    movie
  }
}

export const actions: Actions = {
  addToWatchNext: async ({ request, locals, params }) => {
    if (!locals.user) {
      return { success: false, message: 'User not logged in' };
    }
    const id = Number(params.id);
    const profile = Profile.forUser(locals.user.id);
    const movie = await TMDB.getMovie(id);
    const {title, poster_path, release_date} = movie;
    await profile.watchNext.add({
      mediaId: id.toString(),
      mediaType: 'movie',
      title: title ?? 'Untitled',
      posterPath: poster_path ?? undefined,
      releaseYear: release_date ? new Date(release_date).getFullYear() : undefined
    });
    return { success: true, message: 'Movie added to watchlist' }; 
  },
  markWatched: async ({ request, locals, params }) => {
    if (!locals.user) {
      return { success: false, message: 'User not logged in' };
    }
    const id = Number(params.id);
    const profile = Profile.forUser(locals.user.id);
    const movie = await TMDB.getMovie(id);
    const {title, poster_path, release_date} = movie;
    await profile.watched.add({
      mediaId: id.toString(),
      title: title ?? 'Untitled',
      mediaType: 'movie',
      posterPath: poster_path ?? undefined,
      releaseYear: release_date ? new Date(release_date).getFullYear() : undefined
    });
    return { success: true, message: 'Movie marked as watched' }; 
  }
}