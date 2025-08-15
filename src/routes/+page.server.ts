// src/routes/+page.server.ts
import fs from 'fs';
import path from 'path';
import type { MusicItem } from '../types/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const musicDir = path.resolve('static/music');
	const thumbnailDir = path.resolve('static/thumbnail');

	// 1. 파일 이름 리스트 가져오기
	const musicFiles: string[] = fs.readdirSync(musicDir).filter((f: string) => f.endsWith('.mp3'));
	const thumbnailFiles: string[] = fs.readdirSync(thumbnailDir);

	// 2. 음악 리스트 구성
	const musicList: MusicItem[] = musicFiles.map((file: string) => {
		const name = file.replace('.mp3', '');
		const [title, artist] = name.split('-');
		const thumbnailFile = thumbnailFiles.find((t: string) => t.startsWith(artist));
		const thumbnail = thumbnailFile ? `/thumbnail/${thumbnailFile}` : '/thumbnail/none.jpg';

		return {
			title: title?.trim() ?? 'Unknown',
			artist: artist?.trim() ?? 'Unknown',
			src: `/music/${file}`,
			thumbnail
		};
	});

	return {
		musicList
	};
};
