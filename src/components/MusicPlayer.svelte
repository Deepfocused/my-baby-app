<script lang="ts">
	import { onMount } from 'svelte';
	import { Rewind, Play, Pause, Square, Volume2, VolumeOff, ChevronsUp } from '@lucide/svelte';

	/* 
	ToDO 목록
    1. 소리 크기 -> 마우스 스크롤로 조정 가능하게
	2. 재생 빠르게 -> 마우스 스크롤로 조정가능하게
	3. 플레이 바 -> 마우스 스크롤로 조정가능하게, 키보드로 조정 가능하게
	4. 댓글 enter key 로 가능하게 
	5. 서버로 이미지 업로드 하기 - 단 관리자일떄만 가능하게 -> 고민해야함
	6. 댓글 이름, 비밀번호, 내용 한번에 쳐서 서버에 업로드 --> 수정은 비밀번호만 치면 갱신가능하게
	*/

	let audio: HTMLAudioElement;
	let isPlaying = $state<boolean>(false);
	let isLoaded = false;
	let interacted = false;
	let currentTime = $state<number>(0);
	let duration = $state<number>(0);
	let isDragging = $state<boolean>(false);
	let progressBar: HTMLDivElement;

	let volume = $state<number>(0.5);
	let tempVolume = $state<number>(0.5); // 음소거 해제 시 원래 음량으로 복구하기 위한 임시 변수
	let isMuted = $state<boolean>(false); // 음소거 상태 변수
	let playbackRate = $state<number>(1.0);

	function tryAutoPlay() {
		if (audio && !isPlaying && isLoaded && !interacted) {
			audio
				.play()
				.then(() => {
					isPlaying = true;
					interacted = true;
					removeInteractionListeners();
				})
				.catch((err: Error) => {
					console.warn('재생 실패:', err.message);
				});
		}
	}

	function handleLoadedData() {
		isLoaded = true;
		duration = audio?.duration || 0;
		if (audio) {
			audio.volume = volume;
			audio.playbackRate = playbackRate;
		}
		tryAutoPlay();
	}

	function removeInteractionListeners() {
		document.removeEventListener('click', handleLoadedData);
		document.removeEventListener('scroll', handleLoadedData);
		document.removeEventListener('keydown', handleLoadedData);
	}

	function handleSeek(event: MouseEvent) {
		if (!audio || !isDragging) return;

		const rect = progressBar.getBoundingClientRect();
		const newTime = ((event.clientX - rect.left) / rect.width) * duration;

		if (!isNaN(newTime) && isFinite(newTime)) {
			audio.currentTime = newTime;
			currentTime = newTime;
		}
	}

	function handleVolume(event: Event) {
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
	}

	function handlePlaybackRate(event: Event) {
		const target = event.target as HTMLInputElement;
		const newRate = parseFloat(target.value);
		if (audio) {
			audio.playbackRate = newRate;
		}
		playbackRate = newRate;
	}

	function startDrag(event: MouseEvent) {
		isDragging = true;
		handleSeek(event);
	}

	function stopDrag() {
		isDragging = false;
	}

	onMount(() => {
		document.addEventListener('click', handleLoadedData);
		document.addEventListener('scroll', handleLoadedData);
		document.addEventListener('keydown', handleLoadedData);

		document.addEventListener('mousemove', handleSeek);
		document.addEventListener('mouseup', stopDrag);

		setInterval(() => {
			if (audio && isPlaying && !isDragging) {
				currentTime = audio.currentTime;
			}
		}, 500);

		return () => {
			document.removeEventListener('mousemove', handleSeek);
			document.removeEventListener('mouseup', stopDrag);
			removeInteractionListeners();
		};
	});

	function togglePlay(): void {
		if (!audio) return;
		if (isPlaying) {
			audio.pause();
			isPlaying = false;
		} else {
			audio.play().then(() => (isPlaying = true));
		}
	}

	function resetAudio() {
		if (audio) {
			audio.currentTime = 0;
			currentTime = 0;
			audio.play();
			isPlaying = true;
		}
	}

	function stopAudio() {
		if (audio) {
			audio.pause();
			audio.currentTime = 0;
			currentTime = 0;
			isPlaying = false;
		}
	}

	function formatTime(seconds: number): string {
		const min = Math.floor(seconds / 60);
		const sec = Math.floor(seconds % 60);
		return `${min}:${sec.toString().padStart(2, '0')}`;
	}

	// 음소거 토글 함수 추가
	function toggleMute() {
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
	}
</script>

<div
	class="mx-auto mb-6 max-w-xl rounded-3xl border border-green-200 bg-white/70 p-6 shadow-2xl backdrop-blur-md"
>
	<audio bind:this={audio} src="/촛불하나.mp3" onloadeddata={handleLoadedData} loop playsinline
	></audio>
	<div class="flex items-center justify-center sm:justify-between">
		<div class="flex flex-col items-center justify-center sm:flex-row">
			<img src="/촛불하나.jpg" alt="음악 아이콘" class="mr-4 h-16 w-16 rounded-md" />
			<div>
				<p class="mr-4 hidden text-lg font-bold text-gray-700 sm:mr-0 sm:block">촛불하나</p>
				<p class="hidden text-lg font-semibold text-gray-500/70 sm:block">god</p>
			</div>
		</div>

		<div class="flex flex-col items-center justify-center">
			<div class="flex items-center justify-end space-x-3">
				<button onclick={toggleMute} class="text-gray-500">
					{#if isMuted}
						<VolumeOff size="24" />
					{:else}
						<Volume2 size="24" />
					{/if}
				</button>
				<input
					type="range"
					class="h-2 w-3/5 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-red-300"
					min="0"
					max="1"
					step="0.1"
					bind:value={volume}
					oninput={handleVolume}
				/>
				<span class="text-sm text-gray-600">{volume.toFixed(1)}x</span>
			</div>

			<div class="flex items-center justify-end space-x-3">
				<ChevronsUp size="24" class="text-gray-500" />
				<input
					type="range"
					class="h-2 w-3/5 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-red-300"
					min="0.5"
					max="2.0"
					step="0.1"
					bind:value={playbackRate}
					oninput={handlePlaybackRate}
				/>
				<span class="text-sm text-gray-600">{playbackRate.toFixed(1)}x</span>
			</div>
		</div>
	</div>

	<div
		bind:this={progressBar}
		class="mt-4 h-3 w-full cursor-pointer overflow-hidden rounded-full bg-gray-200"
		onmousedown={startDrag}
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

	<div class="flex justify-center space-x-9">
		<button onclick={resetAudio} class="cursor-pointer transition duration-200 hover:scale-120">
			<Rewind size="32" strokeWidth="3" />
		</button>

		<button onclick={togglePlay} class="cursor-pointer transition duration-200 hover:scale-120">
			{#if isPlaying}
				<Pause size="32" strokeWidth="3" />
			{:else}
				<Play size="32" strokeWidth="3" />
			{/if}
		</button>

		<button onclick={stopAudio} class="cursor-pointer transition duration-200 hover:scale-120">
			<Square size="32" strokeWidth="3" />
		</button>
	</div>
</div>
