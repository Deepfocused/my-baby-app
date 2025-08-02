<script lang="ts">
	import { onMount } from 'svelte';
	import PhotoUpload from '../components/PhotoUpload.svelte';
	import CommentSection from '../components/CommentSection.svelte';
	import MusicPlayer from '../components/MusicPlayer.svelte';
	import FallingLeaves from '../components/FallingLeaves.svelte';
	let isLoggedIn = $state<boolean>(false);
	let currentUser = $state<string>('');

	onMount(() => {
		const savedUser: string | null = localStorage.getItem('celebrationUser');
		if (savedUser) {
			currentUser = savedUser;
			isLoggedIn = true;
		}
	});

	function handleLogin(username: string): void {
		currentUser = username;
		isLoggedIn = true;
		localStorage.setItem('celebrationUser', username);
	}

	function handleLogout(): void {
		isLoggedIn = false;
		currentUser = '';
		localStorage.removeItem('celebrationUser');
	}
</script>

<div class="bg-gradient-to-br from-teal-200 via-rose-100 to-lime-200">
	<FallingLeaves />

	<div class="relative z-7 container mx-auto max-w-md px-4 py-8">
		<!-- Header -->
		<div class="mb-8 text-center">
			<div class="rounded-3xl border border-rose-200 bg-white/70 p-6 shadow-lg backdrop-blur-xs">
				<p class="mb-2 hidden text-2xl font-bold text-rose-500 lg:block">
					너무💘귀여운 🦾순돌이🍼 탄생
				</p>
				<p class="mb-2 text-2xl font-bold text-rose-500 lg:hidden">
					너무💘귀여운 <br />🦾순돌이🍼 탄생
				</p>
				<p class="font-bold text-orange-500">2025년 9월 20일에 태어나다!</p>
				<div class="mt-1 flex justify-center space-x-2">
					<span class="text-3xl">👨🏻</span>
					<span class="text-2xl">👩🏻</span>
					<span class="text-xl">👶🏻</span>
				</div>
			</div>
		</div>

		<!-- Music Player -->
		<MusicPlayer />

		<!-- Photo Upload Section -->
		<PhotoUpload />

		<!-- Comment Section -->
		<CommentSection {isLoggedIn} {currentUser} {handleLogin} {handleLogout} />

		<!-- Footer -->
		<div class="mt-6 text-center text-sm text-gray-700">
			<p>🌸❤️ Made by 순돌이 아빠 ❤️🌸</p>
		</div>
	</div>
</div>
