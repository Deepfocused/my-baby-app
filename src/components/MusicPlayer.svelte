<script lang="ts">
	import { onMount } from 'svelte';

	let audio: HTMLAudioElement;
	let isPlaying = $state<boolean>(false);
	let isLoaded = $state<boolean>(false);

	onMount(() => {
		// Auto-play gentle music when page loads
		if (audio) {
			audio.volume = 0.5;
			audio.loop = true;

			// Try to auto-play (may be blocked by browser)
			audio
				.play()
				.then(() => {
					isPlaying = true;
				})
				.catch((error: Error) => {
					// Auto-play blocked, user will need to click play
					console.log('Auto-play blocked:', error.message);
				});
		}
	});

	function togglePlay(): void {
		if (!audio) return;

		if (isPlaying) {
			audio.pause();
			isPlaying = false;
		} else {
			audio.play();
			isPlaying = true;
		}
	}

	function handleLoadedData(): void {
		isLoaded = true;
	}
</script>

<div class="mb-6 rounded-3xl border border-green-200 bg-white/80 p-4 shadow-lg backdrop-blur-xs">
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-3">
			<span class="text-5xl">🎵</span>
			<div>
				<p class="text-xl font-bold text-gray-700">태어나.mp3</p>
			</div>
		</div>

		<button
			onclick={togglePlay}
			class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-pink-400 to-blue-400 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
		>
			{#if isPlaying}
				<span class="text-2xl">⏸️</span>
			{:else}
				<span class="text-xl">▶️</span>
			{/if}
		</button>
	</div>

	<!-- Audio element with placeholder lullaby -->
	<audio
		bind:this={audio}
		src="/placeholder.mp3?query=gentle piano lullaby for newborn baby"
		onloadeddata={handleLoadedData}
	></audio>
</div>
