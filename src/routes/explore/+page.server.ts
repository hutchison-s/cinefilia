import { TMDB } from '$lib/server/tmdb/controller';
import { EXPLORE_DECADES, buildExploreSpecificSlug } from '$lib/utils/explore';
import type { PageServerLoad } from './$types';
import { GenreRepo } from '$lib/server/repos/genre.repo';

function groupModuleUrlsByFolder(
  modules: Record<string, string>,
  folderRegex: RegExp
): Record<string, string[]> {
  const grouped = Object.entries(modules).reduce<Record<string, string[]>>((acc, [modulePath, url]) => {
    const folder = modulePath.match(folderRegex)?.[1];
    if (!folder) return acc;
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(url);
    return acc;
  }, {});

  for (const folder of Object.keys(grouped)) {
    grouped[folder].sort();
  }

  return grouped;
}

const genreGridModules = import.meta.glob('$lib/assets/genre-posters/*/*.jpg', {
  eager: true,
  import: 'default'
}) as Record<string, string>;

const genreGridPathsByFolder = groupModuleUrlsByFolder(
  genreGridModules,
  /\/genre-posters\/([^/]+)\//
);

function getGenreGridPaths(name: string) {
  const folder = name.toLowerCase().replace(/[^a-z]/g, '');
  if (genreGridPathsByFolder[folder]) return genreGridPathsByFolder[folder];
  // Compatibility: older downloaded folder name from TMDB default label
  if (folder === 'scifi' && genreGridPathsByFolder.sciencefiction) {
    return genreGridPathsByFolder.sciencefiction;
  }
  return [];
}

const decadePosterModules = import.meta.glob('$lib/assets/decade-posters/*/*.jpg', {
  eager: true,
  import: 'default'
}) as Record<string, string>;

const decadePosterPathsByLabel = groupModuleUrlsByFolder(
  decadePosterModules,
  /\/decade-posters\/([^/]+)\//
);

export const load: PageServerLoad = async () => {
  const [genres, people] = await Promise.all([
    GenreRepo.list(),
    TMDB.getPopularPeople({ page: 1 })
  ]);

  const genreItems = genres.map((genre) => ({
    label: genre.name,
    href: `/explore/genre/${buildExploreSpecificSlug('genre', genre.id, genre.name)}`,
    imageGridPaths: getGenreGridPaths(genre.name)
  }));

  const decadeItems = EXPLORE_DECADES.map((decade) => ({
    label: `${decade}s`,
    href: `/explore/decade/${buildExploreSpecificSlug('decade', decade)}`,
    imageGridPaths: decadePosterPathsByLabel[`${decade}s`] ?? []
  }));

  const actors = people.results
    .filter((person) => person.known_for_department === 'Acting')
    .slice(0, 20);

  const actorItemsRaw = await Promise.all(
    actors.map(async (actor) => {
      const movies = await TMDB.getByPerson(actor.id, {
        page: 1,
        sortBy: 'popularity.desc',
        originCountry: 'US'
      });
      const imageGridPaths = movies.results
        .filter((movie) => movie.poster_path)
        .slice(0, 4)
        .map((movie) => `https://image.tmdb.org/t/p/w500${movie.poster_path}`);

      return {
        label: actor.name,
        href: `/explore/actor/${buildExploreSpecificSlug('actor', actor.id, actor.name)}`,
        imageGridPaths,
        imagePath: actor.profile_path
          ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
          : null
      };
    })
  );
  const actorItems = actorItemsRaw
    .filter((item) => item.imageGridPaths.length > 0)

  return {
    categories: [
      { title: 'Genres', href: '/explore/genre', items: genreItems },
      { title: 'Decades', href: '/explore/decade', items: decadeItems },
      { title: 'Actors', href: '/explore/actor', items: actorItems }
    ]
  };
};
