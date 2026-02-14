import { TMDB, type ExploreType, type TMDBMovieListItem } from '$lib/server/tmdb/controller';
import {
  EXPLORE_DECADES,
  buildExploreSpecificSlug,
  getExploreTypeTitle
} from '$lib/utils/explore';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { GenreRepo } from '$lib/server/repos/genre.repo';

type ExploreSection = {
  title: string;
  href: string;
  movies: {
    mediaId: number;
    title: string;
    posterPath: string | null;
    rating: number;
  }[];
};

function mapMovies(items: TMDBMovieListItem[]) {
  return items
    .filter((item) => item.poster_path)
    .slice(0, 8)
    .map((item) => ({
      mediaId: item.id,
      title: item.title,
      posterPath: item.poster_path,
      rating: item.vote_average
    }));
}

function asExploreType(value: string): ExploreType | null {
  if (value === 'genre' || value === 'decade' || value === 'actor') {
    return value;
  }
  return null;
}

export const load: PageServerLoad = async ({ params }) => {
  const type = asExploreType(params.type);
  if (!type) {
    throw error(404, 'Explore type not found');
  }

  let sections: ExploreSection[] = [];

  if (type === 'genre') {
    const genres = (await GenreRepo.list()).slice(0, 8);

    const rows = await Promise.all(
      genres.map(async (genre) => {
        const movies = await TMDB.getByGenre(genre.id, { page: 1 });
        return {
          title: genre.name,
          href: `/explore/genre/${buildExploreSpecificSlug('genre', genre.id, genre.name)}`,
          movies: mapMovies(movies.results)
        };
      })
    );

    sections = rows.filter((row) => row.movies.length > 0);
  }

  if (type === 'decade') {
    const rows = await Promise.all(
      EXPLORE_DECADES.slice(0, 6).map(async (decadeStart) => {
        const movies = await TMDB.getByDecade(decadeStart, { page: 1 });
        return {
          title: `${decadeStart}s`,
          href: `/explore/decade/${buildExploreSpecificSlug('decade', decadeStart)}`,
          movies: mapMovies(movies.results)
        };
      })
    );

    sections = rows.filter((row) => row.movies.length > 0);
  }

  if (type === 'actor') {
    const people = await TMDB.getPopularPeople({ page: 1 });
    const actors = people.results
      .filter((person) => person.known_for_department === 'Acting')
      .slice(0, 8);

    const rows = await Promise.all(
      actors.map(async (actor) => {
        const movies = await TMDB.getByPerson(actor.id, { page: 1 });
        return {
          title: actor.name,
          href: `/explore/actor/${buildExploreSpecificSlug('actor', actor.id, actor.name)}`,
          movies: mapMovies(movies.results)
        };
      })
    );

    sections = rows.filter((row) => row.movies.length > 0);
  }

  return {
    type,
    title: getExploreTypeTitle(type),
    sections
  };
};
