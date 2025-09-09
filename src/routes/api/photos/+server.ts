import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/superbase';
import { BUCKET_NAME, BUCKET_PATH } from '$env/static/private';
// import { join as joinPath } from 'path';
import type { RequestHandler } from './$types';

// 이미지 목록 불러오기
export const GET: RequestHandler = async () => {
	const { data, error } = await supabase.storage.from(BUCKET_NAME).list(BUCKET_PATH, {
		sortBy: { column: 'name', order: 'asc' }
	});

	if (error) return json({ error: '이미지 가져오기 실패!' });

	const files = data.map((item: { id: string; name: string; created_at: string }) => {
		const name = item.name;
		const downloadPath = `${BUCKET_PATH}/${name}`;
		const {
			data: { publicUrl }
		} = supabase.storage.from(BUCKET_NAME).getPublicUrl(downloadPath);
		const timestamp = new Date(item.created_at).toLocaleString('ko-KR', {
			timeZone: 'Asia/Seoul'
		});
		return {
			id: item.id, // 각 아이템마다 생성되도록 map 내부에서 생성
			url: publicUrl,
			name: name,
			timestamp: timestamp
		};
	});

	return json(files);
};

// 이미지 업로드
export const POST: RequestHandler = async ({ request }) => {
	const formData: FormData = await request.formData();
	const file = formData.get('file') as File;
	if (!file) return json({ error: '파일 없음' });

	const name: string = file.name;
	const timeStamp: string = new Date(Date.now()).toLocaleString('ko-KR', {
		timeZone: 'Asia/Seoul'
	});
	/*
	path.join은 운영체제별 경로 구분자를 사용
	Windows → \
	Linux/Mac → /
	브라우저 URL에서는 \가 인식되지 않음 → %5C로 인코딩되어 URL 깨짐
	--> 사용하면 안되겠다.
	*/
	// const uploadPath = joinPath(BUCKET_PATH, name);
	const uploadPath: string = `${BUCKET_PATH}/${name}`;
	const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(uploadPath, file);
	if (error) return json({ error: error.message });

	// public URL 가져오기
	const {
		data: { publicUrl }
	} = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
	return json({ id: data.id, url: publicUrl, name: name, timestamp: timeStamp });
};

// 이미지 삭제
export const DELETE: RequestHandler = async ({ request }) => {
	const { name }: { name: string } = await request.json();
	if (!name) return json({ error: `삭제할 이미지 ${name} 가 존재하지 않음` });

	const removePath: string = `${BUCKET_PATH}/${name}`;
	const { error } = await supabase.storage.from(BUCKET_NAME).remove([removePath]);
	if (error) return json({ error: error.message });
	return json({ success: true });
};
