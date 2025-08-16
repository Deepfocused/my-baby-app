<script lang="ts">
	import { onMount } from 'svelte';
	import toast, { Toaster } from 'svelte-5-french-toast';
	import FallingLeaves from '../components/FallingLeaves.svelte';
	import PhotoUpload from '../components/PhotoUpload.svelte';
	import CommentSection from '../components/CommentSection.svelte';
	import MusicPlayer from '../components/MusicPlayer.svelte';
	import type { PageProps } from './$types';
	import { scale } from 'svelte/transition';

	let { data }: PageProps = $props();
	const isAdmin = $state<boolean>(data.isAdmin);
	const musicList = data.musicList;

	let showModal = $state<boolean>(true);
	let isPlaying = $state<boolean>(false);

	let birthdayMessage = $state<string>('2025년 8월 30일 13시 50분에 태어나다!');
	let updateMessage = $state<string>('');

	// $state 안붙이면 dev시 경고가 뜨길래 붙임.
	let modalBackButton: HTMLButtonElement | undefined;
	let modalEntryButton: HTMLButtonElement | undefined;
	// let modalBackButton = $state<HTMLButtonElement | undefined>(undefined);
	// let modalEntryButton = $state<HTMLButtonElement | undefined>(undefined);

	const closeModal: () => void = () => {
		showModal = false;
		isPlaying = true;

		// modalEntryButton?.classList.add('scale-120');
		// setTimeout(() => modalEntryButton?.classList.remove('scale-120'), 210);
	};

	const handleGoBack: () => void = () => {
		modalBackButton?.classList.add('scale-120');
		setTimeout(() => modalBackButton?.classList.remove('scale-120'), 210);

		if (window.history.length <= 1) {
			toast('순돌이(👶🏻)두고 다른 곳 가시려구😭?', {
				duration: 1000
			});
		} else {
			window.history.back();
		}
	};

	const fetchBirthday: () => Promise<void> = async () => {
		try {
			const res = await fetch('/api/birthday');
			if (!res.ok) {
				toast(`생일 로딩 실패: ${res.status}`, { icon: '❌', duration: 1000 });
				return;
			}
			const birthday = await res.json();
			birthdayMessage = birthday.message;
			updateMessage = birthday.message;
		} catch (err) {
			if (err instanceof Error) {
				toast(`생일 로딩중 오류 발생: ${err.message}`, { icon: '😥', duration: 1000 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 1000 });
			}
		}
	};

	const saveBirthday: () => Promise<void> = async () => {
		const res = await fetch('/api/birthday', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ message: updateMessage })
		});
		if (res.ok) {
			const json = await res.json();
			birthdayMessage = json.message;
			toast('저장 성공!', { icon: '✅', duration: 1000 });
		} else {
			toast('업데이트 실패', { icon: '❌', duration: 1000 });
		}
	};

	onMount(() => {
		// 즉시 실행
		(async (): Promise<void> => {
			await fetchBirthday();
		})();

		const handleKeydown: (event: KeyboardEvent) => void = (event) => {
			if (showModal && event.key === 'Enter') {
				closeModal();
			}
			if (showModal && event.key === 'Escape') {
				handleGoBack();
			}
		};
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	$effect(() => {
		if (showModal) {
			modalEntryButton?.focus();
		}
	});
</script>

<div class="text-sm max-[480px]:text-xs">
	<Toaster position="top-center" />
</div>
{#if showModal}
	<div
		transition:scale={{ duration: 2000, start: 7 }}
		class="fixed inset-0 z-99 flex items-center justify-center bg-black/21 backdrop-blur-xs"
	>
		<div
			class="flex max-w-sm flex-col items-center justify-center rounded-lg bg-white/80 p-6 text-center max-[480px]:max-w-xs max-[480px]:p-4"
		>
			<p class="mb-4 text-3xl font-bold text-pink-400 max-[480px]:text-xl">👶🏻순돌이 세계로🌎</p>

			<div class="flex space-x-4">
				<button
					bind:this={modalEntryButton}
					class="cursor-pointer rounded-lg bg-rose-500 px-6 py-3 text-lg font-bold text-white transition duration-300 hover:shadow-xl hover:shadow-rose-300 focus:scale-105 max-[480px]:text-sm"
					onclick={closeModal}
				>
					입장하기
				</button>

				<button
					bind:this={modalBackButton}
					class="cursor-pointer rounded-lg bg-emerald-500 px-6 py-3 text-lg font-bold text-white transition duration-300 hover:shadow-xl hover:shadow-emerald-300 focus:scale-105 active:scale-120 max-[480px]:text-sm"
					onclick={handleGoBack}
				>
					뒤로가기
				</button>
			</div>
		</div>
	</div>
{/if}

<FallingLeaves />
<section class="relative container mx-auto max-w-md px-4 py-8">
	<header class="mb-8 text-center">
		<div
			class="rounded-lg border border-rose-200 bg-white/80 p-6 shadow-xl shadow-rose-50 backdrop-blur-xs transition duration-1000 hover:shadow-rose-200"
		>
			<p class="mb-2 text-2xl font-bold text-rose-400 sm:text-3xl">
				너무💘귀여운 <br /> 🦾순돌이🍼 탄생
			</p>
			<!-- <p class="font-bold text-orange-400">2025년 9월 20일에 태어나다!</p> -->
			<div class="flex flex-col items-center justify-center">
				{#if isAdmin}
					<input
						bind:value={updateMessage}
						class="text-md w-72 cursor-pointer rounded-lg border-dashed border-orange-300 bg-transparent p-1 text-center font-bold text-orange-400 transition duration-300 hover:bg-orange-100 hover:shadow-xl focus:ring-2 focus:ring-orange-300 active:scale-110 max-[480px]:w-64 max-[480px]:text-sm"
					/>
					<div class="mt-2 flex items-center justify-center space-x-3">
						<button
							class="cursor-pointer rounded-lg bg-orange-500 p-2 text-sm font-bold text-white transition duration-300 hover:bg-orange-300 hover:shadow-xl active:scale-110 max-[480px]:text-xs"
							onclick={saveBirthday}
						>
							저장
						</button>
						<button
							class="cursor-pointer rounded-lg bg-gray-400 p-2 text-sm font-bold text-gray-700 transition duration-300 hover:bg-gray-300 hover:shadow-xl active:scale-110 max-[480px]:text-xs"
							onclick={() => {
								updateMessage = birthdayMessage;
								toast('저장 취소!', { icon: '⚠️', duration: 1000 });
							}}
						>
							취소
						</button>
					</div>
				{:else}
					<span class="font-bold text-orange-400">{birthdayMessage}</span>
				{/if}
			</div>
			<div class="mt-1 flex justify-center space-x-2">
				<span class="text-3xl">👨🏻</span>
				<span class="text-2xl">👩🏻</span>
				<span class="text-xl">👶🏻</span>
			</div>
		</div>
	</header>

	<section>
		<MusicPlayer {isPlaying} {musicList} />
	</section>

	<section>
		<PhotoUpload {isAdmin} />
	</section>
	<section>
		<CommentSection />
	</section>

	<footer class="mt-6 text-center text-sm text-gray-700 max-[480px]:text-xs">
		<p>🌸❤️ Made by 순돌이 아빠 ❤️🌸</p>
	</footer>
</section>
