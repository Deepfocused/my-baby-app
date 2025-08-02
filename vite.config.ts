import { paraglideVitePlugin } from '@inlang/paraglide-js';
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		devtoolsJson(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	],
	// npm run dev -> host 및 port 수정
	server: {
		host: '0.0.0.0',
		port: 3000
	},
	// npm run preview -> host 및 port 수정
	preview: {
		host: '0.0.0.0',
		port: 3000
	}
});
