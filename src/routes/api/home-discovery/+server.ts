import { json } from '@sveltejs/kit';
import { getHomeDiscovery } from '$lib/server/homeDiscovery';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json(
      {
        inTheaters: [],
        recommendationSections: []
      },
      { status: 401 }
    );
  }

  const discovery = await getHomeDiscovery(locals.user.id);

  return json(discovery);
};
