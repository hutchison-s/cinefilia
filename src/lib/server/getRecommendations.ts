import { db } from '$lib/server/db';
import { watchNext as watchNextTable, watched as watchedTable } from '$lib/server/db/schema';
import { GenreRepo } from '$lib/server/repos/genre.repo';
import { TMDB } from '$lib/server/tmdb/controller';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';

export type HomepageRecommendation = {
  mediaId: string;
  title: string;
  posterPath: string | null;
  rating: number;
  releaseYear: number | null;
};

export type HomepageRecommendationSection = {
  id: 'connections' | 'genre' | 'actor';
  title: string;
  movies: HomepageRecommendation[];
  viewMoreLink?: string;
};

type WatchedLike = {
  mediaId: string;
  genreIds?: number[] | null;
  rating?: string | number | null;
};

const HOMEPAGE_RECOMMENDATION_LIMIT = 20;
const INVALID_MPAA_RATINGS = new Set(['NR', 'NOT RATED', 'UNRATED']);

function shuffleArray<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function hasAllowedMpaaRating(mpaaRating: string | null | undefined) {
  if (!mpaaRating) {
    return false;
  }

  return !INVALID_MPAA_RATINGS.has(mpaaRating.trim().toUpperCase());
}

async function filterRecommendationsByMpaa(
  candidates: HomepageRecommendation[]
): Promise<HomepageRecommendation[]> {
  const details = await Promise.all(
    candidates.map(async (candidate) => {
      const mediaId = Number(candidate.mediaId);

      if (!Number.isFinite(mediaId)) {
        return null;
      }

      try {
        const movie = await TMDB.getMovie(mediaId);

        if (!hasAllowedMpaaRating(movie.mpaaRating)) {
          return null;
        }

        return candidate;
      } catch (error) {
        console.error('[home recommendations] failed MPAA lookup', {
          mediaId: candidate.mediaId,
          error
        });
        return null;
      }
    })
  );

  return details.filter((candidate): candidate is HomepageRecommendation => candidate !== null);
}

function toRecommendation(movie: {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
}): HomepageRecommendation {
  return {
    mediaId: String(movie.id),
    title: movie.title,
    posterPath: movie.poster_path,
    rating: movie.vote_average,
    releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : null
  };
}

function collectExcludedMediaIds(
  watched: Array<{ mediaId: string }>,
  watchNext: Array<{ mediaId: string }>
) {
  return new Set([...watched.map((item) => item.mediaId), ...watchNext.map((item) => item.mediaId)]);
}

function takeUnseenMovies(
  candidates: HomepageRecommendation[],
  excludedMediaIds: Set<string>,
  limit = HOMEPAGE_RECOMMENDATION_LIMIT
) {
  const results: HomepageRecommendation[] = [];
  const seenMediaIds = new Set<string>();

  for (const movie of candidates) {
    if (excludedMediaIds.has(movie.mediaId) || seenMediaIds.has(movie.mediaId)) {
      continue;
    }

    seenMediaIds.add(movie.mediaId);
    results.push(movie);

    if (results.length >= limit) {
      break;
    }
  }

  return results;
}

function pickRandomTopGenre(watched: WatchedLike[]) {
  const genreCounts = new Map<number, number>();

  for (const item of watched) {
    for (const genreId of item.genreIds ?? []) {
      genreCounts.set(genreId, (genreCounts.get(genreId) ?? 0) + 1);
    }
  }

  const topGenreIds = Array.from(genreCounts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }

      return a[0] - b[0];
    })
    .slice(0, 3)
    .map(([genreId]) => genreId);

  if (topGenreIds.length === 0) {
    return null;
  }

  return shuffleArray(topGenreIds)[0];
}

function getTopRatedWatchedCandidates(watched: WatchedLike[]) {
  const rated = watched
    .map((item) => ({
      ...item,
      numericRating:
        typeof item.rating === 'number'
          ? item.rating
          : item.rating
            ? Number(item.rating)
            : null
    }))
    .filter((item) => item.numericRating !== null && Number.isFinite(item.numericRating));

  if (rated.length === 0) {
    return shuffleArray(watched);
  }

  const sortedRatings = Array.from(
    new Set(rated.map((item) => item.numericRating ?? 0).sort((a, b) => b - a))
  );

  return sortedRatings.flatMap((rating) =>
    shuffleArray(rated.filter((item) => item.numericRating === rating))
  );
}

export async function getConnectionRecommendations({
  connectedUserIds,
  watched,
  watchNext
}: {
  connectedUserIds: string[];
  watched: Array<{ mediaId: string }>;
  watchNext: Array<{ mediaId: string }>;
}): Promise<HomepageRecommendationSection | null> {
  if (connectedUserIds.length === 0) {
    return null;
  }

  const excludedMediaIds = collectExcludedMediaIds(watched, watchNext);

  const [watchedRows, watchNextRows] = await Promise.all([
    db
      .select({
        mediaId: watchedTable.mediaId,
        title: sql<string>`max(${watchedTable.title})`,
        posterPath: sql<string | null>`max(${watchedTable.posterPath})`,
        releaseYear: sql<number | null>`max(${watchedTable.releaseYear})`,
        score: sql<number>`count(distinct ${watchedTable.userId})::int`,
        latestAt: sql<string | null>`max(${watchedTable.watchedAt})`
      })
      .from(watchedTable)
      .where(
        and(inArray(watchedTable.userId, connectedUserIds), eq(watchedTable.mediaType, 'movie'))
      )
      .groupBy(watchedTable.mediaId)
      .orderBy(desc(sql`count(distinct ${watchedTable.userId})`), desc(sql`max(${watchedTable.watchedAt})`))
      .limit(HOMEPAGE_RECOMMENDATION_LIMIT * 3),
    db
      .select({
        mediaId: watchNextTable.mediaId,
        title: sql<string>`max(${watchNextTable.title})`,
        posterPath: sql<string | null>`max(${watchNextTable.posterPath})`,
        releaseYear: sql<number | null>`max(${watchNextTable.releaseYear})`,
        score: sql<number>`count(distinct ${watchNextTable.userId})::int`,
        latestAt: sql<string | null>`max(${watchNextTable.createdAt})`
      })
      .from(watchNextTable)
      .where(
        and(
          inArray(watchNextTable.userId, connectedUserIds),
          eq(watchNextTable.mediaType, 'movie')
        )
      )
      .groupBy(watchNextTable.mediaId)
      .orderBy(
        desc(sql`count(distinct ${watchNextTable.userId})`),
        desc(sql`max(${watchNextTable.createdAt})`)
      )
      .limit(HOMEPAGE_RECOMMENDATION_LIMIT * 3)
  ]);

  const merged = new Map<
    string,
    HomepageRecommendation & { score: number; latestAt: string | null }
  >();

  for (const row of [...watchedRows, ...watchNextRows]) {
    if (excludedMediaIds.has(row.mediaId) || !row.posterPath) {
      continue;
    }

    const existing = merged.get(row.mediaId);

    if (!existing) {
      merged.set(row.mediaId, {
        mediaId: row.mediaId,
        title: row.title,
        posterPath: row.posterPath,
        releaseYear: row.releaseYear,
        rating: 0,
        score: Number(row.score),
        latestAt: row.latestAt
      });
      continue;
    }

    existing.score += Number(row.score);

    if ((row.latestAt ?? '') > (existing.latestAt ?? '')) {
      existing.latestAt = row.latestAt;
    }
  }

  const candidates = Array.from(merged.values())
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (b.latestAt ?? '').localeCompare(a.latestAt ?? '');
    })
    .slice(0, HOMEPAGE_RECOMMENDATION_LIMIT)
    .map(({ score: _score, latestAt: _latestAt, ...movie }) => movie);

  const movies = await filterRecommendationsByMpaa(candidates);

  if (movies.length === 0) {
    return null;
  }

  return {
    id: 'connections',
    title: 'From your connections',
    movies,
    viewMoreLink: '/explore'
  };
}

export async function getTopGenreRecommendations({
  watched,
  watchNext,
  today
}: {
  watched: WatchedLike[];
  watchNext: Array<{ mediaId: string }>;
  today: string;
}): Promise<HomepageRecommendationSection | null> {
  if (watched.length === 0) {
    return null;
  }

  const genreId = pickRandomTopGenre(watched);

  if (!genreId) {
    return null;
  }

  const genres = await GenreRepo.list();
  const genre = genres.find((item) => item.id === genreId);

  if (!genre) {
    return null;
  }

  const discovered = await TMDB.discover({
    genreIds: String(genreId),
    sortBy: 'popularity.desc',
    page: 1,
    originCountry: 'US',
    region: 'US',
    includeAdult: false,
    releaseDateLte: today
  });

  const excludedMediaIds = collectExcludedMediaIds(
    watched.map((item) => ({ mediaId: item.mediaId })),
    watchNext
  );

  const movies = await filterRecommendationsByMpaa(
    takeUnseenMovies(
      discovered.results
        .filter((movie) => movie.poster_path && movie.vote_average > 0)
        .map(toRecommendation),
      excludedMediaIds
    )
  );

  if (movies.length === 0) {
    return null;
  }

  return {
    id: 'genre',
    title: `More ${genre.name}`,
    movies,
    viewMoreLink: `/explore?genre=${genre.id}`
  };
}

export async function getLeadActorRecommendations({
  watched,
  watchNext,
  today
}: {
  watched: WatchedLike[];
  watchNext: Array<{ mediaId: string }>;
  today: string;
}): Promise<HomepageRecommendationSection | null> {
  if (watched.length === 0) {
    return null;
  }

  const excludedMediaIds = collectExcludedMediaIds(
    watched.map((item) => ({ mediaId: item.mediaId })),
    watchNext
  );

  for (const seedMovie of getTopRatedWatchedCandidates(watched)) {
    const seedMovieId = Number(seedMovie.mediaId);

    if (!Number.isFinite(seedMovieId)) {
      continue;
    }

    const movie = await TMDB.getMovie(seedMovieId, 'credits');
    const cast = movie.credits?.cast
      ?.slice()
      .sort((a, b) => a.order - b.order)
      .filter((actor) => actor.known_for_department === 'Acting');

    if (!cast?.length) {
      continue;
    }

    for (const actor of cast) {
      const discovered = await TMDB.discover({
        actorId: String(actor.id),
        sortBy: 'popularity.desc',
        page: 1,
        originCountry: 'US',
        region: 'US',
        includeAdult: false,
        releaseDateLte: today
      });

      const actorMovies = takeUnseenMovies(
        discovered.results
          .filter((item) => item.poster_path && item.vote_average > 0)
          .map(toRecommendation),
        excludedMediaIds
      );

      if (actorMovies.length < 4) {
        continue;
      }

      const movies = await filterRecommendationsByMpaa(actorMovies);

      if (movies.length < 4) {
        continue;
      }

      return {
        id: 'actor',
        title: `More ${actor.name}`,
        movies,
        viewMoreLink: `/explore?actor=${actor.id}`
      };
    }
  }

  return null;
}
