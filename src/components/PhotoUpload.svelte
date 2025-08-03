<script lang="ts">
	import type { Photo } from '../types/types';
	import toast, { Toaster } from 'svelte-5-french-toast';
	import { onMount } from 'svelte';
	import { scale, blur, fade, fly, slide } from 'svelte/transition';

	let photos = $state<Photo[]>([]);
	let fileInput: HTMLInputElement;
	let currentIndex = $state<number>(0);
	let showModal = $state<boolean>(false);

	// 사진 개수 제한 상수
	const MAX_PHOTOS = 8;

	// 슬라이드 제스처 감지
	let touchStartX = 0;
	let touchEndX = 0;

	let modalDiv = $state<HTMLDivElement | undefined>(undefined);
	$effect(() => {
		if (showModal) {
			modalDiv?.focus();
		}
	});

	onMount(() => {
		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'ArrowLeft') {
				prevPhoto();
			} else if (event.key === 'ArrowRight') {
				nextPhoto();
			}
			// if (event.key === 'Escape') closeModal(); # 이 방법이 위의 focus보다 더 편하긴 함
		}
		window.addEventListener('keydown', handleKeydown);
		// 🔥 컴포넌트가 언마운트될 때 호출됨
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = Array.from(target.files || []);

		// 현재 사진 개수를 파악
		const currentPhotoCount = photos.length;
		// 새로 업로드 가능한 최대 개수
		const remainingSlots = MAX_PHOTOS - currentPhotoCount;

		// 더 이상 업로드할 수 없다면 경고 메시지 표시
		if (remainingSlots <= 0) {
			toast(`사진은 최대 ${MAX_PHOTOS}개까지 업로드할 수 있습니다.`, {
				icon: '⚠️',
				duration: 2121
			});
			target.value = '';
			return;
		}

		// 새로 선택한 파일 중 업로드 가능한 개수만큼만 슬라이스
		const filesToUpload = files.slice(0, remainingSlots);

		for (const file of filesToUpload) {
			if (file.type.startsWith('image/')) {
				// 중복 이미지 업로드 제외
				const isDuplicate = photos.some((p) => p.name === file.name);
				if (isDuplicate) {
					toast(`"${file.name}"은 이미 업로드된 파일입니다.`, {
						icon: '❌',
						duration: 2121
					});
					continue;
				}
				const reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = (e: ProgressEvent<FileReader>) => {
					const newPhoto: Photo = {
						id: Date.now() + Math.random(),
						url: e.target?.result as string,
						name: file.name,
						timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'UTC' })
					};
					photos = [...photos, newPhoto];
					currentIndex = photos.length - 1;
				};
			}
		}
		/*
		한 번 선택된 파일은 같은 파일 다시 선택해도 onchange 이벤트가 안 일어날 수 있어서...
		파일 input 초기화 필요
		*/
		target.value = '';
	}

	function triggerFileInput(): void {
		fileInput?.click();
	}

	function removePhoto(id: number): void {
		photos = photos.filter((photo: Photo) => photo.id !== id);
		if (currentIndex >= photos.length) currentIndex = Math.max(0, photos.length - 1);
	}

	function nextPhoto() {
		if (photos.length > 0) currentIndex = (currentIndex + 1) % photos.length;
	}

	function prevPhoto() {
		if (photos.length > 0) currentIndex = (currentIndex - 1 + photos.length) % photos.length;
	}

	function openModal() {
		showModal = true;
	}

	function closeModal() {
		showModal = false;
	}

	function closeModalUsingKeyboard(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			showModal = false;
		}
	}

	// 드래그 감지
	function handleTouchStart(event: TouchEvent) {
		touchStartX = event.touches[0].clientX;
	}

	function handleTouchEnd(event: TouchEvent) {
		touchEndX = event.changedTouches[0].clientX;
		const diff = touchStartX - touchEndX;

		if (Math.abs(diff) > 21) {
			if (diff > 0) nextPhoto();
			else prevPhoto();
		}
	}
</script>

<!-- snippet 사용 -->
<!-- small or large 전용 리터럴 타입 -->
{#snippet Pagination(size: 'small' | 'large' = 'small')}
	<div class="mt-2 flex flex-wrap justify-center gap-2">
		{#each photos as photo, index (photo.id)}
			<!-- 템플릿 리터럴 사용(백틱 ` 와 함께) -->
			<button
				transition:fade={{ duration: 210 }}
				class={`cursor-pointer rounded-full font-bold transition ${
					size === 'small' ? 'h-6 w-6 text-sm' : 'h-12 w-12 text-lg'
				} ${
					index === currentIndex
						? 'bg-fuchsia-400 text-white'
						: 'bg-fuchsia-300 text-white opacity-50 hover:bg-fuchsia-400'
				}`}
				onclick={() => (currentIndex = index)}
				aria-label={`Go to photo ${index + 1}`}
			>
				{index + 1}
			</button>
		{/each}
	</div>
{/snippet}

<Toaster />
<!-- 업로드 UI -->
<div class="mb-6 rounded-3xl border border-fuchsia-200 bg-white/70 p-6 shadow-lg backdrop-blur-xs">
	<div class="mb-6 text-center">
		<span class="text-3xl">📸</span>
		<span class="text-2xl font-bold text-purple-400">소중한 순간</span>
		<span class="text-3xl">📸</span>
	</div>

	<div class="
		mb-6 text-center">
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
			class="rounded-2xl border-1 border-dashed border-fuchsia-200 bg-gradient-to-r from-pink-400 to-blue-400 text-white shadow-lg transition duration-300 hover:scale-110 hover:shadow-xl"
		>
			<div class="flex cursor-pointer items-center px-4 py-2">
				<span class="text-3xl">📱</span>
				<span class="text-lg font-bold">사진 업로드</span>
				<span class="text-3xl">📱</span>
			</div>
		</button>
	</div>

	<!-- 슬라이더 뷰 -->
	{#if photos.length > 0}
		<div 
		transition:blur={{ duration: 1221 }} 
		class="relative flex w-full flex-col items-center">
			<!-- 슬라이드 컨테이너 -->
			<div class="relative flex w-full items-center justify-center"
				ontouchstart={handleTouchStart}
				ontouchend={handleTouchEnd}
			>
				<!-- 왼쪽 화살표 -->
				<button
					onclick={prevPhoto}
					class="absolute left-0 z-14 cursor-pointer p-2 text-5xl text-fuchsia-400 transition duration-300 hover:scale-110 hover:text-fuchsia-500"
					>‹</button
				>

				<!-- 이미지 -->
				<!-- https://svelte.dev/docs/svelte/key 참고 -->
				{#key photos[currentIndex].id}
				<button onclick={openModal} class="w-full border-none bg-transparent p-0">
					<img
						transition:fade={{ duration: 210}} 
						src={photos[currentIndex].url}
						alt={photos[currentIndex].name}
						class="h-100 w-full cursor-pointer rounded-2xl bg-black object-contain shadow-md"
					/>
				</button>
				{/key}

				<!-- 오른쪽 화살표 -->
				<button
					onclick={nextPhoto}
					class="absolute right-0 z-14 cursor-pointer p-2 text-5xl text-fuchsia-400 transition duration-300 hover:scale-110 hover:text-fuchsia-500"
					>›</button
				>

				<!-- 삭제 버튼 -->
				<button
					onclick={() => removePhoto(photos[currentIndex].id)}
					class="absolute top-2 right-2 cursor-pointer rounded-full px-2 py-1 text-xl shadow-md transition duration-300 hover:scale-110"
				>
					🗑️
				</button>
			</div>

			<!-- 업로드 시간 -->
			<p class="mt-2 text-sm">{photos[currentIndex].timestamp}</p>
			<!-- 페이지네이션 -->
			{@render Pagination('small')}
		</div>
	{:else}
		<div class="flex h-115 w-full flex-col items-center justify-center text-gray-500">
			<span class="mb-2 block text-5xl">👶🏻</span>
		</div>
	{/if}
</div>

<!-- 이미지 모달 -->
{#if showModal}
	<div
		transition:scale={{ duration: 1221 }}
		bind:this={modalDiv}
		class="fixed inset-0 z-21 flex items-center justify-center bg-white/90"
		onclick={closeModal}
		onkeydown={closeModalUsingKeyboard}
		role="button"
		tabindex="0"
		aria-label="Close modal"
	>
		<div
			class="flex h-[80%] w-[80%] flex-col items-center"
			onclick={(e) => {
				e.stopPropagation();
			}}
			onkeydown={() => {}}
			role="button"
			tabindex="0"
			aria-label="Prevent Close modal"
		>
			<div class="relative z-22 flex h-full w-full items-center justify-center">

				<button
					onclick={() => removePhoto(photos[currentIndex].id)}
					class="absolute top-6 right-18 z-23 cursor-pointer rounded-full text-4xl shadow-md transition duration-300 hover:scale-110"
				>
					🗑️
				</button>
				
				<button
					onclick={closeModal}
					class="absolute top-1 right-4 z-23 cursor-pointer text-7xl text-fuchsia-400 transition duration-300 hover:scale-110 hover:text-fuchsia-500"
					>×</button
				>
				<button
					onclick={prevPhoto}
					class="absolute left-4 z-23 cursor-pointer text-7xl text-fuchsia-400 transition duration-300 hover:scale-110 hover:text-fuchsia-500"
					>‹</button
				>
				{#key photos[currentIndex].id}
				<img
					transition:fade={{ duration: 500}} 
					src={photos[currentIndex].url}
					alt={photos[currentIndex].name}
					class="absolute z-22 h-full w-full cursor-pointer rounded-2xl bg-black object-contain shadow-xl"
				/>
				{/key}
				
				<button
					onclick={nextPhoto}
					class="absolute right-4 z-23 cursor-pointer text-7xl text-fuchsia-400 transition duration-300 hover:scale-110 hover:text-fuchsia-500"
					>›</button
				>
			</div>
			<!-- 업로드 시간 -->
			<p class="mt-2 text-lg">{photos[currentIndex].timestamp}</p>
			<!-- 페이지네이션 -->
			{@render Pagination('large')}
		</div>
	</div>
{/if}
