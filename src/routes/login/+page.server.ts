import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { Actions } from './$types';

function getSafeRedirect(url: URL) {
  const redirectTo = url.searchParams.get('redirectTo');

  if (!redirectTo || !redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
    return '/';
  }

  return redirectTo;
}

export const actions: Actions = {
  signup: async ({ request, url }) => {
    const data = await request.formData();

    const email = data.get('email');
    const password = data.get('password');
    const name = data.get('name');

    if (typeof email !== 'string' || typeof password !== 'string') {
      return fail(400, { error: 'Invalid input' });
    }

    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: typeof name === 'string' ? name : ''
      }
    });

    if (!result) {
      return fail(400, { error: 'Sign up failed' });
    }

    throw redirect(303, getSafeRedirect(url));
  },

  login: async ({ request, url }) => {
    const data = await request.formData();

    const email = data.get('email');
    const password = data.get('password');

    if (typeof email !== 'string' || typeof password !== 'string') {
      return fail(400, { error: 'Invalid input' });
    }

    const result = await auth.api.signInEmail({
      body: {
        email,
        password
      }
    });

    if (!result) {
      return fail(401, { error: 'Invalid email or password' });
    }

    throw redirect(303, getSafeRedirect(url));
  }
};
