import { TMDB, type ExploreType } from '$lib/server/tmdb/controller';
import { getExploreTypeTitle, parseExploreSpecific } from '$lib/utils/explore';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { GenreRepo } from '$lib/server/repos/genre.repo';

type ExploreSortMode = 'popularity' | 'newestYear' | 'oldestYear' | 'titleAZ' | 'titleZA';
const MIN_SUBGROUP_SEARCH_POPULARITY = 2;

function asExploreType(value: string): ExploreType | null {
  if (value === 'genre' || value === 'decade' || value === 'actor') {
    return value;
  }
  return null;
}

function asSortMode(value: string | null): ExploreSortMode {
  if (
    value === 'popularity' ||
    value === 'newestYear' ||
    value === 'oldestYear' ||
    value === 'titleAZ' ||
    value === 'titleZA'
  ) {
    return value;
  }
  return 'popularity';
}

function toTMDBSort(sortMode: ExploreSortMode) {
  switch (sortMode) {
    case 'popularity':
      return 'popularity.desc';
    case 'newestYear':
      return 'primary_release_date.desc';
    case 'oldestYear':
      return 'primary_release_date.asc';
    case 'titleAZ':
      return 'original_title.asc';
    case 'titleZA':
      return 'original_title.desc';
    default:
      return 'primary_release_date.desc';
  }
}

export const load: PageServerLoad = async ({ params, parent, url }) => {
  const type = asExploreType(params.type);
  if (!type) {
    throw error(404, 'Explore type not found');
  }

  const specificValue = parseExploreSpecific(type, params.specific);
  if (!specificValue) {
    throw error(404, 'Explore item not found');
  }

  const page = Number(url.searchParams.get('page') || 1);
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  const query = (url.searchParams.get('query') || '').trim();
  const sortMode = asSortMode(url.searchParams.get('sort'));
  const tmdbSort = toTMDBSort(sortMode);

  let title = 'Explore';
  let response: {
    page: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
    results: Array<{
      id: number;
      title: string;
      poster_path: string | null;
      backdrop_path: string | null;
      release_date: string;
      popularity?: number;
    }>;
  };

  const getGroupPage = async (groupPage: number) => {
    if (type === 'genre') {
      return TMDB.getByGenre(specificValue, { page: groupPage, sortBy: tmdbSort });
    }
    if (type === 'decade') {
      return TMDB.getByDecade(specificValue, { page: groupPage, sortBy: tmdbSort });
    }
    return TMDB.getByPerson(specificValue, { page: groupPage, sortBy: tmdbSort });
  };

  if (type === 'genre') {
    const genreItem = await GenreRepo.findById(specificValue);

    if (!genreItem) {
      throw error(404, 'Genre not found');
    }

    title = genreItem.name;
  } else if (type === 'decade') {
    title = `${specificValue}s`;
  } else {
    const person = await TMDB.getPerson(specificValue);
    title = person.name;
  }

  if (!query) {
    response = await getGroupPage(currentPage);
  } else {
    const PAGE_SIZE = 20;
    const MAX_SCAN_PAGES = 30;
    const queryLower = query.toLowerCase();
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    let scanPage = 1;
    let scanned = 0;
    let totalPages = 1;
    let filtered: Array<{
      id: number;
      title: string;
      poster_path: string | null;
      backdrop_path: string | null;
      release_date: string;
      popularity?: number;
    }> = [];

    while (scanned < MAX_SCAN_PAGES && scanPage <= totalPages && filtered.length <= end) {
      const pageData = await getGroupPage(scanPage);
      totalPages = pageData.total_pages;
      filtered.push(
        ...pageData.results.filter((movie) =>
          (movie.title || '').toLowerCase().includes(queryLower) &&
          (movie.popularity ?? 0) >= MIN_SUBGROUP_SEARCH_POPULARITY
        )
      );
      scanPage += 1;
      scanned += 1;
    }

    const pageResults = filtered.slice(start, end);
    const hasPrevPage = currentPage > 1;
    const hasNextPage = filtered.length > end || (scanPage <= totalPages && pageResults.length === PAGE_SIZE);

    response = {
      page: currentPage,
      hasPrevPage,
      hasNextPage,
      prevPage: hasPrevPage ? currentPage - 1 : null,
      nextPage: hasNextPage ? currentPage + 1 : null,
      results: pageResults
    };
  }

  const { watched, watchNext } = await parent();

  return {
    type,
    typeTitle: getExploreTypeTitle(type),
    title,
    specific: params.specific,
    query,
    sortMode,
    currentPage: response.page,
    hasNextPage: response.hasNextPage,
    hasPrevPage: response.hasPrevPage,
    nextPage: response.nextPage,
    prevPage: response.prevPage,
    results: response.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      is_watched: watched?.some((item) => item.mediaId === String(movie.id)) ?? false,
      is_watchNext: watchNext?.some((item) => item.mediaId === String(movie.id)) ?? false
    }))
  };
};
