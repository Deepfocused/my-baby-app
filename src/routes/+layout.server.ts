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
		isAdmin: locals.username
	};
};
