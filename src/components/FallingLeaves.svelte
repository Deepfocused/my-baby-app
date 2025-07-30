<script lang="ts">
	import { onMount } from 'svelte';
	import type { Leaf } from '../types/types';

	let leaves = $state<Leaf[]>([]);

	onMount(() => {
		const emojis = [
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
			'❤️'
		];

		leaves = Array.from({ length: 210 }, (_, i) => ({
			id: i,
			left: Math.random() * 100,
			animationDelay: Math.random() * 10,
			animationDuration: 10 + Math.random() * 10,
			swayDuration: 0.5 + Math.random() * 1,
			emoji: emojis[Math.floor(Math.random() * emojis.length)]
		}));
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
			transform: translate3d(0, -210px, 0) rotate3d(0, 0, 1, 0deg);
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
			transform: translate3d(0, 120vh, 0) rotate3d(0, 0, 1, 360deg);
			opacity: 1;
		}
	}

	@keyframes sway {
		0%,
		100% {
			transform: translate3d(0, 0, 0);
		}
		25% {
			transform: translate3d(-3px, 0, 0);
		}
		50% {
			transform: translate3d(3px, 0, 0);
		}
		75% {
			transform: translate3d(-3px, 0, 0);
		}
	}

	.animate-fall {
		animation-name: fall;
		animation-iteration-count: infinite;
		animation-timing-function: ease-in-out;
		transform: translate3d(0, -210px, 0);
	}

	.animate-sway {
		animation-name: sway;
		animation-iteration-count: infinite;
		animation-timing-function: ease-in-out;
	}
</style>
