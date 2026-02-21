import { json } from '@sveltejs/kit';
import { TMDB } from '$lib/server/tmdb/controller';

export async function POST({ request }) {
  const { q } = await request.json();

  if (!q || q.length < 2) {
    return json({ actors: [] });
  }

  const result = await TMDB.search('person', {
    query: q,
    page: 1
  });

  const actors = result.results
    .filter(p => p.known_for_department === 'Acting')
    .slice(0, 6)
    .map(p => ({
      id: p.id,
      name: p.name
    }));

  return json({ actors });
}