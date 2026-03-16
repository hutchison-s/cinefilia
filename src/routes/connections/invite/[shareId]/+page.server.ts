import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ConnectionService } from '$lib/server/connection';

export const load: PageServerLoad = async ({ locals, params }) => {
  const invite = await ConnectionService.getInvite(params.shareId, locals.user!.id);

  if (!invite.template) {
    throw error(404, 'Share invite not found.');
  }

  return {
    invite
  };
};

export const actions: Actions = {
  accept: async ({ locals, params }) => {
    await ConnectionService.respondToLinkInvite(params.shareId, locals.user!.id, 'accepted');
    throw redirect(303, '/connections?inviteStatus=accepted');
  },

  reject: async ({ locals, params }) => {
    await ConnectionService.respondToLinkInvite(params.shareId, locals.user!.id, 'rejected');
    throw redirect(303, '/connections?inviteStatus=rejected');
  }
};
