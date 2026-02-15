import { Profile } from "$lib/server/profile";
import { TMDB } from "$lib/server/tmdb/controller";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, parent }) => {
  const { watched, watchNext, reviews } = await parent()
  const id = Number(params.id);
  const movie = await TMDB.getMovie(Number(id), [
    'credits',
    'images',
    'recommendations'
  ].join(','));
  return {
    movie,
    movieWatched: watched?.find(item => item.mediaId === id.toString()) || null,
    movieWatchNext: watchNext?.find(item => item.mediaId === id.toString()) || null,
    movieReview: reviews?.find(r => r.mediaId === id.toString() && r.mediaType === 'movie') || null
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
  removeFromWatchNext: async ({ request, locals, params }) => {
    if (!locals.user) {
      return { success: false, message: 'User not logged in' };
    }
    const id = Number(params.id);
    const profile = Profile.forUser(locals.user.id);
    await profile.watchNext.remove(id.toString());
    return { success: true, message: 'Movie removed from watchlist' }; 
  },
  markWatched: async ({ request, locals, params }) => {
    if (!locals.user) {
      return { success: false, message: 'User not logged in' };
    }
    const id = Number(params.id);
    const profile = Profile.forUser(locals.user.id);
    const movie = await TMDB.getMovie(id);
    const {title, poster_path, release_date, genres} = movie;
    const primaryGenreId = genres?.[0]?.id;
    await profile.watched.add({
      mediaId: id.toString(),
      title: title ?? 'Untitled',
      mediaType: 'movie',
      posterPath: poster_path ?? undefined,
      releaseYear: release_date ? new Date(release_date).getFullYear() : undefined,
      genreId: primaryGenreId
    });
    return { success: true, message: 'Movie marked as watched' }; 
  },
  removeFromWatched: async ({ request, locals, params }) => {
    if (!locals.user) {
      return { success: false, message: 'User not logged in' };
    }
    const id = Number(params.id);
    const profile = Profile.forUser(locals.user.id);
    await profile.watched.remove(id.toString());
    await profile.reviews.remove(id.toString());
    return { success: true, message: 'Movie removed from watched list' }; 
  },
  addReview: async ({ request, locals, params }) => {
      if (!locals.user) {
        return { success: false, message: 'User not logged in' };
      }
      const formData = await request.formData();
      const rating = Number(formData.get('rating'));
      const reviewText = String(formData.get('reviewText') || '');
      const id = Number(params.id);
      const profile = Profile.forUser(locals.user.id);
      const existingReviews = await profile.reviews.list()
      const existingReview = existingReviews.find(r => r.mediaId === id.toString() && r.mediaType === 'movie');
      if (existingReview) {
        await profile.reviews.update(
          id.toString(),
          { body: reviewText}
        );
      } else {
        await profile.reviews.create({
          mediaId: id.toString(),
          mediaType: 'movie',
          body: reviewText
        });
      }
      await profile.watched.updateRating(id.toString(), rating);
      return { success: true, message: 'Review added successfully' }; 
    }
}
