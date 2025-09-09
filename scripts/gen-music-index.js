// vercel prebuild 에서는 js 파일 실행 가능(typescript 실행 불가)
import fs from 'fs';
import path from 'path';

const musicDir = path.resolve('static/music');
const thumbnailDir = path.resolve('static/thumbnail');

const musicFiles = fs.readdirSync(musicDir).filter((f) => f.endsWith('.mp3'));
const thumbnailFiles = fs.readdirSync(thumbnailDir);

const musicList = musicFiles.map((file) => {
	const name = file.replace('.mp3', '');
	const [title, artist] = name.split('-');
	const thumbnailFile = thumbnailFiles.find((t) => t.startsWith(artist));
	const thumbnail = thumbnailFile ? `/thumbnail/${thumbnailFile}` : '/thumbnail/none.jpg';

	return {
		title: title?.trim() ?? 'Unknown',
		artist: artist?.trim() ?? 'Unknown',
		src: `/music/${file}`,
		thumbnail
	};
});

fs.writeFileSync('static/index.json', JSON.stringify(musicList, null, 2));
console.log('✅ music/index.json 생성 완료!');
