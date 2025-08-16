import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/superbase';
import type { RequestHandler } from './$types';

// 댓글 목록 얻기
export const GET: RequestHandler = async () => {
	const { data, error } = await supabase
		.from('comments')
		.select('*')
		.order('date', { ascending: false });
	if (error) return json({ error: error.message }, { status: 500 });
	return json(data);
};

// 댓글 추가
export const POST: RequestHandler = async ({ request }) => {
	const { author, password, text } = await request.json();
	if (!author || !password || !text) return new Response('Bad Request', { status: 400 });

	const { data, error } = await supabase
		.from('comments')
		.insert([{ author, password, text, date: new Date(), timestamp: new Date().toLocaleString() }])
		.select()
		.single();
	if (error) return json({ error: error.message }, { status: 500 });
	return json(data);
};
