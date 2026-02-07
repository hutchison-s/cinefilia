import { TMDB } from "$lib/server/tmdb/controller"
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const popular = await TMDB.getPopular({page: 1});
    const topRated = await TMDB.getTopRated({page: 1});
    const nowPlaying = await TMDB.getNowPlaying({page: 1});

    return {
        popular,
        topRated,
        nowPlaying
    };
}