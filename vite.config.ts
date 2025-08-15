import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	// npm run dev -> host 및 port 수정
	server: {
		host: '0.0.0.0',
		port: 8021
	},
	// npm run preview -> host 및 port 수정
	preview: {
		host: '0.0.0.0',
		port: 8021
	}
});
