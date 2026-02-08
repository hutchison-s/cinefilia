import { json, type RequestEvent } from '@sveltejs/kit';
import { TMDB, type SearchType } from '$lib/server/tmdb/controller';

export async function GET({ url }: RequestEvent) {
  const query = url.searchParams.get('q') ?? '';
  const page = Number(url.searchParams.get('page') ?? '1');
  const type = (url.searchParams.get('type') ?? 'multi') as SearchType;

  if (!query.trim()) {
    return json({
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
      hasNextPage: false,
      hasPrevPage: false
    });
  }

  const data = await TMDB.search(type, {
    query,
    page
  });

  return json(data);
}
