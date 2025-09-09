import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/superbase';
import crypto from 'crypto';
import { toKST } from '$lib/server/dateconversion';
import type { Comment } from '../../../../types/types';
import type { RequestHandler } from './$types';

// 비밀번호 확인
export const POST: RequestHandler = async ({ params, request }) => {
	const confirmEditId: string = params.id;
	const { confirmPassword } = await request.json();
	if (!confirmPassword) return json({ error: '잘못된 요청!' });
	const hashedComfirmPassword: string = crypto
		.createHash('sha256')
		.update(confirmPassword)
		.digest('hex');

	const { data, error } = await supabase
		.from('comments')
		.select('password')
		.eq('id', confirmEditId)
		.single();

	if (error) return json({ error: error.message });

	if (data.password !== hashedComfirmPassword) {
		return json({ error: '비밀번호 틀림!' });
	}
	return json({ success: true });
};

// 댓글 수정
export const PUT: RequestHandler = async ({ params, request }) => {
	const confirmEditId: string = params.id;
	const { editPassword, editText } = await request.json(); // text는 빈값이어도 됨
	if (!editPassword) return json({ error: '잘못된 요청!' });
	const hashedEditPassword: string = crypto.createHash('sha256').update(editPassword).digest('hex');

	const { data, error } = await supabase
		.from('comments')
		.update({
			password: hashedEditPassword,
			text: editText
		})
		.eq('id', confirmEditId)
		.select('id, username, text, id_updated')
		.single();
	if (error) return json({ error: '댓글 업데이트 실패!' });
	// 한국 시간
	const formatted: Comment = { ...data, timestamp: toKST(data.id_updated) };
	return json(formatted);
};

// 댓글 삭제
export const DELETE: RequestHandler = async ({ params, request }) => {
	const confirmDeleteId: string = params.id;
	const { confirmPassword } = await request.json();
	const hashedComfirmPassword: string = crypto
		.createHash('sha256')
		.update(confirmPassword)
		.digest('hex');

	const { data, error } = await supabase
		.from('comments')
		.select('password')
		.eq('id', confirmDeleteId)
		.single();

	if (error) return json({ error: error.message });

	if (data.password !== hashedComfirmPassword) {
		return json({ error: '비밀번호 틀림!' });
	}

	const { error: delError } = await supabase.from('comments').delete().eq('id', confirmDeleteId);
	if (delError) return json({ error: '댓글 삭제 실패!' });
	return json({ success: true });
};
