import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  ConnectionService,
  parseConnectionEmail,
  type ConnectionStatus
} from '$lib/server/connection';

function asMessage(error: unknown) {
  if (error && typeof error === 'object' && 'body' in error) {
    const body = (error as { body?: { message?: string } }).body;
    if (body?.message) {
      return body.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong.';
}

function parseConnectionStatus(value: FormDataEntryValue | null): ConnectionStatus | null {
  if (value === 'accepted' || value === 'rejected') {
    return value;
  }

  return null;
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const userId = locals.user!.id;
  const connections = await ConnectionService.getConnections(userId);

  return {
    connections,
    inviteStatus: url.searchParams.get('inviteStatus')
  };
};

export const actions: Actions = {
  createLinkShare: async ({ locals, request, url }) => {
    try {
      await request.formData();
      const shareId = await ConnectionService.createLinkInvite(locals.user!.id);
      const shareUrl = new URL(`/connections/invite/${shareId}`, url).toString();

      return {
        shareUrl,
        success: 'Share link ready.'
      };
    } catch (error) {
      return fail(400, { error: asMessage(error) });
    }
  },

  shareByEmail: async ({ locals, request }) => {
    const formData = await request.formData();

    try {
      const email = parseConnectionEmail(formData);
      const result = await ConnectionService.createEmailInvite(locals.user!.id, email);

      return {
        success: `Sent a connection invite to ${result.recipient.email}.`
      };
    } catch (error) {
      return fail(400, { error: asMessage(error) });
    }
  },

  respondToPending: async ({ locals, request }) => {
    const formData = await request.formData();
    const recordId = formData.get('recordId');
    const status = parseConnectionStatus(formData.get('status'));

    if (typeof recordId !== 'string' || !status) {
      return fail(400, { error: 'Invalid pending share response.' });
    }

    try {
      await ConnectionService.respondToDirectInvite(recordId, locals.user!.id, status);
      return {
        success: status === 'accepted' ? 'Connection accepted.' : 'Invite rejected.'
      };
    } catch (error) {
      return fail(400, { error: asMessage(error) });
    }
  },

  stopConnection: async ({ locals, request }) => {
    const formData = await request.formData();
    const recordId = formData.get('recordId');

    if (typeof recordId !== 'string') {
      return fail(400, { error: 'Invalid connection.' });
    }

    try {
      await ConnectionService.stopConnection(recordId, locals.user!.id);
      return {
        success: 'Connection removed.'
      };
    } catch (error) {
      return fail(400, { error: asMessage(error) });
    }
  }
};
