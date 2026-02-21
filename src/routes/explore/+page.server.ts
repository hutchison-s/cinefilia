import { TMDB } from '$lib/server/tmdb/controller';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const sp = url.searchParams;

  const actorId = sp.get('actor') ?? undefined;
  const genreIds = sp.getAll('genre').join('|') || undefined;
  const selectedDecades = sp
    .getAll('decade')
    .map(d => Number(d))
    .filter(n => !Number.isNaN(n));

  const sortBy = sp.get('sort') ?? 'popularity.desc';
  const page = sp.has('page') ? Number(sp.get('page')) : 1;

  const movies = await TMDB.discover({
    actorId,
    genreIds,
    selectedDecades,
    sortBy,
    page
  });

  return { movies };
};