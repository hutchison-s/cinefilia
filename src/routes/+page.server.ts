import { Profile } from '$lib/server/profile';
import { db } from '$lib/server/db';
import { watched as watchedTable } from '$lib/server/db/schema';
import { GenreRepo } from '$lib/server/repos/genre.repo';
import { TMDB } from '$lib/server/tmdb/controller';
import { and, desc, eq, inArray, isNotNull, notInArray, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

type HomepageRecommendation = {
  mediaId: string;
  title: string;
  posterPath: string | null;
  rating: number;
  releaseYear: number | null;
};

const HOMEPAGE_RECOMMENDATION_LIMIT = 20;

function shuffleArray<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function buildTopGenreDecadePairs(
  watched: Array<{ genreIds: number[] | null; releaseYear: number | null }>
) {
  const pairCounts = new Map<string, { genreId: number; decadeStart: number; count: number }>();

  for (const item of watched) {
    if (!item.releaseYear || !item.genreIds?.length) {
      continue;
    }

    const decadeStart = Math.floor(item.releaseYear / 10) * 10;

    for (const genreId of item.genreIds) {
      const key = `${genreId}:${decadeStart}`;
      const existing = pairCounts.get(key);

      if (existing) {
        existing.count += 1;
        continue;
      }

      pairCounts.set(key, {
        genreId,
        decadeStart,
        count: 1
      });
    }
  }

  return Array.from(pairCounts.values())
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return b.decadeStart - a.decadeStart;
    })
    .slice(0, 5);
}

async function getTasteBasedRecommendations(
  watched: Array<{ mediaId: string; genreIds: number[] | null; releaseYear: number | null }>,
  today: string
): Promise<HomepageRecommendation[]> {
  const topPairs = buildTopGenreDecadePairs(watched);

  if (topPairs.length === 0) {
    return [];
  }

  const watchedMediaIds = new Set(watched.map((item) => item.mediaId));
  const resultsByPair = await Promise.all(
    topPairs.map(async ({ genreId, decadeStart }) => {
      const movies = await TMDB.discover({
        genreIds: String(genreId),
        selectedDecades: [decadeStart],
        sortBy: 'popularity.desc',
        page: 1,
        releaseDateLte: today
      });

      return movies.results
        .filter((movie) => movie.poster_path)
        .map((movie) => ({
          mediaId: String(movie.id),
          title: movie.title,
          posterPath: movie.poster_path,
          rating: movie.vote_average,
          releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : null
        }));
    })
  );

  const recommendations: HomepageRecommendation[] = [];
  const seenMediaIds = new Set<string>();

  for (const pairResults of resultsByPair) {
    for (const movie of pairResults) {
      if (watchedMediaIds.has(movie.mediaId) || seenMediaIds.has(movie.mediaId)) {
        continue;
      }

      seenMediaIds.add(movie.mediaId);
      recommendations.push(movie);

      if (recommendations.length >= 20) {
        return recommendations;
      }
    }
  }

  return recommendations;
}

async function getRandomGenreRecommendations(
  watched: Array<{ mediaId: string }>,
  today: string
): Promise<HomepageRecommendation[]> {
  const genres = shuffleArray(await GenreRepo.list()).slice(0, 4);

  if (genres.length === 0) {
    return [];
  }

  const watchedMediaIds = new Set(watched.map((item) => item.mediaId));
  const resultsByGenre = await Promise.all(
    genres.map(async ({ id }) => {
      const movies = await TMDB.discover({
        genreIds: String(id),
        sortBy: 'popularity.desc',
        page: 1,
        releaseDateLte: today
      });

      return movies.results
        .filter((movie) => movie.poster_path)
        .map((movie) => ({
          mediaId: String(movie.id),
          title: movie.title,
          posterPath: movie.poster_path,
          rating: movie.vote_average,
          releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : null
        }));
    })
  );

  const recommendations: HomepageRecommendation[] = [];
  const seenMediaIds = new Set<string>();

  for (const genreResults of resultsByGenre) {
    for (const movie of genreResults) {
      if (watchedMediaIds.has(movie.mediaId) || seenMediaIds.has(movie.mediaId)) {
        continue;
      }

      seenMediaIds.add(movie.mediaId);
      recommendations.push(movie);

      if (recommendations.length >= 20) {
        return recommendations;
      }
    }
  }

  return recommendations;
}

function mergeRecommendations(
  existing: HomepageRecommendation[],
  incoming: HomepageRecommendation[],
  limit = HOMEPAGE_RECOMMENDATION_LIMIT
) {
  const merged = [...existing];
  const seenMediaIds = new Set(existing.map((item) => item.mediaId));

  for (const item of incoming) {
    if (seenMediaIds.has(item.mediaId)) {
      continue;
    }

    seenMediaIds.add(item.mediaId);
    merged.push(item);

    if (merged.length >= limit) {
      break;
    }
  }

  return merged;
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

  const connectedUserIds = await profile.connections.connectedUserIds();

  const watchedIds = new Set(
    watched.map((item) => Number(item.mediaId)).filter((id) => Number.isFinite(id))
  );
  const inTheatersUnwatched = inTheatersMovies.filter(
    (movie) => !watchedIds.has(Number(movie.mediaId))
  );

  let connectionRecommendations: HomepageRecommendation[] = [];

  if (connectedUserIds.length > 0) {
    const excludedMediaIds = new Set([
      ...watched.map((item) => item.mediaId),
      ...watchNext.map((item) => item.mediaId)
    ]);
    const whereClauses = [
      inArray(watchedTable.userId, connectedUserIds),
      eq(watchedTable.mediaType, 'movie'),
      isNotNull(watchedTable.rating)
    ];

    if (excludedMediaIds.size > 0) {
      whereClauses.push(notInArray(watchedTable.mediaId, Array.from(excludedMediaIds)));
    }

    const recommendedRows = await db
      .select({
        mediaId: watchedTable.mediaId,
        title: sql<string>`max(${watchedTable.title})`,
        posterPath: sql<string | null>`max(${watchedTable.posterPath})`,
        releaseYear: sql<number | null>`max(${watchedTable.releaseYear})`,
        averageRating: sql<string>`avg(${watchedTable.rating})`,
        ratingCount: sql<number>`count(*)::int`
      })
      .from(watchedTable)
      .where(and(...whereClauses))
      .groupBy(watchedTable.mediaId)
      .having(sql`avg(${watchedTable.rating}) > 3`)
      .orderBy(
        desc(sql`avg(${watchedTable.rating})`),
        desc(sql`count(*)`),
        desc(sql`max(${watchedTable.watchedAt})`)
      )
      .limit(HOMEPAGE_RECOMMENDATION_LIMIT);

    connectionRecommendations = recommendedRows.map((row) => ({
      mediaId: row.mediaId,
      title: row.title,
      posterPath: row.posterPath,
      releaseYear: row.releaseYear,
      rating: Number(row.averageRating)
    }));
  }

  if (connectionRecommendations.length < HOMEPAGE_RECOMMENDATION_LIMIT && watched.length > 0) {
    connectionRecommendations = mergeRecommendations(
      connectionRecommendations,
      await getTasteBasedRecommendations(watched, releaseDateLte)
    );
  }

  if (connectionRecommendations.length < HOMEPAGE_RECOMMENDATION_LIMIT) {
    connectionRecommendations = mergeRecommendations(
      connectionRecommendations,
      await getRandomGenreRecommendations(watched, releaseDateLte)
    );
  }

  return {
    user,
    inTheaters: inTheatersUnwatched,
    watched,
    watchNext,
    connectionRecommendations,
    reviews
  };
};
