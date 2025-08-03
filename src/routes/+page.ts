// src/routes/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
    const musicFiles = import.meta.glob('/static/music/*.mp3', { eager: true, as: 'url' });
    const thumbnailFiles = import.meta.glob('/static/thumbnail/*.jpg', { eager: true, as: 'url' });

    const musicList = Object.keys(musicFiles).map((path) => {
        const title = path.split('/').pop()?.replace('.mp3', '') || 'Unknown Title';
        const thumbnail = thumbnailFiles[`/static/thumbnail/${title}.jpg`] || '/static/thumbnail/default.jpg';

        return {
            title: title.replace('-', ' '), 
            artist: 'Unknown Artist',
            src: musicFiles[path],
            thumbnail: thumbnail,
        };
    });

    return {
        musicList,
    };
};