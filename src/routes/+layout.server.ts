import type { LayoutServerLoad } from './$types';

// https://svelte.dev/docs/kit/hooks
export const load: LayoutServerLoad = ({ locals, depends }) => {
	/* 
		종속성 선언 - invalidate 와 대응
		https://svelte.dev/docs/kit/$app-navigation
		https://svelte.dev/tutorial/kit/invalidation
		https://svelte.dev/tutorial/kit/custom-dependencies
	*/
	depends('admin:decision');
	return {
		isAdmin: locals.username,
		og: {
			title: '순돌이 탄생',
			description: '순돌이 탄생을 기념하는 페이지',
			image: 'https://my-baby-app.vercel.app/og.jpg', // 접근 가능한 이미지
			url: 'https://my-baby-app.vercel.app/'
		}
	};
};
