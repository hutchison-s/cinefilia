import { TMDB } from "$lib/server/tmdb/controller";
import type { LayoutServerLoad } from "../../$types";

export const load: LayoutServerLoad = async ({ params, parent }) => {
  const { id } = params;
  const parentData = await parent();
  
  const movie = await TMDB.getMovie(Number(id), [
  'credits',
  'videos',
  'images',
  'recommendations'
].join(','));

  return {
    ...parentData,
    movie
  }
}