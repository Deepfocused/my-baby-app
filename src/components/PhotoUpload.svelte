<script lang="ts">
	import type { Photo } from '../types/types';

	let photos = $state<Photo[]>([]);
	let fileInput: HTMLInputElement;

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = Array.from(target.files || []);

		files.forEach((file: File) => {
			if (file.type.startsWith('image/')) {
				const reader = new FileReader();
				reader.onload = (e: ProgressEvent<FileReader>) => {
					const newPhoto: Photo = {
						id: Date.now() + Math.random(),
						url: e.target?.result as string,
						name: file.name,
						timestamp: new Date().toLocaleString()
					};
					photos = [...photos, newPhoto];
				};
				reader.readAsDataURL(file);
			}
		});
	}

	function removePhoto(id: number): void {
		photos = photos.filter((photo: Photo) => photo.id !== id);
	}

	function triggerFileInput(): void {
		fileInput?.click();
	}
</script>

<div class="mb-6 rounded-3xl border border-fuchsia-100 bg-white/80 p-6 shadow-lg backdrop-blur-xs">
	<h2 class="mb-4 text-center text-xl font-semibold text-fuchsia-400">📸 소중한 순간 기록 🤳🏻</h2>

	<!-- Upload Button -->
	<div class="mb-6 text-center">
		<input
			bind:this={fileInput}
			type="file"
			multiple
			accept="image/*"
			onchange={handleFileUpload}
			class="hidden"
		/>
		<button
			onclick={triggerFileInput}
			class="rounded-2xl border-1 border-dashed border-fuchsia-200 bg-gradient-to-r from-pink-400 to-blue-400 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
		>
			<div class="flex items-center p-2">
				<span class="text-3xl">📱</span>
				<span class="text-lg font-bold">사진 업로드</span>
				<span class="text-3xl">📱</span>
			</div>
		</button>
	</div>

	<!-- Photo Grid -->
	{#if photos.length > 0}
		<div class="grid grid-cols-2 gap-3">
			{#each photos as photo (photo.id)}
				<div class="group relative">
					<img
						src={photo.url || '/placeholder.svg?height=128&width=128&query=baby photo'}
						alt={photo.name}
						class="h-32 w-full rounded-2xl object-cover shadow-md"
					/>
					<button
						onclick={() => removePhoto(photo.id)}
						class="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-400 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
					>
						×
					</button>
					<div
						class="absolute right-0 bottom-0 left-0 rounded-b-2xl bg-black/50 p-2 text-xs text-white"
					>
						{photo.timestamp}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="py-8 text-center text-gray-500">
			<span class="mb-2 block text-4xl">👶🏻</span>
			<p>아직...</p>
		</div>
	{/if}
</div>
