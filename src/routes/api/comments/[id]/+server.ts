import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/superbase';
import type { RequestHandler } from './$types';

// DELETE
export const DELETE: RequestHandler = async ({ params }) => {
	const { id } = params;
	const { error } = await supabase.from('comments').delete().eq('id', id);
	if (error) return new Response(error.message, { status: 500 });
	return new Response('Deleted', { status: 200 });
};

// PUT (수정)
export const PUT: RequestHandler = async ({ params, request }) => {
	const { id } = params;
	const { password, text } = await request.json();

	const { data: comment, error: fetchError } = supabase
		.from('comments')
		.select('password')
		.eq('id', id)
		.single();
	if (fetchError) return new Response(fetchError.message, { status: 500 });
	if (!comment || comment.password !== password)
		return new Response('Unauthorized', { status: 401 });

	const { data, error } = supabase
		.from('comments')
		.update({ text, timestamp: new Date().toLocaleString() })
		.eq('id', id)
		.select()
		.single();
	if (error) return new Response(error.message, { status: 500 });
	return json(data);
};
