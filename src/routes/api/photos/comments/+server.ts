import type { RequestHandler } from '../$types';
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/superbase';
import type { PhotoComent } from '../../../../types/types';

// 이미지 설명 목록 얻기
export const GET: RequestHandler = async () => {
	const { data, error } = await supabase.from('photocomments').select('photoid, description'); // password 제외
	if (error) return json({ error: '이미지 설명 가져오기 실패!' });
	return json(data as PhotoComent[]);
};

// 이미지 설명 목록 업데이트
export const POST: RequestHandler = async ({ request }) => {
	const { photoid, description }: PhotoComent = await request.json();

	if (!photoid) return json({ error: '잘못된 요청!' });

	const { data, error } = await supabase
		.from('photocomments')
		.insert({ photoid, description })
		.select('photoid, description')
		.single();

	if (error) return json({ error: '이미지 설명 업로드 실패!' });

	return json(data as PhotoComent);
};

// 이미지 설명 목록 업데이트
export const PUT: RequestHandler = async ({ request }) => {
	const { photoid, description }: PhotoComent = await request.json();

	if (!photoid) return json({ error: '잘못된 요청!' });

	const { data, error } = await supabase
		.from('photocomments')
		.upsert({ photoid, description }, { onConflict: 'photoid' })
		.select('photoid, description')
		.maybeSingle();

	if (error) return json({ error: '이미지 설명 업데이트 실패!' });

	return json(data as PhotoComent);
};

// 이미지 설명 삭제
export const DELETE: RequestHandler = async ({ request }) => {
	const { photoid } = await request.json();
	if (!photoid) return json({ error: '잘못된 요청!' });
	const { error } = await supabase.from('photocomments').delete().eq('photoid', photoid);
	if (error) return json({ error: '이미지 설명 삭제 실패!' });
	return json({ success: true });
};
