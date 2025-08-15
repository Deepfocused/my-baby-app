// src/routes/api/logout/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteSession } from '$lib/server/sessionStore';

export const POST: RequestHandler = async ({ cookies }) => {
	const sessionId = cookies.get('adminSession');
	if (sessionId) {
		await deleteSession(sessionId);
	}
	cookies.delete('adminSession', { path: '/' });
	return json({ success: true });
};
