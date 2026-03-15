import type { PageServerLoad, Actions } from './$types';
import { TMDB } from '$lib/server/tmdb/controller';
import { loadExploreMovies, parseExploreSearchParams } from './data';

export const load: PageServerLoad = async ({ url }) => {
  const { actorId } = parseExploreSearchParams(url);
  let actorName: string | null = null;

  if (actorId) {
    const person = await TMDB.getPerson(Number(actorId));
    actorName = person.name;
  }

  const movies = await loadExploreMovies(url);

  return { movies, actorName };
};

export const actions: Actions = {
  loadMore: async ({ request, url }) => {
    const formData = await request.formData();
    const nextPage = Number(formData.get('nextPage') ?? '1');
    const actionUrl = new URL(url);

    actionUrl.searchParams.set('page', String(nextPage));

    const movies = await loadExploreMovies(actionUrl);

    return {
      movies
    };
  }
};
