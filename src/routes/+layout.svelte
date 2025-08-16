<script lang="ts">
	import '../app.css';
	import type { LayoutProps } from './$types';
	import { fade } from 'svelte/transition';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data, children }: LayoutProps = $props();
	let isAdmin = $state<boolean>(data.isAdmin);
	let showModal = $state<boolean>(false);

	// $state 안붙이면 dev시 경고가 뜨길래 붙임.
	let modalYesButton: HTMLButtonElement | undefined;
	let modalNoButton: HTMLButtonElement | undefined;
	// let modalYesButton = $state<HTMLButtonElement | undefined>(undefined);
	// let modalNoButton = $state<HTMLButtonElement | undefined>(undefined);

	const logout: () => Promise<void> = async () => {
		await fetch('/api/admin-logout', { method: 'POST' });
		showModal = false;
		await invalidate('admin:decision');
		modalYesButton?.classList.add('scale-130');
		setTimeout(() => modalYesButton?.classList.remove('scale-130'), 210);
		// sveltekit의 goto 는 기본적으로 SPA 내비게이션 -> 이 상황에서는 사용 x
		window.location.replace('/');
	};

	const confirmLogout = () => {
		showModal = true;
	};

	const cancelLogout = () => {
		modalNoButton?.classList.add('scale-130');
		setTimeout(() => modalNoButton?.classList.remove('scale-130'), 210);
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
			modalYesButton?.focus();
		}
	});
</script>

<main class="bg-gradient-to-br from-teal-200 via-rose-100 to-lime-200 select-none">
	{#if isAdmin}
		<div class="fixed top-4 right-4 z-99 flex">
			<button
				onclick={confirmLogout}
				class="text-md cursor-pointer rounded-full bg-gray-800 px-3 py-2 font-black text-white shadow-xl transition duration-300 hover:scale-110"
			>
				관리자 모드
			</button>
		</div>
	{/if}

	{@render children()}

	{#if showModal}
		<div
			transition:fade
			class="fixed inset-0 z-100 flex items-center justify-center bg-white/21 backdrop-blur-xs"
		>
			<div
				class="flex flex-col items-center justify-center rounded-lg bg-white/80 p-6 text-center shadow-xl max-[480px]:p-4"
			>
				<p class="mb-4 text-2xl font-bold text-gray-800 max-[480px]:text-xl">
					🔓 관리자 모드 나가기 🔓
				</p>
				<div class="flex items-center justify-center space-x-4">
					<button
						bind:this={modalYesButton}
						onclick={logout}
						class="cursor-pointer rounded-lg bg-rose-500 px-6 py-3 text-lg font-bold text-white transition duration-300 hover:shadow-xl hover:shadow-rose-300 focus:scale-105 active:scale-110 max-[480px]:text-sm"
					>
						네
					</button>
					<button
						bind:this={modalNoButton}
						onclick={cancelLogout}
						class="cursor-pointer rounded-lg bg-black px-6 py-3 text-lg font-bold text-white transition duration-300 hover:shadow-xl hover:shadow-gray-500 focus:scale-105 active:scale-110 max-[480px]:text-sm"
					>
						아니오
					</button>
				</div>
			</div>
		</div>
	{/if}
</main>
