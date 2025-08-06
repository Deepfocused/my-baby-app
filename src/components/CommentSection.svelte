<script lang="ts">
	//
	import { onMount } from 'svelte';
	import type { Comment, LoginForm, Props } from '../types/types';

	let { isLoggedIn, currentUser, handleLogin, handleLogout }: Props = $props();

	let comments = $state<Comment[]>([]);
	let newComment = $state<string>('');
	let loginForm = $state<LoginForm>({ username: '', password: '' });

	onMount(() => {
		const savedComments = localStorage.getItem('celebrationComments');
		if (savedComments) {
			const parsedComments = JSON.parse(savedComments);
			comments = parsedComments.map((comment: any) => ({
				...comment,
				date: new Date(comment.date)
			}));
		}
		return () => {};
	});

	$effect(() => {
		if (!isLoggedIn) {
			newComment = ''; // 로그아웃 상태일 때 textarea 값 초기화
		}
	});

	function addComment(): void {
		if (!newComment.trim() || !isLoggedIn) return;

		const comment: Comment = {
			id: Date.now(),
			text: newComment.trim(),
			author: currentUser,
			timestamp: new Date().toLocaleString(),
			date: new Date()
		};

		comments = [comment, ...comments];
		localStorage.setItem('celebrationComments', JSON.stringify(comments));
		newComment = '';
	}

	function deleteComment(id: number): void {
		comments = comments.filter((c: Comment) => c.id !== id);
		localStorage.setItem('celebrationComments', JSON.stringify(comments));
	}

	function submitLogin(event: SubmitEvent): void {
		event.preventDefault();
		if (loginForm.username && loginForm.password) {
			handleLogin(loginForm.username);
			loginForm = { username: '', password: '' };
		}
	}

	function handleTextareaKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault(); // 줄바꿈 방지
			addComment();
		}
	}
</script>

<div class="rounded-3xl border border-purple-200 bg-white/70 p-6 shadow-lg backdrop-blur-xs">
	<div class="mb-6 text-center">
		<span class="text-3xl">💌</span>
		<span class="text-2xl font-bold text-purple-400">축하 메시지</span>
		<span class="text-3xl">💌</span>
	</div>

	{#if isLoggedIn}
		<!-- User Info & Comment Form -->
		<div class="mb-6">
			<!-- User Header -->
			<div
				class="flex-col rounded-2xl border border-pink-200 bg-gradient-to-r from-pink-50 to-blue-50 p-4"
			>
				<div class="mb-3 flex space-x-2">
					<span class="text-md">👋</span>
					<span class="text-md font-bold text-gray-700"
						>환영합니다. <strong> {currentUser} </strong>님!!!</span
					>
					<button
						onclick={handleLogout}
						class="text-md mr-2 ml-auto text-gray-500 underline transition-colors duration-300 hover:text-gray-700"
					>
						로그아웃
					</button>
				</div>

				<!-- Comment Input -->
				<textarea
					bind:value={newComment}
					placeholder="이제 막 세상의 빛을 만난 저에게, 따뜻한 인사와 축복의 한마디 부탁드려요!"
					class="comment-scrollbar text-md w-full cursor-pointer resize-none rounded-xs border border-rose-200 bg-white px-4 py-4 transition-colors duration-300 focus:border-rose-400 focus:outline-none"
					rows="3"
					onkeydown={handleTextareaKeydown}
				></textarea>
				<button
					onclick={addComment}
					disabled={!newComment.trim()}
					class="mt-2 w-full cursor-pointer rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 py-3 font-bold text-white shadow-lg transition duration-300 hover:scale-110 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
				>
					💕 메시지 남기기 💕
				</button>
			</div>
		</div>
	{:else}
		<!-- Login Prompt & Form -->
		<div class="mb-6">
			<div class="rounded-xl border border-pink-200 bg-gradient-to-r from-pink-50 to-blue-50 p-4">
				<div class="mb-3 flex justify-center">
					<span class="text-md font-bold text-gray-800">이름과 비밀번호를 입력해주세요</span>
				</div>

				<form onsubmit={submitLogin}>
					<div class="space-y-2">
						<input
							type="text"
							bind:value={loginForm.username}
							placeholder="이름"
							required
							class="w-full cursor-pointer rounded-xl border border-pink-200 bg-white px-4 py-3 transition-colors duration-300 focus:border-pink-400 focus:outline-none"
						/>
						<input
							type="password"
							bind:value={loginForm.password}
							placeholder="비밀번호"
							required
							class="w-full cursor-pointer rounded-xl border border-blue-200 bg-white px-4 py-3 transition-colors duration-300 focus:border-blue-400 focus:outline-none"
						/>
						<button
							type="submit"
							class="mt-1 w-full cursor-pointer rounded-xl bg-gradient-to-r from-pink-400 to-blue-400 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
						>
							💕 로그인 💕
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Comments List -->
	<div class="comment-scrollbar max-h-96 space-y-4 overflow-y-auto">
		{#each comments as comment (comment.id)}
			<div
				class="rounded-xs border border-pink-200 bg-gradient-to-r from-pink-100 to-blue-100 p-4 shadow-sm"
			>
				<div class="mb-2 flex items-start justify-between">
					<div class="flex items-center space-x-2">
						<span class="text-lg">👤</span>
						<span class="font-bold text-gray-800">{comment.author}</span>
					</div>
					<!-- 비밀번호까지 체크해야함 -->
					{#if comment.author === currentUser}
						<button
							onclick={() => deleteComment(comment.id)}
							class="text-sm text-gray-400 transition-colors duration-300 hover:text-red-500"
						>
							🗑️
						</button>
					{/if}
				</div>
				<p class="mb-2 leading-relaxed text-gray-700">{comment.text}</p>
				<p class="text-xs text-gray-500">{comment.timestamp}</p>
			</div>
		{:else}
			<div class="text-center text-gray-500 py-8">
				<span class="text-5xl mb-2 block">💭</span>
				<p>💕순돌이에게 인사를 남겨주세요.👄</p>
			</div>
		{/each}
	</div>
</div>
