import { Profile } from '$lib/server/profile';
import { TMDB } from '$lib/server/tmdb/controller';
import {
  getConnectionRecommendations,
  getLeadActorRecommendations,
  getTopGenreRecommendations
} from '$lib/server/getRecommendations';
import type { PageServerLoad } from './$types';

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

const HORROR_GENRE_ID = 27;

async function getPreferredGenreIds(
  watched: Array<{ genreIds: number[] | null }>,
  watchNext: Array<{ mediaId: string; mediaType: string }>
) {
  const preferredGenreIds = new Set<number>();

  for (const item of watched) {
    for (const genreId of item.genreIds ?? []) {
      preferredGenreIds.add(genreId);
    }
  }

  const watchNextMovieIds = watchNext
    .filter((item) => item.mediaType === 'movie')
    .map((item) => Number(item.mediaId))
    .filter((id) => Number.isFinite(id));

  if (watchNextMovieIds.length === 0) {
    return preferredGenreIds;
  }

  const watchNextMovies = await Promise.all(
    watchNextMovieIds.map(async (movieId) => {
      try {
        return await TMDB.getMovie(movieId);
      } catch (error) {
        console.error('[home in theaters] failed to load watch-next movie genres', {
          movieId,
          error
        });
        return null;
      }
    })
  );

  for (const movie of watchNextMovies) {
    for (const genre of movie?.genres ?? []) {
      preferredGenreIds.add(genre.id);
    }
  }

  return preferredGenreIds;
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
    originCountry: 'US',
    region: 'US',
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

  const connectedUserIds = await profile.connections.connectedUserIds();
  const preferredGenreIds = await getPreferredGenreIds(watched, watchNext);

  const watchedIds = new Set(
    watched.map((item) => Number(item.mediaId)).filter((id) => Number.isFinite(id))
  );
  const inTheatersUnwatched = inTheaters.results
    .filter(
      (movie) =>
        movie.poster_path &&
        !movie.adult &&
        !watchedIds.has(Number(movie.id)) &&
        !movie.genre_ids?.includes(HORROR_GENRE_ID) &&
        movie.genre_ids?.some((genreId) => preferredGenreIds.has(genreId))
    )
    .slice(0, 30)
    .map((movie) => ({
      mediaId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      rating: movie.vote_average,
      releaseDate: movie.release_date
    }));

  const recommendationSections = (
    await Promise.all([
      getConnectionRecommendations({ connectedUserIds, watched, watchNext }),
      getTopGenreRecommendations({ watched, watchNext, today: releaseDateLte }),
      getLeadActorRecommendations({ watched, watchNext, today: releaseDateLte })
    ])
  ).filter((section) => section !== null);

  return {
    user,
    inTheaters: inTheatersUnwatched,
    watched,
    watchNext,
    recommendationSections,
    reviews
  };
};
