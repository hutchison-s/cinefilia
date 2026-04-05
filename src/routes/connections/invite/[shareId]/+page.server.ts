import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ConnectionService } from '$lib/server/connection';

function getLoginRedirect(pathname: string, search: string) {
  const redirectTo = `${pathname}${search}`;
  return `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
}

export const load: PageServerLoad = async ({ locals, params, url }) => {
  if (!locals.user) {
    throw redirect(302, getLoginRedirect(url.pathname, url.search));
  }

  const invite = await ConnectionService.getInvite(params.shareId, locals.user.id);

  if (!invite.template) {
    throw error(404, 'Share invite not found.');
  }

  return {
    invite
  };
};

export const actions: Actions = {
  accept: async ({ locals, params, url }) => {
    if (!locals.user) {
      throw redirect(303, getLoginRedirect(url.pathname, url.search));
    }

    await ConnectionService.respondToLinkInvite(params.shareId, locals.user.id, 'accepted');
    throw redirect(303, '/connections?inviteStatus=accepted');
  },

  reject: async ({ locals, params, url }) => {
    if (!locals.user) {
      throw redirect(303, getLoginRedirect(url.pathname, url.search));
    }

    await ConnectionService.respondToLinkInvite(params.shareId, locals.user.id, 'rejected');
    throw redirect(303, '/connections?inviteStatus=rejected');
  }
};
