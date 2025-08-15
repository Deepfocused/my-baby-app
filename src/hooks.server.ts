import type { Handle } from '@sveltejs/kit';
import { getSession } from '$lib/server/sessionStore';

// https://svelte.dev/docs/kit/hooks
export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('adminSession');

	if (sessionId) {
		const session = await getSession(sessionId);
		if (session) {
			event.locals.username = session.username;
		} else {
			event.locals.username = null;
		}
	} else {
		event.locals.username = null;
	}

	return await resolve(event);
};
