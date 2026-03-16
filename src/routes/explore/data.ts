import { TMDB } from '$lib/server/tmdb/controller';

function formatToday() {
  return new Date().toISOString().slice(0, 10);
}

export function parseExploreSearchParams(url: URL) {
  const sp = url.searchParams;

  const actorId = sp.get('actor') ?? undefined;
  const genreIds = sp.getAll('genre').join('|') || undefined;
  const selectedDecades = sp
    .getAll('decade')
    .map((d) => Number(d))
    .filter((n) => !Number.isNaN(n));
  const sortBy = sp.get('sort') ?? 'popularity.desc';
  const page = sp.has('page') ? Number(sp.get('page')) : 1;
  const includeFutureReleaseDates = sp.get('includeFutureReleaseDates') === 'true';

  return {
    actorId,
    genreIds,
    selectedDecades,
    sortBy,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    includeFutureReleaseDates
  };
}

export async function loadExploreMovies(url: URL) {
  const { actorId, genreIds, selectedDecades, sortBy, page, includeFutureReleaseDates } =
    parseExploreSearchParams(url);

  return TMDB.discover({
    actorId,
    genreIds,
    selectedDecades,
    sortBy,
    page,
    releaseDateLte: includeFutureReleaseDates ? undefined : formatToday()
  });
}
