import { redirect, type Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const PUBLIC_PATHS = new Set(['/','/about','/login']);
const PUBLIC_PREFIXES = ['/api/auth', '/rec'];

function isPublicPath(pathname: string) {
	if (PUBLIC_PATHS.has(pathname)) return true;
	return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	const pathname = event.url.pathname;

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}
	
	if (!session && !isPublicPath(pathname)) {
		const redirectTo = encodeURIComponent(`${pathname}${event.url.search}`);
		throw redirect(303, `/login?redirectTo=${redirectTo}`);
	}

	if (session && pathname === '/login') {
		throw redirect(303, '/');
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
