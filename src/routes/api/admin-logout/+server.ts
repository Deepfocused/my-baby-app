// src/routes/api/logout/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteSession } from '$lib/server/sessionStore';

export const POST: RequestHandler = async ({ cookies }) => {
	const sessionId = cookies.get('adminSession');
	if (!sessionId) return json({ success: false, message: '세션 없음' }, { status: 400 });

	await deleteSession(sessionId);
	cookies.delete('adminSession', { path: '/' });
	return json({ success: true });
};
