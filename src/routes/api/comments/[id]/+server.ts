import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/superbase';
import type { RequestHandler } from './$types';

// 댓글 수정
export const PUT: RequestHandler = async ({ params, request }) => {
	const { id } = params;
	const { password, text } = await request.json();

	const { data, error } = supabase.from('comments').select('password').eq('id', id).single();
	if (error) return json({ error: error.message }, { status: 500 });
	if (!data || data.password !== password) json({ error: 'Unauthorized' }, { status: 401 });

	const { data, error } = supabase
		.from('comments')
		.update({ text, timestamp: new Date().toLocaleString() })
		.eq('id', id)
		.select()
		.single();
	if (error) return json({ error: error.message }, { status: 500 });
	return json(data);
};

// 댓글 삭제
export const DELETE: RequestHandler = async ({ params }) => {
	const { id } = params;
	const { error } = await supabase.from('comments').delete().eq('id', id);
	if (error) return json({ error: error.message }, { status: 500 });
	return json({ success: true });
};
