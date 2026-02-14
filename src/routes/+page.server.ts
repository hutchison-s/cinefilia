import { Profile } from '$lib/server/profile';
import { TMDB } from '$lib/server/tmdb/controller';
import type { PageServerLoad } from './$types';

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(today.getDate() - 30);
  const releaseDateGte = formatDate(monthAgo);
  const releaseDateLte = formatDate(today);

  const inTheaters = await TMDB.getByReleaseDateRange({
    page: 1,
    sortBy: 'popularity.desc',
    releaseDateGte,
    releaseDateLte
  });

  const inTheatersMovies = inTheaters.results
    .filter((movie) => movie.poster_path)
    .slice(0, 30)
    .map((movie) => ({
      mediaId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      rating: movie.vote_average,
      releaseDate: movie.release_date
    }));

  if (!user) {
    return { user: null, inTheaters: inTheatersMovies };
  }

  const profile = Profile.forUser(user.id);

  const [watched, watchNext, reviews] = await Promise.all([
    profile.watched.list(),
    profile.watchNext.list(),
    profile.reviews.list()
  ]);

  const watchedIds = new Set(
    watched.map((item) => Number(item.mediaId)).filter((id) => Number.isFinite(id))
  );
  const inTheatersUnwatched = inTheatersMovies.filter(
    (movie) => !watchedIds.has(Number(movie.mediaId))
  );

  return {
    user,
    inTheaters: inTheatersUnwatched,
    watched,
    watchNext,
    reviews
  };
};
