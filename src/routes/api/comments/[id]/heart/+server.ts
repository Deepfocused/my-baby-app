import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/superbase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	const { id } = params;
	const { likes } = await request.json();

	if (!id) return json({ error: `comment ${id} 가 존재하지 않음` });

	const { error } = await supabase.from('comments').update({ likes }).eq('id', id);

	if (error) return json({ error: error.message }, { status: 500 });

	return json({ success: true });
};
