<script lang="ts">
	import { onMount, tick } from 'svelte';
	import toast, { Toaster } from 'svelte-5-french-toast';
	import {
		StepBack,
		Play,
		Pause,
		SkipForward,
		Volume2,
		VolumeOff,
		ChevronsUp,
		Shuffle,
		Repeat,
		Repeat1
	} from '@lucide/svelte';
	import type { MusicItem } from '../types/types';

	let firstPlay: boolean = true;
	let { isPlaying, musicList }: { isPlaying: boolean; musicList: MusicItem[] } = $props();
	let currentTrackIndex = $state<number>(0);
	let currentTrack = $derived(musicList[currentTrackIndex]);

	let audio: HTMLAudioElement;

	let currentTime = $state<number>(0); // for accessibility
	let duration = $state<number>(300);
	let isDragging: boolean = false;
	let isTouchDragging: boolean = false;
	let progressBar: HTMLDivElement;

	let volume = $state<number>(0.5);
	let tempVolume = 0.5; // 음소거 해제 시 원래 음량으로 복구하기 위한 임시 변수
	let isMuted = $state<boolean>(false); // 음소거 상태 변수
	let playbackRate = $state<number>(1.0);

	let repeatMode = $state<'all' | 'one' | 'none'>('all');
	let isShuffle = $state<boolean>(false);
	const keyboardSeekInterval: number = 5;

	// Fisher–Yates 알고리즘
	const shuffle: <T>(array: T[]) => T[] = (array) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	};

	const handleTimeUpdate: () => void = () => {
		if (isPlaying && !isDragging) {
			currentTime = audio.currentTime;
		}
	};

	const keyboardseek: (seconds: number) => void = (seconds) => {
		if (!audio) return;
		let newTime = currentTime + seconds;
		newTime = Math.max(0, Math.min(duration, newTime)); // 범위 제한
		audio.currentTime = newTime;
		currentTime = newTime;
	};

	const handleKeydown: (event: KeyboardEvent) => void = (event) => {
		if (event.key === 'ArrowRight') {
			keyboardseek(keyboardSeekInterval); // 5초 앞으로
		} else if (event.key === 'ArrowLeft') {
			keyboardseek(-keyboardSeekInterval); // 5초 뒤로
		}
	};

	const mouseSeek: (event: MouseEvent) => void = (event) => {
		if (!audio || !isDragging) return;

		const rect = progressBar.getBoundingClientRect();
		const newTime = ((event.clientX - rect.left) / rect.width) * duration;

		if (!isNaN(newTime) && isFinite(newTime)) {
			audio.currentTime = newTime;
			currentTime = newTime;
		}
	};

	const handleVolume: (event: Event) => void = (event) => {
		const target = event.target as HTMLInputElement;
		const newVolume = parseFloat(target.value);
		if (audio) {
			audio.volume = newVolume;
			if (newVolume > 0) {
				isMuted = false;
				audio.muted = false;
				tempVolume = newVolume; // 음량이 0보다 크면 임시 변수 업데이트
			} else {
				isMuted = true;
				audio.muted = true;
			}
		}
		volume = newVolume;
	};

	const handlePlaybackRate: (event: Event) => void = (event) => {
		const target = event.target as HTMLInputElement;
		const newRate = parseFloat(target.value);
		if (audio) {
			audio.playbackRate = newRate;
		}
		playbackRate = newRate;
	};

	const startDrag: (event: MouseEvent) => void = (event) => {
		isDragging = true;
		mouseSeek(event);
	};

	const stopDrag: () => void = () => {
		isDragging = false;
	};

	const formatTime: (seconds: number) => string = (seconds) => {
		const min = Math.floor(seconds / 60);
		const sec = Math.floor(seconds % 60);
		return `${min}:${sec.toString().padStart(2, '0')}`;
	};

	// 음소거 토글 함수 추가
	const toggleMute: () => void = () => {
		if (!audio) return;

		if (isMuted) {
			// 음소거 해제: 기존 볼륨으로 복구
			audio.muted = false;
			audio.volume = tempVolume;
			volume = tempVolume;
		} else {
			// 음소거: 현재 볼륨을 저장하고, 볼륨을 0으로 설정
			tempVolume = volume;
			audio.muted = true;
			audio.volume = 0;
			volume = 0;
		}
		isMuted = !isMuted;
	};

	const togglePlay: () => void = () => {
		if (!audio) return;
		if (isPlaying) {
			audio?.pause();
			isPlaying = false;
		} else {
			audio?.play().then(() => (isPlaying = true));
		}
	};

	const previousPlay: () => Promise<void> = async () => {
		if (!audio) return;
		currentTrackIndex = (currentTrackIndex - 1 + musicList.length) % musicList.length;
		currentTime = 0;
		/*
		tick() 함수는 Svelte가 다음 상태 업데이트를 적용할 때까지 기다려주는 비동기 함수
		-> 컴포넌트의 상태를 변경한 후 tick()을 호출하면, Svelte가 DOM을 실제로 업데이트하는 시점까지 기다림
		*/
		await tick(); // src 변경 반영 대기

		audio.onloadedmetadata = () => {
			duration = audio.duration || 0;
			audio.play().then(() => (isPlaying = true));
		};
	};

	const nextPlay: () => Promise<void> = async () => {
		if (!audio) return;
		currentTrackIndex = (currentTrackIndex + 1) % musicList.length;
		currentTime = 0;
		await tick(); // src 변경 반영 대기

		audio.onloadedmetadata = () => {
			duration = audio.duration || 0;
			audio.play().then(() => (isPlaying = true));
		};
	};

	const repeatPlay: () => void = () => {
		switch (repeatMode) {
			case 'all':
				repeatMode = 'one';
				toast('한 곡 반복 재생!', { icon: '🔂', duration: 1000 });
				break;
			case 'one':
				repeatMode = 'none';
				toast('모든 곡 반복 재생 안 함!', { icon: '❎', duration: 1000 });
				break;
			case 'none':
				repeatMode = 'all';
				toast('모든 곡 반복 재생!', { icon: '🔁', duration: 1000 });
				break;
		}
	};

	const shufflePlay: () => void = () => {
		isShuffle = !isShuffle;
		if (isShuffle) {
			// 현재 곡을 제외!
			const current = musicList[currentTrackIndex];
			const others = shuffle(musicList.filter((_, i) => i !== currentTrackIndex));

			// 현재 곡을 맨 앞으로 넣고 시작!
			musicList = [current, ...others];
			currentTrackIndex = 0;
			toast('다음 곡부터 무작위 재생!', { icon: '🪢', duration: 1000 });
		} else {
			toast('무작위 재생 취소!', { icon: '❎', duration: 1000 });
		}
	};

	const handleEnded: () => Promise<void> = async () => {
		if (repeatMode === 'none') {
			currentTime = 0;
			isPlaying = false;
			return;
		}

		if (repeatMode === 'one') {
			audio.play();
			return;
		}

		// repeatMode === 'all'
		// let nextIndex;
		// if (isShuffle && musicList.length > 1) {
		// 	// 1곡 일 때 무한루프 방지
		// 	do {
		// 		nextIndex = Math.floor(Math.random() * musicList.length);
		// 	} while (nextIndex === currentTrackIndex);
		// } else {
		// 	nextIndex = currentTrackIndex + 1;
		// }

		// if (nextIndex >= musicList.length) {
		// 	if (isShuffle) currentTrackIndex = Math.floor(Math.random() * musicList.length);
		// 	else currentTrackIndex = 0;
		// } else {
		// 	currentTrackIndex = nextIndex;
		// }

		let nextIndex = currentTrackIndex + 1;
		if (nextIndex >= musicList.length) {
			currentTrackIndex = 0;
		} else {
			currentTrackIndex = nextIndex;
		}

		await tick(); // src 변경 반영 대기
		audio.onloadedmetadata = () => {
			duration = audio.duration || 0;
			audio.play();
		};
	};

	// 드래그 감지
	const handleTouchStart: () => void = () => {
		isTouchDragging = true;
	};

	const handleTouchMove: (event: TouchEvent) => void = (event) => {
		if (!audio || !isTouchDragging) return;

		const rect = progressBar.getBoundingClientRect();
		const newTime = ((event.touches[0].clientX - rect.left) / rect.width) * duration;

		if (!isNaN(newTime) && isFinite(newTime)) {
			audio.currentTime = newTime;
			currentTime = newTime;
		}
	};

	onMount(() => {
		musicList = shuffle([...musicList]); // 원본을 복사해서 셔플
		return () => {};
	});

	$effect(() => {
		if (!audio) return;

		audio.onloadedmetadata = () => {
			duration = audio.duration || 0;
		};

		if (firstPlay && isPlaying) {
			tick().then(() => {
				audio
					.play()
					.then(() => toast('음악 Play 성공!', { icon: '✅', duration: 2100 }))
					.catch((err: Error) =>
						toast(`음악 Play 실패: ${err.message}`, { icon: '❌', duration: 2100 })
					);
			});
			firstPlay = false;
		}
	});
</script>

<div class="text-sm max-[375px]:text-xs">
	<Toaster position="top-center" />
</div>
<div
	class="mb-6 flex max-w-xl flex-col rounded-lg border-3 border-dashed border-orange-200 bg-white/80 p-6 shadow-xl shadow-orange-50 backdrop-blur-xs transition duration-1000 hover:shadow-orange-200"
>
	<audio
		bind:this={audio}
		src={currentTrack.src}
		ontimeupdate={handleTimeUpdate}
		onended={handleEnded}
		playsinline
	></audio>
	<div class="mr-1 flex items-center justify-between max-[420px]:justify-center">
		<div class="flex flex-row items-center justify-center max-[420px]:mr-2 max-[420px]:flex-col">
			<img
				src={currentTrack.thumbnail}
				alt="가수 사진"
				class="mr-2 h-16 w-16 rounded-lg max-[450px]:h-14 max-[450px]:w-14"
			/>
			<div>
				<p
					class="text-base leading-none font-bold text-orange-400 max-[450px]:text-xs max-[420px]:hidden"
				>
					{currentTrack.title}
				</p>
				<p
					class="mt-2 text-sm leading-none font-semibold text-gray-500/70 max-[450px]:text-[10px] max-[420px]:hidden"
				>
					{currentTrack.artist}
				</p>
			</div>
		</div>

		<div class="flex flex-col items-center justify-center">
			<div class="flex items-center justify-end space-x-2">
				<button onclick={toggleMute} class="text-gray-500">
					{#if isMuted}
						<VolumeOff class="h-[24px] w-[24px] max-[450px]:h-[20px] max-[450px]:w-[20px]" />
					{:else}
						<Volume2 class="h-[24px] w-[24px] max-[450px]:h-[20px] max-[450px]:w-[20px]" />
					{/if}
				</button>
				<input
					type="range"
					class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-red-300 max-[450px]:h-1"
					min="0"
					max="1"
					step="0.1"
					bind:value={volume}
					oninput={handleVolume}
				/>
				<span class="text-sm leading-none text-gray-600 max-[420px]:text-xs"
					>{volume.toFixed(1)}x</span
				>
			</div>

			<div class="mt-0.5 flex items-center justify-end space-x-2">
				<ChevronsUp
					class="h-[24px] w-[24px] max-[450px]:h-[20px] max-[450px]:w-[20px]"
					color="#6a7282"
				/>
				<input
					type="range"
					class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-red-300 max-[450px]:h-1"
					min="0.5"
					max="2.0"
					step="0.1"
					bind:value={playbackRate}
					oninput={handlePlaybackRate}
				/>
				<span class="text-sm leading-none text-gray-600 max-[420px]:text-xs"
					>{playbackRate.toFixed(1)}x</span
				>
			</div>
		</div>
	</div>

	<div
		bind:this={progressBar}
		class="mt-4 h-3 w-full cursor-pointer overflow-hidden rounded-lg bg-gray-200"
		onmousedown={startDrag}
		onmouseup={stopDrag}
		onmousemove={mouseSeek}
		onkeydown={handleKeydown}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		role="slider"
		aria-label="Audio play time"
		aria-valuemin="0"
		aria-valuemax={duration || 0}
		aria-valuenow={currentTime}
		tabindex="0"
	>
		<div
			class="h-full bg-gradient-to-r from-pink-300 to-blue-300 transition duration-300"
			style="width: {(currentTime / duration) * 100}%"
		></div>
	</div>
	<div class="flex justify-between">
		<div class="text-xs text-gray-600">{formatTime(currentTime)}</div>
		<div class="text-xs text-gray-600">-{formatTime(duration - currentTime)}</div>
	</div>

	<div class="mt-2 flex justify-between">
		<button onclick={repeatPlay} class="cursor-pointer transition duration-200 hover:scale-110">
			{#if repeatMode === 'one'}
				<Repeat1
					class="h-[28px] w-[28px] max-[375px]:h-[24px] max-[375px]:w-[24px]"
					color="#f91075"
					strokeWidth="3"
				/>
			{:else if repeatMode === 'none'}
				<Repeat
					class="h-[28px] w-[28px] max-[375px]:h-[24px] max-[375px]:w-[24px]"
					color="#000000"
					strokeWidth="3"
				/>
			{:else}
				<Repeat
					class="h-[28px] w-[28px] max-[375px]:h-[24px] max-[375px]:w-[24px]"
					color="#f91075"
					strokeWidth="3"
				/>
			{/if}
		</button>

		<button onclick={previousPlay} class="cursor-pointer transition duration-200 hover:scale-110">
			<StepBack
				class="h-[32px] w-[32px] max-[375px]:h-[28px] max-[375px]:w-[28px]"
				strokeWidth="3"
			/>
		</button>

		<button onclick={togglePlay} class="cursor-pointer transition duration-200 hover:scale-110">
			{#if isPlaying}
				<Pause
					class="h-[32px] w-[32px] max-[375px]:h-[28px] max-[375px]:w-[28px]"
					strokeWidth="3"
				/>
			{:else}
				<Play class="h-[32px] w-[32px] max-[375px]:h-[28px] max-[375px]:w-[28px]" strokeWidth="3" />
			{/if}
		</button>

		<button onclick={nextPlay} class="cursor-pointer transition duration-200 hover:scale-110">
			<SkipForward
				class="h-[32px] w-[32px] max-[375px]:h-[28px] max-[375px]:w-[28px]"
				strokeWidth="3"
			/>
		</button>

		<button onclick={shufflePlay} class="cursor-pointer transition duration-200 hover:scale-110">
			<Shuffle
				class="h-[28px] w-[28px] max-[375px]:h-[24px] max-[375px]:w-[24px]"
				color={isShuffle ? '#f91075' : '#aaa'}
				strokeWidth="3"
			/>
		</button>
	</div>
</div>
