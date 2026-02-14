import type { ExploreType } from '$lib/server/tmdb/controller';

export const EXPLORE_DECADES = [2020, 2010, 2000, 1990, 1980, 1970, 1960];

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildExploreSpecificSlug(type: ExploreType, idOrDecade: number, name?: string) {
  if (type === 'decade') {
    return `${idOrDecade}s`;
  }

  const safeName = slugify(name ?? String(idOrDecade));
  return `${idOrDecade}-${safeName}`;
}

export function parseExploreSpecific(type: ExploreType, specific: string): number | null {
  if (type === 'decade') {
    const decade = Number(specific.replace(/s$/i, ''));
    return Number.isFinite(decade) ? decade : null;
  }

  const id = Number(specific.split('-')[0]);
  return Number.isFinite(id) ? id : null;
}

export function getExploreTypeTitle(type: ExploreType) {
  switch (type) {
    case 'genre':
      return 'Genres';
    case 'decade':
      return 'Decades';
    case 'actor':
      return 'Actors';
    default:
      return 'Explore';
  }
}
