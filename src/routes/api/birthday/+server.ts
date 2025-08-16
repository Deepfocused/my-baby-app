import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

// 임시 저장용 (실제 서비스면 DB 사용)
let birthdayMessage = '2025년 8월 30일 15:00 에 태어나다!';

export const GET: RequestHandler = () => {
	return json({ message: birthdayMessage });
};

export const POST: RequestHandler = async ({ request }) => {
	const { message } = await request.json();
	birthdayMessage = message;
	return json({ message: birthdayMessage });
};
