// src/routes/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
    // 1. import.meta.glob 찾아보기
    const musicFiles = import.meta.glob('/static/music/*.mp3', { eager: true, as: 'url' });
    const thumbnailFiles = import.meta.glob('/static/thumbnail/*.jpg', { eager: true, as: 'url' });

    const musicList = Object.keys(musicFiles).map((path) => {
        const name = path.split('/').pop()?.replace('.mp3', '') || 'Unknown';
        const title = name?.split('-')[0];
        const artist = name?.split('-')[1];
        const thumbnail = thumbnailFiles[`/static/thumbnail/${artist}.jpg`] || '/static/thumbnail/default.jpg';

        return {
            title: title, 
            artist: artist,
            src: musicFiles[path],
            thumbnail: thumbnail,
        };
    });

    return {
        musicList,
    };
};