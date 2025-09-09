import { DOMAIN } from '$env/static/private';
import type { MusicItem } from '../types/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const res = await fetch(`${DOMAIN}/index.json`);
	const musicList: MusicItem[] = await res.json();
	return {
		musicList
	};
};
