import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const mediaId = Number(params.media_id);

  if (!Number.isFinite(mediaId) || mediaId <= 0) {
    throw redirect(302, '/');
  }

  if (locals.user) {
    throw redirect(302, `/movie/${mediaId}`);
  }

  return { mediaId };
};
