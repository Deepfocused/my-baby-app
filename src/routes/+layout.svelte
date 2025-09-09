<script lang="ts">
	import '../app.css';
	import type { LayoutProps } from './$types';
	import { fade } from 'svelte/transition';
	import toast, { Toaster } from 'svelte-5-french-toast';
	import { invalidate } from '$app/navigation';
	import { onMount, tick } from 'svelte';

	let { data, children }: LayoutProps = $props();
	let isAdmin = $state<string>(data.isAdmin);
	let showModal = $state<boolean>(false);

	let modalYesButton: HTMLButtonElement | undefined;
	let modalNoButton: HTMLButtonElement | undefined;

	const logout: () => Promise<void> = async () => {
		const res = await fetch('/api/admin-logout', { method: 'POST' });
		if (res.ok) {
			showModal = false;
			await invalidate('admin:decision');
			modalYesButton?.classList.add('scale-120');
			setTimeout(() => modalYesButton?.classList.remove('scale-120'), 210);
			// sveltekit의 goto 는 기본적으로 SPA 내비게이션 -> 이 상황에서는 사용 x
			window.location.replace('/');
		} else {
			const data = await res.json();
			toast(`${data.message}`, { icon: '❌', duration: 2100 });
		}
	};

	const confirmLogout = () => {
		showModal = true;
	};

	const cancelLogout = () => {
		modalNoButton?.classList.add('scale-120');
		setTimeout(() => modalNoButton?.classList.remove('scale-120'), 210);
		showModal = false;
	};

	onMount(() => {
		const handleKeydown: (event: KeyboardEvent) => void = (event: KeyboardEvent) => {
			if (!showModal) return;

			if (event.key === 'Enter') {
				logout();
			} else if (event.key === 'Escape') {
				cancelLogout();
			}
		};
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	$effect(() => {
		if (showModal) {
			(async () => {
				await tick();
				modalYesButton?.focus();
			})();
		}
	});
</script>

<svelte:head>
	<meta property="og:title" content={data.og.title} />
	<meta property="og:description" content={data.og.description} />
	<meta property="og:image" content={data.og.image} />
	<meta property="og:url" content={data.og.url} />
	<meta property="og:type" content="website" />
</svelte:head>

<div class="text-sm max-[375px]:text-xs">
	<Toaster position="top-center" />
</div>
<main class="min-h-screen bg-sky-200 select-none">
	{#if isAdmin}
		<div class="fixed right-4 bottom-4 z-99 flex">
			<button
				onclick={confirmLogout}
				class="cursor-pointer rounded-lg bg-black px-3 py-2 text-base leading-none font-black text-white transition duration-300 hover:scale-105"
			>
				관리자 모드
			</button>
		</div>
	{/if}

	{@render children()}

	{#if showModal}
		<div
			transition:fade={{ duration: 500 }}
			class="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-xs"
		>
			<div
				class="flex flex-col items-center justify-center rounded-lg bg-white/80 p-6 text-center shadow-xl max-[375px]:p-4"
			>
				<div class="mb-4 flex items-center justify-center">
					<span class="text-2xl leading-none max-[375px]:text-xl">🔓</span>
					<span class="mx-2 text-2xl leading-none font-bold text-gray-800 max-[375px]:text-xl"
						>관리자 모드 나가기</span
					>
					<span class="text-2xl leading-none max-[375px]:text-xl">🔓</span>
				</div>
				<div class="flex items-center justify-center space-x-4">
					<button
						bind:this={modalYesButton}
						onclick={logout}
						class="cursor-pointer rounded-lg bg-rose-500 px-6 py-3 text-lg font-bold text-white transition duration-300 hover:shadow-xl hover:shadow-rose-300 focus:scale-105 active:scale-120 max-[375px]:text-sm"
					>
						네
					</button>
					<button
						bind:this={modalNoButton}
						onclick={cancelLogout}
						class="cursor-pointer rounded-lg bg-black px-6 py-3 text-lg font-bold text-white transition duration-300 hover:shadow-xl hover:shadow-gray-500 focus:scale-105 active:scale-120 max-[375px]:text-sm"
					>
						아니오
					</button>
				</div>
			</div>
		</div>
	{/if}
</main>
