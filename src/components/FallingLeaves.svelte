<script lang="ts">
	import { onMount } from 'svelte';
	import type { Leaf } from '../types/types';
	import heart from '$lib/assets/heart.png';

	let leaves = $state<Leaf[]>([]);

	onMount(() => {
		const emojiLength = 7;
		const isMobile: boolean = window.innerWidth <= 640; // 모바일 기준
		const count: number = isMobile ? emojiLength : emojiLength * 3;

		leaves = Array.from({ length: count }, (_, i) => {
			const marginRight = 16; // % 단위 여유 공간
			return {
				id: i,
				left: Math.random() * (100 - marginRight),
				animationDelay: Math.random() * emojiLength * 3.5,
				animationDuration: 7 + Math.random() * emojiLength,
				swayDuration: 2.1 + Math.random(),
				emoji: heart
			};
		});
	});
</script>

<div class="pointer-events-none fixed inset-0">
	{#each leaves as leaf (leaf.id)}
		<div
			class="animate-fall absolute"
			style="
        left: {leaf.left}%;
        animation-delay: {leaf.animationDelay}s;
        animation-duration: {leaf.animationDuration}s;
      "
		>
			<div
				class="animate-sway"
				style="
           animation-duration: {leaf.swayDuration}s;
           "
			>
				<img src={leaf.emoji} alt="떨어지는 하트" class="h-24 w-24" />
			</div>
		</div>
	{/each}
</div>

<style>
	@keyframes fall {
		0% {
			transform: translateY(-210px) rotate(0deg);
			opacity: 1;
		}
		25% {
			opacity: 1;
		}
		50% {
			opacity: 1;
		}
		75% {
			opacity: 1;
		}
		100% {
			transform: translateY(100vh) rotate(360deg);
			opacity: 1;
		}
	}

	@keyframes sway {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-3px);
		}
		50% {
			transform: translateX(3px);
		}
		75% {
			transform: translateX(-3px);
		}
	}

	.animate-fall {
		animation-name: fall;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
		transform: translateY(-210px);

		will-change: transform, opacity;
		contain: layout paint style;
	}

	.animate-sway {
		animation-name: sway;
		animation-iteration-count: infinite;
		animation-timing-function: ease-in-out;

		will-change: transform, opacity;
		contain: layout paint style;
	}
</style>
