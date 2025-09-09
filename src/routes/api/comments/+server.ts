import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/superbase';
import { toKST } from '$lib/server/dateconversion';
import crypto from 'crypto';
import type { Comment } from '../../../types/types';
import type { RequestHandler } from './$types';

// 댓글 목록 얻기
export const GET: RequestHandler = async () => {
	const { data, error } = await supabase
		.from('comments')
		.select('id, username, text, id_created, id_updated, likes') // password 제외
		.order('id_created', { ascending: false });

	if (error) return json({ error: '댓글 가져오기 실패!' });

	// 한국 시간
	const formatted: Comment[] = data.map((column) => ({
		...column,
		timestamp: toKST(column.id_created ?? column.id_updated)
	}));
	return json(formatted);
};

// 댓글 추가
export const POST: RequestHandler = async ({ request }) => {
	const { username, password, text }: { username: string; password: string; text: string } =
		await request.json();
	if (!username || !password) return json({ error: '잘못된 요청!' }); // text는 빈값이어도 됨

	const hashedPassword: string = crypto.createHash('sha256').update(password).digest('hex');
	const { data, error } = await supabase
		.from('comments')
		.insert([
			{
				username: username,
				password: hashedPassword,
				text: text
			}
		])
		.select('id, username, text, id_created, likes') // password 제외
		.single();

	if (error) return json({ error: '댓글 추가 실패!' });
	// 한국 시간
	const formatted: Comment = { ...data, timestamp: toKST(data.id_created) };
	return json(formatted);
};

// 관리자 댓글 삭제
export const DELETE: RequestHandler = async ({ request }) => {
	const { confirmDeleteId }: { confirmDeleteId: string } = await request.json();
	if (!confirmDeleteId) return json({ error: '잘못된 요청!' });
	const { error } = await supabase.from('comments').delete().eq('id', confirmDeleteId);
	if (error) return json({ error: '관리자 댓글 삭제 실패!' });
	return json({ success: true });
};
