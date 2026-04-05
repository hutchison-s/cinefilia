import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const mediaId = Number(params.media_id);

  if (!Number.isFinite(mediaId) || mediaId <= 0) {
    throw redirect(302, '/');
  }

  throw redirect(302, `/movie/${mediaId}`);
};
