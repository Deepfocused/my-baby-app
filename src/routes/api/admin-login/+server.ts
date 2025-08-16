import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSession } from '$lib/server/sessionStore';
import { ADMIN_ID, ADMIN_PW } from '$env/static/private';

const AID = ADMIN_ID || 'test';
const APW = ADMIN_PW || 'test';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { username, password } = await request.json();
	if (!username || !password)
		return json({ error: `username or password 정보 없음` }, { status: 400 });
	/* 
		세션아이디 랜덤하게 발급 -> 서버 메모리에 저장
		세션 탈취 방지에 최소한의 보안만 설정
		-> httpOnly, secure	
	*/
	if (username === AID && password === APW) {
		const sessionId = await createSession(username);
		cookies.set('adminSession', sessionId, {
			httpOnly: true,
			secure: true,
			path: '/',
			sameSite: 'strict',
			maxAge: 60 * 60 // 1시간
		});

		return json({ success: true });
	}
	return json({ success: false, message: '로그인 실패' }, { status: 401 });
};
