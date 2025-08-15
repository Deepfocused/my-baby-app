import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';
import type { RequestHandler } from './$types';

// GET: 댓글 목록
export const GET: RequestHandler = async () => {
	const { data, error } = await supabase
		.from('comments')
		.select('*')
		.order('date', { ascending: false });
	if (error) return new Response(error.message, { status: 500 });
	return json(data);
};

// POST: 댓글 추가
export const POST: RequestHandler = async ({ request }) => {
	const { author, password, text } = await request.json();
	if (!author || !password || !text) return new Response('Bad Request', { status: 400 });

	const { data, error } = await supabase
		.from('comments')
		.insert([{ author, password, text, date: new Date(), timestamp: new Date().toLocaleString() }])
		.select()
		.single();

	if (error) return new Response(error.message, { status: 500 });
	return json(data);
};
