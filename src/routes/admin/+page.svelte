<script lang="ts">
	import { onMount } from 'svelte';
	import toast, { Toaster } from 'svelte-5-french-toast';
	import { goto, invalidate } from '$app/navigation';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const isAdmin = data.isAdmin;

	let username = $state('');
	let password = $state('');
	let loginButton: HTMLButtonElement | undefined;
	let modalUserNameInput: HTMLInputElement | undefined;

	const login: () => Promise<void> = async () => {
		const res = await fetch('/api/admin-login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});

		if (res.ok) {
			await invalidate('admin:decision');
			// sveltekit의 goto 는 기본적으로 SPA 내비게이션 -> 이 상황에서는 사용 x
			window.location.replace('/');
		} else {
			const data = await res.json();
			toast.error(data.message, { duration: 1000 });
		}
	};

	const handleSubmit: (event: Event) => Promise<void> = async (event) => {
		event.preventDefault(); // 브라우저의 기본 새로고침 동작을 막기
		// Enter 눌렀을 때 버튼 scale 효과 주기
		loginButton?.classList.add('scale-130');
		setTimeout(() => loginButton?.classList.remove('scale-130'), 210);

		// 실제 로그인 함수 호출
		await login();
	};

	onMount(() => {
		modalUserNameInput?.focus();
		if (isAdmin) {
			goto('/');
		}
		return () => {};
	});
</script>

<div class="text-sm max-[480px]:text-xs">
	<Toaster position="top-center" />
</div>
<div class="flex min-h-screen items-center justify-center">
	<div
		class="max-w-sm rounded-lg border border-pink-100 bg-gradient-to-br from-gray-100 via-pink-50 to-blue-50 p-6 shadow-xl shadow-pink-50 hover:shadow-pink-200 max-[480px]:max-w-xs max-[480px]:p-4"
	>
		<div class="mb-3 flex items-center justify-center space-x-2">
			<span class="text-3xl max-[480px]:text-xl">🔐</span>
			<p class="text-2xl font-bold text-gray-800 max-[480px]:text-xl">관리자 로그인</p>
			<span class="text-3xl max-[480px]:text-xl">🔐</span>
		</div>

		<form onsubmit={handleSubmit}>
			<div class="flex flex-col items-center justify-center">
				<input
					bind:this={modalUserNameInput}
					bind:value={username}
					placeholder="아이디"
					class="mb-2 w-full cursor-pointer rounded-lg border border-pink-200 bg-white py-3 transition-colors duration-300 hover:shadow-xl hover:shadow-pink-300 focus:scale-105 focus:border-pink-400 max-[480px]:text-sm"
				/>

				<!-- 비밀번호 입력 -->
				<input
					bind:value={password}
					type="password"
					placeholder="비밀번호"
					class="mb-3 w-full cursor-pointer rounded-lg border border-blue-200 bg-white py-3 transition-colors duration-300 hover:shadow-xl hover:shadow-blue-300 focus:scale-105 focus:border-blue-400 max-[480px]:text-sm"
				/>

				<!-- 로그인 버튼 -->
				<button
					bind:this={loginButton}
					type="submit"
					class="w-full cursor-pointer rounded-lg bg-gradient-to-r from-pink-400 to-blue-400 py-3 font-bold text-white shadow-xl transition duration-300 hover:shadow-xl hover:shadow-pink-300 focus:scale-105 active:scale-110 max-[480px]:text-sm"
				>
					💕 로그인 💕
				</button>
			</div>
		</form>
	</div>
</div>
