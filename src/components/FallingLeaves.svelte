<script lang="ts">
	import { onMount } from 'svelte';
	import type { Leaf } from '../types/types';

	let leaves = $state<Leaf[]>([]);

	onMount(() => {
		const emojis: string[] = [
			'🤱🏻',
			'🧑🏻‍🍼',
			'👨🏻',
			'👩🏻',
			'👶🏻',
			'👨🏻‍🍼',
			'👨🏻‍👩🏻‍👦🏻',
			'🙋🏻',
			'🙋🏻‍♀️',
			'🤸🏻‍♂️',
			'🫶🏻',
			'🎖️',
			'🏅',
			'💵',
			'💴',
			'💸',
			'💰',
			'📈',
			'🌸',
			'❤️',
			'🗽',
			'💷',
			'💶',
			'💰',
			'🎥',
			'📽️',
			'🎹',
			'🎸',
			'♥️',
			'🎁',
			'🎗️',
			'🎉'
		];
		const isMobile: boolean = window.innerWidth <= 640; // 모바일 기준
		const count: number = isMobile ? 121 : 210;

		leaves = Array.from({ length: count }, (_, i) => ({
			id: i,
			left: Math.random() * 100,
			animationDelay: Math.random() * 10,
			animationDuration: 10 + Math.random() * 10,
			swayDuration: 0.5 + Math.random() * 1,
			emoji: emojis[Math.floor(Math.random() * emojis.length)]
		}));
		return () => {};
	});
</script>

<div class="pointer-events-none fixed inset-0">
	{#each leaves as leaf (leaf.id)}
		<div
			class="animate-fall absolute scale-150 text-3xl opacity-50"
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
				{leaf.emoji}
			</div>
		</div>
	{/each}
</div>

<style>
	@keyframes fall {
		0% {
			transform: translateY(-210px) rotate(0deg);
			opacity: 0.25;
		}
		25% {
			opacity: 0.5;
		}
		50% {
			opacity: 0.75;
		}
		75% {
			opacity: 1;
		}
		100% {
			transform: translateY(120vh) rotate(360deg);
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
		animation-timing-function: ease-in-out;
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
