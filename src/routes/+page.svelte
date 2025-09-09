<script lang="ts">
	import { onMount, tick } from 'svelte';
	import toast, { Toaster } from 'svelte-5-french-toast';
	import FallingLeaves from '../components/FallingLeaves.svelte';
	import PhotoUpload from '../components/PhotoUpload.svelte';
	import CommentSection from '../components/CommentSection.svelte';
	import MusicPlayer from '../components/MusicPlayer.svelte';
	import type { PageProps } from './$types';
	import type { MusicItem } from '../types/types';
	import { scale } from 'svelte/transition';
	import soondol from '$lib/assets/soondol.jpg';

	let { data }: PageProps = $props();
	const isAdmin = $state<string>(data.isAdmin);
	const musicList: MusicItem[] = data.musicList;

	let showModal = $state<boolean>(true);
	let isPlaying = $state<boolean>(false);
	let photoLoading = $state<boolean>(false);
	let commentLoading = $state<boolean>(false);

	// let birthdayMessage = $state<string>('2025년 x월 x일 오후 x시 x분에 탄생!');
	// let updateMessage = $state<string>('');

	let modalBackButton: HTMLButtonElement | undefined;
	let modalEntryButton: HTMLButtonElement | undefined;

	const preventScroll: (event: Event) => void = (event) => event.preventDefault();

	const closeModal: () => void = () => {
		showModal = false;
		isPlaying = true;
		photoLoading = true;
		commentLoading = true;
		// modalEntryButton?.classList.add('scale-120');
		// setTimeout(() => modalEntryButton?.classList.remove('scale-120'), 210);
	};

	const handleGoBack: () => void = () => {
		modalBackButton?.classList.add('scale-120');
		setTimeout(() => modalBackButton?.classList.remove('scale-120'), 210);

		if (window.history.length <= 1) {
			toast('순돌이(👶🏻)두고 다른 곳 가시려구😭?', {
				duration: 2100
			});
		} else {
			window.history.back();
		}
	};

	onMount(() => {
		const handleKeydown: (event: KeyboardEvent) => void = (event) => {
			if (showModal && event.key === 'Enter') {
				closeModal();
			}
			if (showModal && event.key === 'Escape') {
				handleGoBack();
			}
		};
		window.addEventListener('keydown', handleKeydown);

		// bfcache 관련 이슈였다.[2025-08-29 에 찾음]
		/*
		pageshow
			pageshow 이벤트는 다음 2가지 경우에 발생
			페이지가 처음 로드될 때
			페이지가 bfcache로부터 복원될 때
			pageshow 이벤트의 persisted 속성은 bfcache로부터 복원된 경우 true를 리턴
		*/
		window.addEventListener('pageshow', (event) => {
			if (event.persisted) {
				window.location.replace('/');
			}
		});

		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	$effect(() => {
		if (showModal) {
			(async () => {
				await tick();
				modalEntryButton?.focus();
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
</script>

<div class="text-sm max-[375px]:text-xs">
	<Toaster position="top-center" />
</div>
{#if showModal}
	<div
		transition:scale={{ duration: 2100, start: 7 }}
		class="fixed inset-0 z-99 flex items-center justify-center bg-black/50 backdrop-blur-xs"
	>
		<div
			class="flex max-w-sm flex-col items-center justify-center rounded-lg bg-white/80 p-6 text-center max-[375px]:max-w-xs max-[375px]:p-4"
		>
			<div class="mb-4 inline-flex items-center justify-center">
				<span class="text-3xl text-pink-400 max-[375px]:text-xl">👶🏻</span>
				<span class="mx-1 text-3xl font-bold text-pink-400 max-[375px]:text-xl">순돌이 세계로</span>
				<span class="text-3xl text-pink-400 max-[375px]:text-xl">🌎</span>
			</div>
			<div class="flex space-x-4">
				<button
					bind:this={modalEntryButton}
					class="cursor-pointer rounded-lg bg-rose-500 px-6 py-3 text-lg font-bold text-white transition duration-300 hover:shadow-xl hover:shadow-rose-300 focus:scale-105 max-[375px]:text-sm"
					onclick={closeModal}
				>
					입장하기
				</button>

				<button
					bind:this={modalBackButton}
					class="cursor-pointer rounded-lg bg-emerald-500 px-6 py-3 text-lg font-bold text-white transition duration-300 hover:shadow-xl hover:shadow-emerald-300 focus:scale-105 active:scale-120 max-[375px]:text-sm"
					onclick={handleGoBack}
				>
					뒤로가기
				</button>
			</div>
		</div>
	</div>
{/if}

{#if !showModal}
	<FallingLeaves />
{/if}
<section class="relative container mx-auto max-w-md px-4 py-8">
	<header>
		<div
			class="mb-6 flex flex-col items-center justify-center rounded-lg border-3 border-dashed border-rose-200 bg-white/80 px-6 pt-6 shadow-xl shadow-rose-50 backdrop-blur-xs transition duration-1000 hover:shadow-rose-200"
		>
			<img
				src={soondol}
				alt="순돌이네 가족"
				class="h-full w-full cursor-pointer rounded-lg object-contain shadow-xl"
			/>
			<p class="my-3 text-sm leading-none font-bold text-gray-700 max-[375px]:text-xs">
				🌸❤️ Drawn by 순돌이 엄마 ❤️🌸
			</p>
		</div>
	</header>

	<section>
		<MusicPlayer {isPlaying} {musicList} />
	</section>

	<section>
		<PhotoUpload {isAdmin} {photoLoading} />
	</section>
	<section>
		<CommentSection {isAdmin} {commentLoading} />
	</section>

	<footer
		class="mt-7 text-center text-sm font-semibold text-gray-700 transition duration-300 hover:scale-105 hover:font-bold hover:text-gray-800 max-[375px]:text-xs"
	>
		<a href="https://github.com/Deepfocused" target="_blank" class="leading-none"
			>🌸❤️ Made by 순돌이 아빠 ❤️🌸</a
		>
	</footer>
</section>
