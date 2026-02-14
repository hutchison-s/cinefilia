import { TMDB } from '$lib/server/tmdb/controller';
import { buildExploreSpecificSlug } from '$lib/utils/explore';
import type { PageServerLoad } from './$types';

function calculateAge(birthday?: string | null, deathday?: string | null) {
  if (!birthday) return null;

  const birth = new Date(birthday);
  if (Number.isNaN(birth.getTime())) return null;

  const end = deathday ? new Date(deathday) : new Date();
  if (Number.isNaN(end.getTime())) return null;

  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();
  const beforeBirthday = monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
}

export const load: PageServerLoad = async () => {
  const [p1, p2, p3] = await Promise.all([
    TMDB.getPopularPeople({ page: 1 }),
    TMDB.getPopularPeople({ page: 2 }),
    TMDB.getPopularPeople({ page: 3 })
  ]);

  const deduped = new Map<number, (typeof p1.results)[number]>();
  [...p1.results, ...p2.results, ...p3.results]
    .filter((person) => person.known_for_department === 'Acting')
    .forEach((person) => {
      if (!deduped.has(person.id)) deduped.set(person.id, person);
    });

  const candidates = [...deduped.values()].slice(0, 48);

  const actors = await Promise.all(
    candidates.map(async (person) => {
      const detail = await TMDB.getPerson(person.id);
      const age = calculateAge(detail.birthday, detail.deathday);

      return {
        id: person.id,
        name: person.name,
        profilePath: person.profile_path,
        popularity: person.popularity,
        age,
        href: `/explore/actor/${buildExploreSpecificSlug('actor', person.id, person.name)}`
      };
    })
  );

  return {
    actors
  };
};
