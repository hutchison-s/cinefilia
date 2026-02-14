import { redirect } from '@sveltejs/kit';
import { and, desc, eq, isNotNull, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { genre, watchNext, watched } from '$lib/server/db/schema';
import { user as userTable } from '$lib/server/db/auth.schema';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  const userId = locals.user.id;

  const [userRows, watchedCountRows, watchNextCountRows, genreCounts, decadeCounts, heatmapRows] = await Promise.all([
    db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        createdAt: userTable.createdAt
      })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(watched)
      .where(eq(watched.userId, userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(watchNext)
      .where(eq(watchNext.userId, userId)),
    db
      .select({
        genreId: watched.genreId,
        genreName: genre.name,
        count: sql<number>`count(*)::int`
      })
      .from(watched)
      .leftJoin(genre, eq(watched.genreId, genre.id))
      .where(and(eq(watched.userId, userId), isNotNull(watched.genreId)))
      .groupBy(watched.genreId, genre.name)
      .orderBy(desc(sql`count(*)`)),
    db
      .select({
        decadeStart: sql<number>`(floor(${watched.releaseYear} / 10.0) * 10)::int`,
        count: sql<number>`count(*)::int`
      })
      .from(watched)
      .where(and(eq(watched.userId, userId), isNotNull(watched.releaseYear)))
      .groupBy(sql`(floor(${watched.releaseYear} / 10.0) * 10)::int`)
      .orderBy(desc(sql`(floor(${watched.releaseYear} / 10.0) * 10)::int`)),
    db
      .select({
        genreName: genre.name,
        decadeStart: sql<number>`(floor(${watched.releaseYear} / 10.0) * 10)::int`,
        count: sql<number>`count(*)::int`
      })
      .from(watched)
      .leftJoin(genre, eq(watched.genreId, genre.id))
      .where(
        and(
          eq(watched.userId, userId),
          isNotNull(watched.genreId),
          isNotNull(watched.releaseYear)
        )
      )
      .groupBy(genre.name, sql`(floor(${watched.releaseYear} / 10.0) * 10)::int`)
  ]);

  const [user] = userRows;

  const heatmapDecades = [...new Set(decadeCounts.map((row) => `${row.decadeStart}s`))];
  const heatmapGenres = [...new Set(heatmapRows.map((row) => row.genreName ?? 'Unknown'))];
  const heatmapCells = Object.fromEntries(
    heatmapRows.map((row) => [
      `${row.genreName ?? 'Unknown'}|${row.decadeStart}s`,
      row.count
    ])
  );
  const heatmapMax = heatmapRows.reduce((max, row) => Math.max(max, row.count), 0);

  return {
    profile: {
      name: user?.name ?? locals.user.name,
      email: user?.email ?? locals.user.email,
      joinedAt: user?.createdAt ?? null
    },
    counts: {
      watched: watchedCountRows[0]?.count ?? 0,
      watchNext: watchNextCountRows[0]?.count ?? 0
    },
    byGenre: genreCounts.map((row) => ({
      genreId: row.genreId,
      genreName: row.genreName ?? 'Unknown',
      count: row.count
    })),
    byDecade: decadeCounts.map((row) => ({
      decadeStart: row.decadeStart,
      label: `${row.decadeStart}s`,
      count: row.count
    })),
    heatmap: {
      genres: heatmapGenres,
      decades: heatmapDecades,
      cells: heatmapCells,
      maxCount: heatmapMax
    }
  };
};
