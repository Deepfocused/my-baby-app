<script lang="ts">
	import type { Photo, PhotoComent } from '../types/types';
	import toast, { Toaster } from 'svelte-5-french-toast';
	import { onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';

	let { isAdmin, photoLoading }: { isAdmin: string; photoLoading: boolean } = $props();
	let photos = $state<Photo[]>([]);
	let photoComments = $state<Record<string, string>>({});

	let fileInput: HTMLInputElement;
	let currentIndex = $state<number>(0);
	let showModal = $state<boolean>(false);

	let photoDescription = $state<string>('');
	// 사진 개수 제한 상수
	const MAX_PHOTOS = 12;

	// 슬라이드 제스처 감지
	let touchStartX: number = 0;
	let touchEndX: number = 0;

	let modalDiv: HTMLDivElement | undefined;

	const preventScroll: (event: Event) => void = (event) => event.preventDefault();

	const loadPhotos: () => Promise<void> = async () => {
		try {
			const res = await fetch('/api/photos');
			const download = await res.json();

			if (download?.error) {
				toast(`${download.error}`, { icon: '❌', duration: 2100 });
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
			toast('최신 이미지 불러오기 성공!', { icon: '✅', duration: 2100 });
		} catch (err) {
			if (err instanceof Error) {
				toast(`${err.message}`, { icon: '😥', duration: 2100 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 2100 });
			}
		}
	};

	const getPhotoMessage = (index: number = currentIndex) => {
		const photo = photos[index];
		if (!photo) return '';
		return photoComments[photo.id];
	};

	const loadPhotoComments: () => Promise<void> = async () => {
		try {
			const res = await fetch('/api/photos/comments');
			if (!res.ok) {
				toast(`이미지 설명 불러오기 실패`, { icon: '❌', duration: 2100 });
				return;
			}
			const commentsArray: PhotoComent[] = await res.json();

			// 배열 → 객체 변환
			photoComments = commentsArray.reduce(
				(acc, curr) => {
					acc[curr.photoid] = curr.description;
					return acc;
				},
				{} as Record<string, string>
			);
			photoDescription = getPhotoMessage(currentIndex);
		} catch (err) {
			if (err instanceof Error) {
				toast(`${err.message}`, { icon: '😥', duration: 2100 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 2100 });
			}
		}
	};

	// HEIC / HEIF → JPEG 변환 함수
	const convertToJpeg: (file: File) => Promise<File> = async (file) => {
		// 브라우저에서만 실행해야 함
		if (typeof window === 'undefined') {
			return file;
		}
		// 동적 import로 브라우저에서만 불러오기
		const heic2any = (await import('heic2any')).default;
		// File → ArrayBuffer
		const arrayBuffer = await file.arrayBuffer();

		// heic2any 변환 실행
		const blob = (await heic2any({
			blob: new Blob([arrayBuffer]), // 변환할 Blob
			toType: 'image/jpeg', // JPEG로 변환
			quality: 0.8 // 품질 80%
		})) as Blob;

		// 새 File 객체 생성
		return new File([blob], file.name, { type: 'image/jpeg' });
	};

	const resizeImageHalf: (file: File) => Promise<Blob> = (file) => {
		return new Promise((resolve) => {
			const img = new Image();
			img.src = URL.createObjectURL(file);

			img.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = Math.floor(img.width / 2);
				canvas.height = Math.floor(img.height / 2);

				const ctx = canvas.getContext('2d');
				ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
				canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
			};

			img.onerror = () => toast('이미지 로드 실패!', { icon: '❌', duration: 2100 });
		});
	};

	const handleFileUpload: (event: Event) => Promise<void> = async (event) => {
		if (photos.length >= MAX_PHOTOS) {
			toast(`이미 ${MAX_PHOTOS}장 업로드 함!`, { icon: '⚠️', duration: 2100 });
			toast(`기존 이미지 삭제 후 업로드 해!`, { icon: '⚠️', duration: 2100 });
			return;
		}
		try {
			const target = event.target as HTMLInputElement;
			const files = Array.from(target.files || []);

			if (photos.length + files.length > MAX_PHOTOS) {
				toast(`${MAX_PHOTOS - photos.length}장만 업로드 가능!`, { icon: '⚠️', duration: 2100 });
			}
			// 업로드 가능한 개수만큼만 선택
			const filesToUpload = files.slice(0, MAX_PHOTOS - photos.length);
			for (let file of filesToUpload) {
				if (!file.type.startsWith('image/')) {
					toast(`지원하지 않는 이미지 형식: ${file.type}!`, { icon: '❌', duration: 2100 });
					continue;
				}

				// 📌 HEIC / HEIF → JPEG 변환 | 아이폰 대응
				if (
					file.type === 'image/heic' ||
					file.type === 'image/heif' ||
					file.name.toLowerCase().endsWith('.heic') ||
					file.name.toLowerCase().endsWith('.heif')
				) {
					file = await convertToJpeg(file);
					toast('HEIC/HEIF 이미지 JPEG로 변환 완료!', { icon: '🔄', duration: 2100 });
				}

				// vercel hobby plan(무료) 배포시 request body size는 4.5MB로 제한됨 - https://vercel.com/docs/functions/limitations
				const resizedBlob = await resizeImageHalf(file); // 이미지 줄이기

				// 안전한 파일명 생성( 특수문자, 한글, Emoji -> _ 로 변환)
				const originalName = file.name.replace(/\.[^/.]+$/, '');
				const extension = file.name.match(/\.[^/.]+$/)?.[0] ?? '.jpg';
				const timestamp = Date.now();
				const safeFileName = timestamp + '_' + originalName.replace(/[^\w]/g, '_') + extension;
				file = new File([resizedBlob], safeFileName.toLowerCase(), { type: file.type });

				// 서버에 업로드
				const formData = new FormData();
				formData.append('file', file);

				const res = await fetch('/api/photos', { method: 'POST', body: formData });
				const upload = await res.json();
				if (upload?.error) {
					toast(`${upload.error}`, { icon: '❌', duration: 2100 });
					return;
				}

				// 서버에서 반환한 URL 사용
				const newPhoto: Photo = {
					id: upload.id,
					url: upload.url, // 서버에서 받은 publicUrl
					name: upload.name,
					timestamp: upload.timestamp
				};

				// 최신 이미지 맨 뒤에 추가
				photos = [...photos, newPhoto];
				await tick(); // DOM 업데이트 대기
				currentIndex = photos.length - 1;
				toast('이미지 업로드 완료!', { icon: '✅', duration: 2100 });
				// 이미지 설명 서버에 업로드
				await initPhotoComment();
			}
			/*
			한 번 선택된 파일은 같은 파일 다시 선택해도 onchange 이벤트가 안 일어날 수 있어서...
			파일 input 초기화 필요
			*/
			target.value = '';
		} catch (err) {
			if (err instanceof Error) {
				toast(`${err.message}`, { icon: '😥', duration: 2100 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 2100 });
			}
		}
	};

	const removePhotoComment: () => Promise<void> = async () => {
		const targetPhoto = photos[currentIndex];
		if (!targetPhoto) return;
		const photoid = targetPhoto.id;

		// 1. 이미지 설명 UI 상에서 먼저 제거하기
		photoComments = Object.fromEntries(
			Object.entries(photoComments).filter(([key]) => key !== photoid)
		);

		// 2. 서버에서 삭제
		try {
			const res = await fetch('/api/photos/comments', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ photoid: photoid })
			});
			const remove = await res.json();
			if (remove?.error) {
				toast(`${remove.error}`, { icon: '❌', duration: 2100 });
				return;
			}
		} catch (err) {
			if (err instanceof Error) {
				toast(`${err.message}`, { icon: '😥', duration: 2100 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 2100 });
			}
		}
	};

	const removePhoto: () => Promise<void> = async () => {
		const targetPhoto = photos[currentIndex];
		if (!targetPhoto) return;

		// 3. UI 상에서 먼저 사진 제거하기
		photos = photos.filter((photo: Photo) => photo.id !== targetPhoto.id);
		await tick(); // DOM 반영 대기

		if (photos.length === 0) {
			showModal = false; // 사진이 하나도 없으면 모달 닫기
		} else if (currentIndex >= photos.length) {
			// 이미지 삭제시 currentIndex 값은 최소 0 으로 유지
			currentIndex = Math.max(0, photos.length - 1);
		}

		// 4. photoDescription 갱신
		photoDescription = getPhotoMessage(currentIndex);

		// 5. api 서버에서 사진 삭제하기
		try {
			const res = await fetch('/api/photos', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: targetPhoto.name })
			});
			const remove = await res.json();
			if (remove?.error) {
				toast(`${remove.error}`, { icon: '❌', duration: 2100 });
				return;
			}
		} catch (err) {
			if (err instanceof Error) {
				toast(`${err.message}`, { icon: '😥', duration: 2100 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 2100 });
			}
		}
	};

	const triggerFileInput: () => void = () => {
		fileInput?.click();
	};

	const nextPhoto: () => Promise<void> = async () => {
		if (photos.length > 0) {
			currentIndex = (currentIndex + 1) % photos.length;
			await tick();
			photoDescription = getPhotoMessage(currentIndex);
		}
	};

	const prevPhoto: () => Promise<void> = async () => {
		if (photos.length > 0) {
			currentIndex = (currentIndex - 1 + photos.length) % photos.length;
			await tick();
			photoDescription = getPhotoMessage(currentIndex);
		}
	};

	const openModal: () => void = () => {
		showModal = true;
	};

	const closeModal: () => void = () => {
		showModal = false;
	};

	const closeModalUsingKeyboard: (event: KeyboardEvent) => void = (event) => {
		if (event.key === 'Escape') {
			event.stopPropagation(); // 전역 핸들러로 안 올라가도록 막기
			showModal = false;
		}
	};

	// 드래그 감지
	const handleTouchStart: (event: TouchEvent) => void = (event) => {
		touchStartX = event.touches[0].clientX;
	};

	const handleTouchEnd: (event: TouchEvent) => Promise<void> = async (event) => {
		touchEndX = event.changedTouches[0].clientX;
		const diff = touchStartX - touchEndX;

		if (Math.abs(diff) > 21) {
			if (diff > 0) await nextPhoto();
			else await prevPhoto();
		}
	};

	const initPhotoComment: () => Promise<void> = async () => {
		const currentPhotoId = photos[currentIndex].id;

		try {
			const res = await fetch('/api/photos/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					photoid: currentPhotoId,
					description: photos[currentIndex].timestamp
				})
			});

			if (!res.ok) {
				return;
			}

			const { photoid, description } = await res.json();
			photoComments = { ...photoComments, [photoid]: description };
			photoDescription = description;
		} catch (err) {
			if (err instanceof Error) {
				toast(`${err.message}`, { icon: '😥', duration: 2100 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 2100 });
			}
		}
	};

	const editPhotoComment: () => Promise<void> = async () => {
		const currentPhotoId = photos[currentIndex].id;

		try {
			const res = await fetch('/api/photos/comments', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ photoid: currentPhotoId, description: photoDescription })
			});

			if (!res.ok) {
				toast('이미지 설명 업데이트 실패', { icon: '❌', duration: 2100 });
				return;
			}

			// 저장 성공하면 상태 업데이트
			const { photoid, description } = await res.json();
			photoComments = { ...photoComments, [photoid]: description };
			toast('이미지 설명 업데이트 성공!', { icon: '✅', duration: 2100 });
			photoDescription = description;
		} catch (err) {
			if (err instanceof Error) {
				toast(`${err.message}`, { icon: '😥', duration: 2100 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 2100 });
			}
		}
	};

	const cancelPhotoComment: () => Promise<void> = async () => {
		photoDescription = getPhotoMessage(currentIndex);
		toast('다시 쓰기!', { icon: '⚠️', duration: 2100 });
	};

	onMount(() => {
		const handleKeydown: (event: KeyboardEvent) => Promise<void> = async (event) => {
			if (event.key === 'ArrowLeft') {
				await prevPhoto();
			} else if (event.key === 'ArrowRight') {
				await nextPhoto();
			}
		};
		window.addEventListener('keydown', handleKeydown);
		// 컴포넌트가 언마운트될 때 호출됨
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	$effect(() => {
		if (showModal) {
			(async () => {
				await tick();
				modalDiv?.focus();
			})();
			document.addEventListener('wheel', preventScroll, { passive: false });
			document.addEventListener('touchmove', preventScroll, { passive: false });
			document.addEventListener('keydown', preventScroll, { passive: false });
			document.body.style.overflow = 'hidden';
			document.body.style.cursor = 'not-allowed';
		} else {
			document.removeEventListener('wheel', preventScroll);
			document.removeEventListener('touchmove', preventScroll);
			document.removeEventListener('keydown', preventScroll);
			document.body.style.overflow = '';
			document.body.style.cursor = 'grab';
		}
	});

	$effect(() => {
		// 10분 마다 이미지 데이터 갱신하기
		if (photoLoading) {
			(async () => {
				// 순서 중요(이미지 로드 후 이미지 설명 로드)
				await loadPhotos();
				await loadPhotoComments();
			})();

			const interval = setInterval(
				async () => {
					try {
						// 순서 중요(이미지 로드 후 이미지 설명 로드)
						await loadPhotos();
						await loadPhotoComments();
					} catch {
						toast.error('이미지 새로고침 실패 😢');
					}
				},
				10 * 60 * 1000
			);

			return () => clearInterval(interval);
		}
	});
</script>

<!-- snippet 사용 -->
<!-- small or large 전용 리터럴 타입 -->
{#snippet pagination(size: 'small' | 'large' = 'small')}
	<div class="mt-4 flex flex-wrap justify-center gap-1.5">
		{#each photos as photo, index (photo.id)}
			<!-- 템플릿 리터럴 사용(백틱 ` 와 함께) -->
			<button
				transition:fade={{ duration: 500 }}
				class={`cursor-pointer leading-none font-bold transition ${
					size === 'small'
						? 'h-6 w-6 rounded-sm text-base max-[640px]:h-5 max-[640px]:w-5 max-[640px]:text-[13px] max-[480px]:h-[16px] max-[480px]:w-[16px] max-[480px]:text-[11px] max-[350px]:h-[14px] max-[350px]:w-[14px] max-[350px]:text-[10px]'
						: 'h-8 w-8 rounded-lg text-lg max-[640px]:h-7 max-[640px]:w-7 max-[640px]:text-base max-[480px]:h-5 max-[480px]:w-5 max-[480px]:text-xs max-[350px]:h-4 max-[350px]:w-4 max-[350px]:text-[11px]'
				} ${
					index === currentIndex
						? 'bg-fuchsia-600 text-yellow-300'
						: 'bg-fuchsia-300 text-yellow-100 opacity-80 hover:bg-fuchsia-500 hover:text-gray-800'
				}`}
				onclick={async (event: MouseEvent) => {
					if (size === 'large') event.stopPropagation();
					currentIndex = index;
					await tick();
					photoDescription = getPhotoMessage(currentIndex);
				}}
			>
				{index + 1}
			</button>
		{/each}
	</div>
{/snippet}

<div class="text-sm max-[375px]:text-xs">
	<Toaster position="top-center" />
</div>
<!-- 업로드 UI -->
<div
	class="mb-6 flex flex-col rounded-lg border-3 border-dashed border-fuchsia-200 bg-white/80 p-6 shadow-xl shadow-fuchsia-50 backdrop-blur-xs transition duration-1000 hover:shadow-fuchsia-200"
>
	<div class="mb-4 inline-flex items-center justify-center">
		<span class="text-3xl leading-none max-[375px]:text-2xl">📸</span>
		<span
			class="mx-1 mt-3 text-3xl leading-none font-bold text-purple-400 max-[375px]:mt-2 max-[375px]:text-2xl"
			>소중한 순간</span
		>
		<span class="text-3xl leading-none max-[375px]:text-2xl">📸</span>
	</div>

	<div class="mb-4 flex justify-center">
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
			hidden={!isAdmin}
			class="mt-2 mb-2 inline-flex cursor-pointer items-center justify-center
			gap-2 rounded-lg
			border border-dashed border-fuchsia-200
			bg-gradient-to-r from-pink-400 to-blue-400
			px-4 py-2 text-white transition
			duration-300 hover:scale-110 hover:shadow-xl hover:shadow-fuchsia-200 disabled:cursor-not-allowed
			disabled:opacity-50 disabled:hover:scale-100"
		>
			<span class="text-3xl leading-none max-[375px]:text-2xl">📱</span>
			<span class="text-lg leading-none font-bold max-[375px]:text-base">사진 업로드</span>
			<span class="text-3xl leading-none max-[375px]:text-2xl">📱</span>
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
				<!-- 삭제 버튼 -->
				<!-- 순서 중요(이미지 설명 삭제 후 이미지 삭제 -->
				<button
					onclick={async () => {
						await removePhotoComment();
						await removePhoto();
					}}
					hidden={!isAdmin}
					class="absolute top-2 right-0 z-14 cursor-pointer rounded-lg px-2 py-1 text-xl leading-none transition duration-300 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 max-[640px]:text-lg max-[480px]:text-base"
				>
					🗑️
				</button>

				<!-- 왼쪽 화살표 -->
				<button
					onclick={prevPhoto}
					class="absolute left-0 z-14 cursor-pointer p-2 text-5xl leading-none text-fuchsia-400 transition duration-300 hover:scale-110 hover:text-fuchsia-500 max-[640px]:text-4xl max-[480px]:text-3xl"
					>‹</button
				>

				<!-- vercel 배포시 이미지 최적화 반영하려면? https://svelte.dev/docs/kit/adapter-vercel -->
				<button class="h-100 w-full" onclick={openModal}>
					{#each photos as photo, index (photo.id)}
						{#if index === currentIndex}
							<img
								transition:fade={{ duration: 500 }}
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
					class="absolute right-0 z-14 cursor-pointer p-2 text-5xl leading-none text-fuchsia-400 transition duration-300 hover:scale-110 hover:text-fuchsia-500 max-[640px]:text-4xl max-[480px]:text-3xl"
					>›</button
				>
			</div>

			<!-- 업로드 시간 -->
			{#if isAdmin}
				<div class="flex w-full items-center justify-center space-x-2">
					<input
						bind:value={photoDescription}
						onkeydown={(event: KeyboardEvent) => {
							event.stopPropagation(); // pagination 과의 간섭을 막기 위함
						}}
						maxlength="19"
						placeholder="포토 메시지를 입력하세요!"
						class="mt-3 w-1/2 cursor-pointer rounded-sm border border-purple-200 bg-purple-100/70 p-0.5 font-serif text-[13px] leading-none font-semibold text-black transition duration-300 hover:shadow-lg hover:shadow-purple-300 focus:scale-105 focus:ring-2 focus:ring-purple-300 max-[640px]:text-xs max-[480px]:text-[10px]"
					/>
					<div class="mt-3 flex items-center justify-center space-x-2">
						<button
							class="cursor-pointer rounded-sm bg-orange-500 p-1 text-[13px] leading-none font-semibold text-white transition duration-300 hover:bg-orange-300 hover:shadow-xl hover:shadow-orange-200 active:scale-120 max-[640px]:text-xs max-[480px]:text-[10px]"
							onclick={editPhotoComment}
						>
							저장
						</button>
						<button
							class="cursor-pointer rounded-sm bg-gray-400 p-1 text-[13px] leading-none font-semibold text-gray-700 transition duration-300 hover:bg-gray-300 hover:shadow-xl hover:shadow-gray-200 active:scale-120 max-[640px]:text-xs max-[480px]:text-[10px]"
							onclick={cancelPhotoComment}
						>
							취소
						</button>
					</div>
				</div>
			{:else}
				<div class="relative h-[32px] w-4/5">
					{#key currentIndex}
						<!-- 메시지가 달라질 때마다 key를 바꿔 DOM 교체 -->
						<p
							transition:fade={{ duration: 500 }}
							class="absolute inset-0 mt-3 flex items-center justify-center rounded-lg bg-purple-100/70 p-1 text-center font-serif text-[13px] leading-none font-semibold text-black max-[640px]:text-xs max-[480px]:text-[10px]"
						>
							{getPhotoMessage(currentIndex)}
						</p>
					{/key}
				</div>
			{/if}
			<!-- 페이지네이션 -->
			{@render pagination('small')}
		</div>
	{:else}
		<div class="flex h-119.5 w-full items-center justify-center text-gray-500">
			<span class="mb-2 text-5xl leading-none max-[375px]:text-4xl">👶🏻</span>
		</div>
	{/if}
</div>

<!-- 이미지 모달 -->
{#if showModal}
	<div
		transition:fade={{ duration: 500 }}
		bind:this={modalDiv}
		class="fixed inset-0 z-21 flex items-center justify-center bg-black/50 backdrop-blur-xs"
		onclick={closeModal}
		onkeydown={closeModalUsingKeyboard}
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
		role="button"
		tabindex="0"
		aria-label="Close modal"
	>
		<!-- onkeydown={() => {}} : a11y_click_events_have_key_events warning을 막기 위함-->
		<div class="flex h-[92%] w-[92%] flex-col items-center">
			<div
				onclick={(event: MouseEvent) => {
					event.stopPropagation();
				}}
				onkeydown={() => {}}
				role="button"
				tabindex="0"
				class="relative z-22 flex h-full w-full items-center justify-center"
			>
				<!-- 삭제 버튼 -->
				<!-- 순서 중요(이미지 삭제 후 이미지 설명 삭제 -->
				<button
					onclick={async () => {
						await removePhotoComment();
						await removePhoto();
					}}
					hidden={!isAdmin}
					class="absolute top-4 right-12 z-23 cursor-pointer rounded-lg text-2xl leading-none transition duration-300 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 max-[640px]:top-3 max-[640px]:right-10 max-[640px]:text-lg max-[480px]:top-2 max-[480px]:right-9 max-[480px]:text-base"
				>
					🗑️
				</button>

				<button
					onclick={closeModal}
					class="absolute top-0 right-3 z-23 cursor-pointer text-5xl leading-none text-fuchsia-400 transition duration-300 hover:scale-110 hover:text-fuchsia-500 max-[640px]:text-4xl max-[480px]:text-3xl"
					>×</button
				>
				<button
					onclick={prevPhoto}
					class="absolute left-4 z-23 cursor-pointer text-6xl leading-none text-fuchsia-400 transition duration-300 hover:scale-110 hover:text-fuchsia-500 max-[640px]:text-5xl max-[480px]:text-4xl"
					>‹</button
				>

				{#each photos as photo, index (photo.id)}
					{#if index === currentIndex}
						<img
							transition:fade={{ duration: 500 }}
							src={photo.url}
							alt={photo.name}
							class="absolute z-22 h-full w-full cursor-pointer rounded-lg bg-black object-contain shadow-xl"
						/>
					{/if}
				{/each}

				<button
					onclick={nextPhoto}
					class="absolute right-4 z-23 cursor-pointer text-6xl leading-none text-fuchsia-400 transition duration-300 hover:scale-110 hover:text-fuchsia-500 max-[640px]:text-5xl max-[480px]:text-4xl"
					>›</button
				>
			</div>
			<!-- 업로드 시간 -->
			<div
				onclick={(event: MouseEvent) => {
					event.stopPropagation();
				}}
				onkeydown={() => {}}
				role="button"
				tabindex="0"
				class="relative h-[48px] w-1/3 max-[1024px]:w-1/2 max-[640px]:w-5/7"
			>
				{#key currentIndex}
					<!-- 메시지가 달라질 때마다 key를 바꿔 DOM 교체 -->
					<p
						transition:fade={{ duration: 500 }}
						class="absolute inset-0 mt-4 flex items-center justify-center rounded-lg bg-purple-100/70 p-1 font-serif text-base leading-none font-semibold text-black max-[640px]:text-sm max-[480px]:text-xs"
					>
						{getPhotoMessage(currentIndex)}
					</p>
				{/key}
			</div>
			<!-- 페이지네이션 -->
			{@render pagination('large')}
		</div>
	</div>
{/if}
