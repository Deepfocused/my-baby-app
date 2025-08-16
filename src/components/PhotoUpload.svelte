<script lang="ts">
	import type { Photo } from '../types/types';
	import toast, { Toaster } from 'svelte-5-french-toast';
	import { onMount } from 'svelte';
	import { scale, fade } from 'svelte/transition';

	let { isAdmin }: { isAdmin: boolean } = $props();
	let photos = $state<Photo[]>([]);
	let fileInput: HTMLInputElement;
	let currentIndex = $state<number>(0);
	let showModal = $state<boolean>(false);

	// 사진 개수 제한 상수
	const MAX_PHOTOS = 7;

	// 슬라이드 제스처 감지
	let touchStartX = 0;
	let touchEndX = 0;

	let modalDiv = $state<HTMLDivElement | undefined>(undefined);

	const loadPhotos: () => Promise<void> = async () => {
		try {
			const res = await fetch('/api/photos');
			const download = await res.json();

			if (download?.error) {
				toast(`이미지 로딩 실패: ${download.error}`, { icon: '❌', duration: 1000 });
				return;
			}

			photos = download
				.filter((item: Photo) => item.name !== '.emptyFolderPlaceholder') // 이름이 .emptyFolderPlaceholder 인 아이템 제외
				.map((item: Photo) => ({
					id: item.id,
					url: item.url,
					name: item.name,
					timestamp: item.timestamp
				}));
		} catch (err) {
			if (err instanceof Error) {
				toast(`이미지 로딩중 오류 발생: ${err.message}`, { icon: '😥', duration: 1000 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 1000 });
			}
		}
	};

	const handleFileUpload: (event: Event) => Promise<void> = async (event) => {
		try {
			const target = event.target as HTMLInputElement;
			const files = Array.from(target.files || []);

			if (files.length > MAX_PHOTOS) {
				toast(`최대 ${MAX_PHOTOS}장만 업로드 가능!`, { icon: '⚠️', duration: 1000 });
			}

			// 업로드 가능한 개수만큼만 선택
			const filesToUpload = files.slice(0, MAX_PHOTOS);
			for (const file of filesToUpload) {
				if (!file.type.startsWith('image/')) continue;

				const isDuplicate = photos.some((photo: Photo) => photo.name === file.name);
				if (isDuplicate) {
					toast(`"${file.name}"은 이미 업로드된 파일!`, { icon: '❌', duration: 1000 });
					continue;
				}

				// 서버에 업로드
				const formData = new FormData();
				formData.append('file', file);

				const res = await fetch('/api/photos', { method: 'POST', body: formData });
				const upload = await res.json();
				if (upload?.error) {
					toast(`이미지 업로드 실패: ${upload.error}`, { icon: '❌', duration: 1000 });
					continue;
				}

				// 서버에서 반환한 URL 사용
				const newPhoto: Photo = {
					id: upload.id,
					url: upload.url, // 서버에서 받은 publicUrl
					name: upload.name,
					timestamp: upload.timestamp
				};

				photos = [...photos, newPhoto];
				currentIndex = photos.length - 1;

				toast('이미지 업로드 완료!', { icon: '✅', duration: 1000 });
			}

			/*
		한 번 선택된 파일은 같은 파일 다시 선택해도 onchange 이벤트가 안 일어날 수 있어서...
		파일 input 초기화 필요
		*/
			target.value = '';
		} catch (err) {
			if (err instanceof Error) {
				toast(`이미지 업로드 중 오류 발생: ${err.message}`, { icon: '😥', duration: 1000 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 1000 });
			}
		}
	};

	const removePhoto: (id: string) => Promise<void> = async (id) => {
		const targetPhoto = photos.find((photo: Photo) => photo.id === id);
		if (!targetPhoto) return;

		// 1. UI 상에서 먼저 제거하기
		photos = photos.filter((photo: Photo) => photo.id !== id);
		if (currentIndex >= photos.length) currentIndex = Math.max(0, photos.length - 1);
		if (photos.length === 0) showModal = false; // modal 창에 컨텐츠가 아무것도 없을 때

		// 2. api 서버에서 삭제하기
		try {
			const res = await fetch('/api/photos', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: targetPhoto.name })
			});
			const remove = await res.json();
			if (remove?.error) {
				toast(`이미지 삭제 실패: ${remove.error}`, { icon: '❌', duration: 1000 });
				return;
			}
		} catch (err) {
			if (err instanceof Error) {
				toast(`이미지 삭제 중 오류 발생: ${err.message}`, { icon: '😥', duration: 1000 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 1000 });
			}
		}
	};

	const triggerFileInput: () => void = () => {
		fileInput?.click();
	};

	const nextPhoto: () => void = () => {
		if (photos.length > 0) currentIndex = (currentIndex + 1) % photos.length;
	};

	const prevPhoto: () => void = () => {
		if (photos.length > 0) currentIndex = (currentIndex - 1 + photos.length) % photos.length;
	};

	const openModal: () => void = () => {
		showModal = true;
	};

	const closeModal: () => void = () => {
		showModal = false;
	};

	const closeModalUsingKeyboard: (event: KeyboardEvent) => void = (event) => {
		if (event.key === 'Escape') {
			showModal = false;
		}
	};

	// 드래그 감지
	const handleTouchStart: (event: TouchEvent) => void = (event) => {
		touchStartX = event.touches[0].clientX;
	};

	const handleTouchEnd: (event: TouchEvent) => void = (event) => {
		touchEndX = event.changedTouches[0].clientX;
		const diff = touchStartX - touchEndX;

		if (Math.abs(diff) > 21) {
			if (diff > 0) nextPhoto();
			else prevPhoto();
		}
	};

	onMount(() => {
		// 즉시 실행
		// const init: () => Promise<void> = async () => {
		// 	await loadPhotos();
		// }
		// init();
		(async (): Promise<void> => {
			await loadPhotos();
		})();

		const handleKeydown: (event: KeyboardEvent) => void = (event) => {
			if (event.key === 'ArrowLeft') {
				prevPhoto();
			} else if (event.key === 'ArrowRight') {
				nextPhoto();
			}
			// if (event.key === 'Escape') closeModal(); # 이 방법이 위의 focus보다 더 편하긴 함
		};
		window.addEventListener('keydown', handleKeydown);
		// 🔥 컴포넌트가 언마운트될 때 호출됨
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	$effect(() => {
		if (showModal) {
			modalDiv?.focus();
		}
	});
</script>

<!-- snippet 사용 -->
<!-- small or large 전용 리터럴 타입 -->
{#snippet Pagination(size: 'small' | 'large' = 'small')}
	<div class="mt-2 flex flex-wrap justify-center gap-2">
		{#each photos as photo, index (photo.id)}
			<!-- 템플릿 리터럴 사용(백틱 ` 와 함께) -->
			<button
				transition:fade={{ duration: 200 }}
				class={`cursor-pointer rounded-lg font-bold transition ${
					size === 'small' ? 'h-6 w-6 text-sm' : 'h-6 w-6 text-sm sm:h-12 sm:w-12 sm:text-lg'
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

<div class="text-sm max-[480px]:text-xs">
	<Toaster position="top-center" />
</div>
<!-- 업로드 UI -->
<div
	class="mb-6 rounded-lg border border-fuchsia-200 bg-white/80 p-6 shadow-xl shadow-fuchsia-50 backdrop-blur-xs transition duration-1000 hover:shadow-fuchsia-200"
>
	<div class="mb-6 text-center">
		<span class="text-3xl">📸</span>
		<span class="text-2xl font-bold text-purple-400">소중한 순간</span>
		<span class="text-3xl">📸</span>
	</div>

	<div
		class="
		mb-6 text-center"
	>
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
			disabled={!isAdmin}
			class="rounded-lg border-1 border-dashed border-fuchsia-200 bg-gradient-to-r from-pink-400 to-blue-400 text-white transition duration-300 hover:scale-110 hover:shadow-xl hover:shadow-fuchsia-200 disabled:opacity-50 disabled:hover:scale-100"
		>
			{#if isAdmin}
				<div class="flex cursor-pointer items-center px-4 py-2">
					<span class="text-3xl">📱</span>
					<span class="text-lg font-bold">사진 업로드</span>
					<span class="text-3xl">📱</span>
				</div>
			{:else}
				<div class="flex cursor-not-allowed items-center px-4 py-2">
					<span class="text-3xl">📱</span>
					<span class="text-lg font-bold">사진 업로드</span>
					<span class="text-3xl">📱</span>
				</div>
			{/if}
		</button>
	</div>

	<!-- 슬라이더 뷰 -->
	{#if photos.length > 0}
		<div class="flex w-full flex-col items-center">
			<!-- 슬라이드 컨테이너 -->
			<div
				class="relative flex w-full items-center justify-center"
				ontouchstart={handleTouchStart}
				ontouchend={handleTouchEnd}
			>
				<!-- 왼쪽 화살표 -->
				<button
					onclick={prevPhoto}
					class="absolute left-0 z-14 cursor-pointer p-2 text-5xl text-fuchsia-400 transition duration-300 hover:scale-110 hover:text-fuchsia-500"
					>‹</button
				>

				<button class="h-100 w-full" onclick={openModal}>
					{#each photos as photo, index (photo.id)}
						{#if index === currentIndex}
							<img
								transition:fade={{ duration: 200 }}
								src={photo.url}
								alt={photo.name}
								class="absolute inset-0 h-full w-full cursor-pointer rounded-lg bg-black object-contain shadow-xl"
							/>
						{/if}
					{/each}
				</button>

				<!-- 오른쪽 화살표 -->
				<button
					onclick={nextPhoto}
					class="absolute right-0 z-14 cursor-pointer p-2 text-5xl text-fuchsia-400 transition duration-300 hover:scale-110 hover:text-fuchsia-500"
					>›</button
				>
				<!-- 삭제 버튼 -->
				{#if isAdmin}
					<button
						onclick={() => removePhoto(photos[currentIndex].id)}
						class="absolute top-2 right-2 cursor-pointer rounded-lg px-2 py-1 text-xl transition duration-300 hover:scale-110"
					>
						🗑️
					</button>
				{:else}
					<button
						onclick={() => removePhoto(photos[currentIndex].id)}
						disabled={!isAdmin}
						class="absolute top-2 right-2 cursor-not-allowed rounded-lg px-2 py-1 text-xl transition duration-300 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
					>
						🗑️
					</button>
				{/if}
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
		transition:scale={{ duration: 1000 }}
		bind:this={modalDiv}
		class="fixed inset-0 z-21 flex items-center justify-center bg-white/80"
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
			aria-label="Prevent close modal"
		>
			<div class="relative z-22 flex h-full w-full items-center justify-center">
				{#if isAdmin}
					<button
						onclick={() => removePhoto(photos[currentIndex].id)}
						class="absolute top-2 right-10 z-23 cursor-pointer rounded-lg text-xl transition duration-300 hover:scale-110 sm:top-3 sm:right-12 sm:text-2xl"
					>
						🗑️
					</button>
				{:else}
					<button
						onclick={() => removePhoto(photos[currentIndex].id)}
						disabled={!isAdmin}
						class="absolute top-2 right-10 z-23 cursor-not-allowed rounded-lg text-xl transition duration-300 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 sm:top-3 sm:right-12 sm:text-2xl"
					>
						🗑️
					</button>
				{/if}

				<button
					onclick={closeModal}
					class="absolute top-0 right-3 z-23 cursor-pointer text-4xl text-fuchsia-400 transition duration-300 hover:scale-110 hover:text-fuchsia-500 sm:text-5xl"
					>×</button
				>
				<button
					onclick={prevPhoto}
					class="absolute left-4 z-23 cursor-pointer text-5xl text-fuchsia-400 transition duration-300 hover:scale-110 hover:text-fuchsia-500 sm:text-6xl"
					>‹</button
				>

				{#each photos as photo, index (photo.id)}
					{#if index === currentIndex}
						<img
							transition:fade={{ duration: 200 }}
							src={photo.url}
							alt={photo.name}
							class="absolute z-22 h-full w-full cursor-pointer rounded-lg bg-black object-contain shadow-xl"
						/>
					{/if}
				{/each}

				<button
					onclick={nextPhoto}
					class="absolute right-4 z-23 cursor-pointer text-5xl text-fuchsia-400 transition duration-300 hover:scale-110 hover:text-fuchsia-500 sm:text-7xl"
					>›</button
				>
			</div>
			<!-- 업로드 시간 -->
			<p class="text-md mt-2 sm:text-lg">{photos[currentIndex].timestamp}</p>
			<!-- 페이지네이션 -->
			{@render Pagination('large')}
		</div>
	</div>
{/if}
