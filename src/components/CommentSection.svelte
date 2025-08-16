<script lang="ts">
	import type { Comment } from '../types/types';
	import { onMount } from 'svelte';
	import toast, { Toaster } from 'svelte-5-french-toast';

	const showComments = 10;
	let comments = $state<Comment[]>([]);
	let visibleCount = $state(showComments);

	let username = $state<string>('');
	let password = $state<string>('');
	let newComment = $state<string>('');

	let editingId = $state<number | null>(null);
	let editPassword = $state<string>('');
	let editText = $state<string>('');

	// API: 댓글 목록 불러오기
	const loadComments: () => Promise<void> = async () => {
		try {
			const res = await fetch('/api/comments');
			const load = await res.json();
			if (load?.error) {
				toast(`댓글 로드 실패: ${load.error}`, { icon: '❌', duration: 1000 });
				return;
			}
		} catch (err) {
			if (err instanceof Error) {
				toast(`댓글 로드 중 오류 발생: ${err.message}`, { icon: '😥', duration: 1000 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 1000 });
			}
		}
	};

	// API: 댓글 추가
	const addComment: () => Promise<void> = async () => {
		if (!username.trim() || !password.trim() || !newComment.trim()) return;

		try {
			const res = await fetch('/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					author: username.trim(),
					password: password.trim(),
					text: newComment.trim()
				})
			});
			const created = await res.json();
			if (created?.error) {
				toast(`댓글 추가 실패: ${created.error}`, { icon: '❌', duration: 1000 });
				return;
			}

			comments = [created, ...comments];
			username = '';
			password = '';
			newComment = '';

			toast('댓글 남기기 완료!', { icon: '✅', duration: 1000 });
		} catch (err) {
			if (err instanceof Error) {
				toast(`댓글 추가 중 오류 발생: ${err.message}`, { icon: '😥', duration: 1000 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 1000 });
			}
		}
	};

	// API: 댓글 삭제
	const removeComment: (id: number) => Promise<void> = async (id) => {
		try {
			const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
			const remove = await res.json();
			if (remove?.error) {
				toast(`댓글 삭제 실패: ${remove.error}`, { icon: '❌', duration: 1000 });
				return;
			}
			comments = comments.filter((c) => c.id !== id);
		} catch (err) {
			if (err instanceof Error) {
				toast(`댓글 삭제 중 오류 발생: ${err.message}`, { icon: '😥', duration: 1000 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 1000 });
			}
		}
	};

	// 수정 시작
	const startEdit: (comment: Comment) => void = (comment) => {
		editingId = comment.id;
		editText = comment.text;
		editPassword = '';
	};

	// 댓글 수정
	const saveEdit: (comment: Comment) => Promise<void> = async (comment) => {
		try {
			const res = await fetch(`/api/comments/${comment.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					password: editPassword,
					text: editText.trim()
				})
			});
			const save = await res.json();
			if (save?.status === 401) {
				toast(`'비밀번호가 틀림: ${save.error}`, { icon: '❌', duration: 1000 });
				return;
			}
			if (save?.status === 500) {
				toast(`댓글 수정 실패: ${save.error}`, { icon: '❌', duration: 1000 });
				return;
			}

			const updated = await res.json();
			comments = comments.map((c) => (c.id === updated.id ? updated : c));
			editingId = null;
		} catch (err) {
			if (err instanceof Error) {
				toast(`댓글 수정 중 오류 발생: ${err.message}`, { icon: '😥', duration: 1000 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 1000 });
			}
		}
	};

	// textarea 줄바꿈 처리
	const handleTextareaKeydown: (event: KeyboardEvent) => Promise<void> = async (event) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			await addComment();
		}
	};

	// 페이지 로드시 댓글 불러오기
	onMount(() => {
		// 즉시 실행
		// const init: () => Promise<void> = async () => {
		// 	await loadComments();
		// }
		// init();
		(async (): Promise<void> => {
			await loadComments();
		})();
	});
</script>

<div class="text-sm max-[480px]:text-xs">
	<Toaster position="top-center" />
</div>
<div
	class="rounded-lg border-purple-200 bg-white/80 p-6 shadow-xl shadow-purple-50 backdrop-blur-xs transition duration-1000 hover:shadow-purple-200"
>
	<div class="mb-6 text-center">
		<span class="text-3xl">💌</span>
		<span class="text-2xl font-bold text-purple-400">축하 메시지</span>
		<span class="text-3xl">💌</span>
	</div>

	<!-- 댓글 입력 -->
	<div class="mb-6 space-y-2">
		<div class="flex items-center justify-between space-x-2">
			<input
				type="text"
				placeholder="이름"
				bind:value={username}
				class="w-full cursor-pointer rounded-sm border border-purple-200 p-1 transition duration-300 hover:shadow-lg hover:shadow-purple-300 focus:scale-105 focus:ring-2 focus:ring-purple-300 max-[480px]:text-sm"
			/>
			<input
				type="password"
				placeholder="비밀번호"
				bind:value={password}
				class="w-full cursor-pointer rounded-sm border border-purple-200 p-1 transition duration-300 hover:shadow-lg hover:shadow-purple-300 focus:scale-105 focus:ring-2 focus:ring-purple-300 max-[480px]:text-sm"
			/>
		</div>
		<textarea
			bind:value={newComment}
			placeholder="축하 메시지를 입력하세요!"
			rows="3"
			onkeydown={handleTextareaKeydown}
			class="comment-scrollbar w-full cursor-pointer resize-none rounded-sm border border-purple-200 p-2 transition duration-300 hover:shadow-lg hover:shadow-purple-300 focus:scale-105 focus:ring-2 focus:ring-purple-300 max-[480px]:text-sm"
		></textarea>
		<button
			onclick={addComment}
			disabled={!username.trim() || !password.trim() || !newComment.trim()}
			class="w-full cursor-pointer rounded bg-gradient-to-r from-pink-400 to-rose-400 p-2 font-bold text-white transition duration-300 hover:shadow-lg hover:shadow-pink-300 focus:scale-105 active:scale-120 max-[480px]:text-sm"
		>
			💕 메시지 남기기 💕
		</button>
	</div>

	<!-- 댓글 목록 -->
	<div class="space-y-4">
		{#each comments.slice(0, visibleCount) as comment (comment.id)}
			<div
				class="rounded-sm border border-pink-200 bg-gradient-to-r from-pink-100 to-blue-100 p-2 transition duration-300 hover:shadow-lg hover:shadow-pink-300 max-[480px]:text-sm"
			>
				<div class="mb-2 flex items-start justify-between">
					<div class="flex items-center space-x-2">
						<span class="text-lg">👤</span>
						<span class="font-bold">{comment.author}</span>
					</div>
					<div class="flex space-x-2 text-sm text-gray-400">
						<button onclick={() => startEdit(comment)}>✏️</button>
						<button onclick={() => removeComment(comment.id)}>🗑️</button>
					</div>
				</div>
				{#if editingId === comment.id}
					<textarea
						bind:value={editText}
						class="mb-2 w-full resize-none rounded-lg border px-3 py-2"
						rows="3"
					></textarea>
					<input
						type="password"
						placeholder="비밀번호 확인"
						bind:value={editPassword}
						class="mb-2 w-full rounded-lg border px-3 py-2"
					/>
					<div class="flex space-x-2">
						<button
							onclick={() => saveEdit(comment)}
							class="flex-1 rounded-lg bg-green-400 py-2 font-bold text-white">저장</button
						>
						<button
							onclick={() => (editingId = null)}
							class="roundedlg flex-1 bg-gray-300 py-2 font-bold">취소</button
						>
					</div>
				{:else}
					<p class="whitespace-pre-line text-gray-700">{comment.text}</p>
					<p class="mt-1 text-xs text-gray-500">{comment.timestamp}</p>
				{/if}
			</div>
		{/each}

		{#if visibleCount < comments.length}
			<button
				onclick={() => (visibleCount += showComments)}
				class="mt-4 w-full rounded-lg bg-gray-100 py-2 font-bold text-gray-600 max-[480px]:text-sm"
				>더 보기</button
			>
		{:else if comments.length === 0}
			<div class="py-8 text-center text-gray-500">
				<span class="mb-2 block text-4xl max-[480px]:text-2xl">💭</span>
				<p class="max-[480px]:text-sm">💕순돌이에게 인사를 남겨주세요.👄</p>
			</div>
		{/if}
	</div>
</div>
