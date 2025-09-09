<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Comment } from '../types/types';
	import toast, { Toaster } from 'svelte-5-french-toast';
	import { fade } from 'svelte/transition';
	import { User, Trash2, Pencil, MessageSquarePlus, Heart } from '@lucide/svelte';

	let { isAdmin, commentLoading }: { isAdmin: string; commentLoading: boolean } = $props();
	let comments = $state<Comment[]>([]);

	// 댓글 개수 제한 상수
	const showComments: number = 10;
	let heartLimit = $state<number>(0);
	let visibleCount = $state<number>(showComments);

	let username = $state<string | null>(null);
	let password = $state<string | null>(null);
	let newText = $state<string>('');

	let confirmEditId = $state<string | null>(null);
	let confirmDeleteId = $state<string | null>(null);
	let confirmPassword = $state<string | null>(null);

	let showEditWindow = $state<boolean>(false);
	let editPassword = $state<string | null>(null);
	let editText = $state<string>('');

	let focusUsername: HTMLInputElement | undefined;
	let focusPassword: HTMLInputElement | undefined;
	let focusTextArea: HTMLTextAreaElement | undefined;

	// let messageButton: HTMLButtonElement | undefined;
	// let saveComfirmButton: HTMLButtonElement | undefined;
	let cancelButton: HTMLButtonElement | undefined;

	// 댓글 목록 불러오기
	const loadComments: () => Promise<void> = async () => {
		try {
			const res = await fetch('/api/comments');
			const load = await res.json();
			if (load?.error) {
				toast(`${load.error}`, { icon: '❌', duration: 2100 });
				return;
			}
			comments = load;
			heartLimit = comments.length;
			toast('최신 댓글 불러오기 성공!', { icon: '✅', duration: 2100 });
		} catch (err) {
			if (err instanceof Error) {
				toast(`${err.message}`, { icon: '😥', duration: 2100 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 2100 });
			}
		}
	};

	// 댓글 추가
	const addComment: () => Promise<void> = async () => {
		if (!username?.trim()) {
			toast(`이름 입력해!`, { icon: '😥', duration: 2100 });
			return;
		}
		if (!password?.trim()) {
			toast(`비밀번호 입력해!`, { icon: '😥', duration: 2100 });
			return;
		}

		try {
			// messageButton?.classList.add('scale-110');
			// setTimeout(() => messageButton?.classList.remove('scale-110'), 210);
			const res = await fetch('/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: username.trim(),
					password: password.trim(),
					text: newText.trim()
				})
			});
			const created = await res.json();
			if (created?.error) {
				toast(`${created.error}`, { icon: '❌', duration: 2100 });
				return;
			}
			// 최신 것부터 보여주기
			comments = [created, ...comments];
			username = null;
			password = null;
			newText = '';
			toast('댓글 추가 성공!', { icon: '✅', duration: 2100 });

			await tick();
			// username 입력으로 focus!
			focusUsername?.focus();
			heartLimit = comments.length;
		} catch (err) {
			if (err instanceof Error) {
				toast(`${err.message}`, { icon: '😥', duration: 2100 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 2100 });
			}
		}
	};

	// 관리자 댓글 삭제
	const removeAdminComment: (id: string) => Promise<void> = async (id) => {
		try {
			const res = await fetch(`/api/comments`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					confirmDeleteId: id
				})
			});
			const remove = await res.json();
			if (remove?.error) {
				toast(`${remove.error}`, { icon: '❌', duration: 2100 });
				return;
			}
			comments = comments.filter((comment) => comment.id !== id);
			confirmDeleteId = null;
			confirmPassword = null;
			toast('댓글 삭제 성공!', { icon: '✅', duration: 2100 });
		} catch (err) {
			if (err instanceof Error) {
				toast(`${err.message}`, { icon: '😥', duration: 2100 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 2100 });
			}
		}
	};

	const removeDecision: (id: string) => Promise<void> = async (id) => {
		if (isAdmin) {
			await removeAdminComment(id);
		} else {
			confirmEditId = null;
			confirmDeleteId = id;
			confirmPassword = null;
			toast('댓글 삭제 시도!', { icon: '✅', duration: 2100 });
			await tick();
			focusPassword?.focus();
		}
	};
	const removeComment: () => Promise<void> = async () => {
		if (!confirmPassword?.trim()) {
			toast(`비밀번호 입력해!`, { icon: '😥', duration: 2100 });
			return;
		}
		try {
			const res = await fetch(`/api/comments/${confirmDeleteId}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					confirmPassword: confirmPassword
				})
			});
			const remove = await res.json();
			if (remove?.error) {
				toast(`${remove.error}`, { icon: '❌', duration: 2100 });
				return;
			}
			comments = comments.filter((comment) => comment.id !== confirmDeleteId);
			confirmDeleteId = null;
			confirmPassword = null;
			toast('댓글 삭제 성공!', { icon: '✅', duration: 2100 });
		} catch (err) {
			if (err instanceof Error) {
				toast(`${err.message}`, { icon: '😥', duration: 2100 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 2100 });
			}
		}
	};

	// 수정하기 전 비밀번호 확인
	const editStart: () => Promise<void> = async () => {
		if (!confirmPassword?.trim()) {
			toast(`비밀번호 입력해!`, { icon: '😥', duration: 2100 });
			return;
		}
		try {
			// saveComfirmButton?.classList.add('scale-110');
			// setTimeout(() => saveComfirmButton?.classList.remove('scale-110'), 210);
			const res = await fetch(`/api/comments/${confirmEditId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					confirmPassword: confirmPassword.trim()
				})
			});
			const start = await res.json();
			if (start?.error) {
				toast(`${start.error}`, { icon: '❌', duration: 2100 });
				return;
			}

			showEditWindow = true;
			editText = comments.find((column) => column.id === confirmEditId)?.text ?? ''; // 기존 댓글 저장
			editPassword = confirmPassword.trim(); // 기존 비밀번호 저장
			toast('비밀번호 통과!', { icon: '✅', duration: 2100 });
			await tick();
			focusTextArea?.focus();
		} catch (err) {
			if (err instanceof Error) {
				toast(`${err.message}`, { icon: '😥', duration: 2100 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 2100 });
			}
		}
	};

	// 댓글 수정
	const editSave: () => Promise<void> = async () => {
		if (!editPassword?.trim()) {
			toast(`수정할 비밀번호 입력해!`, { icon: '😥', duration: 2100 });
			return;
		}
		try {
			// saveComfirmButton?.classList.add('scale-110');
			// setTimeout(() => saveComfirmButton?.classList.remove('scale-110'), 210);
			const res = await fetch(`/api/comments/${confirmEditId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					editPassword: editPassword.trim(),
					editText: editText.trim()
				})
			});
			const save = await res.json();
			if (save?.error) {
				toast(`${save.error}`, { icon: '❌', duration: 2100 });
				return;
			}

			comments = comments.map((column) =>
				column.id === confirmEditId ? { ...column, text: save.text } : column
			);

			confirmEditId = null;
			confirmPassword = null;
			showEditWindow = false;
			editPassword = null;
			editText = '';
			toast('댓글 수정 성공!', { icon: '✅', duration: 2100 });
		} catch (err) {
			if (err instanceof Error) {
				toast(`${err.message}`, { icon: '😥', duration: 2100 });
			} else {
				toast(`알 수 없는 오류 발생`, { icon: '😥', duration: 2100 });
			}
		}
	};

	const editDecision: (id: string) => Promise<void> = async (id) => {
		confirmEditId = id;
		confirmDeleteId = null;
		confirmPassword = null;
		showEditWindow = false;
		toast('댓글 수정 시도!', { icon: '✅', duration: 2100 });
		await tick();
		focusPassword?.focus();
	};

	const editConfirmCancel: () => void = () => {
		cancelButton?.classList.add('scale-110');
		setTimeout(() => cancelButton?.classList.remove('scale-110'), 210);
		confirmEditId = null;
		confirmPassword = null;
		toast('댓글 수정 취소!', { icon: '❌', duration: 2100 });
	};

	const editCancel: () => void = () => {
		cancelButton?.classList.add('scale-110');
		setTimeout(() => cancelButton?.classList.remove('scale-110'), 210);
		confirmEditId = null;
		confirmPassword = null;
		showEditWindow = false;
		editPassword = null;
		editText = comments.find((column) => column.id === confirmEditId)?.text ?? ''; // 기존 댓글 저장
		toast('댓글 수정 취소!', { icon: '❌', duration: 2100 });
	};

	const removeCancel: () => void = () => {
		cancelButton?.classList.add('scale-110');
		setTimeout(() => cancelButton?.classList.remove('scale-110'), 210);
		confirmDeleteId = null;
		confirmPassword = null;
		toast('댓글 삭제 취소!', { icon: '❌', duration: 2100 });
	};

	const addHeart: (id: string) => Promise<void> = async (id) => {
		if ((comments.find((comment) => comment.id === id)?.likes ?? 0) >= heartLimit) {
			toast('하트는 댓글 수만큼만 가능! 💖', { icon: '❌', duration: 2100 });
			return;
		}

		try {
			let newLikes: number = 0;
			comments = comments.map((comment) => {
				if (comment.id === id) {
					newLikes = (comment.likes ?? 0) + 1;
					return { ...comment, likes: newLikes };
				}
				return comment;
			});

			await fetch(`/api/comments/${id}/heart`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ likes: newLikes })
			});
		} catch {
			toast(`하트 실패 😥`, { icon: '❌', duration: 2100 });
			comments = comments.map((comment) =>
				comment.id === id ? { ...comment, likes: Math.max((comment.likes ?? 1) - 1, 0) } : comment
			);
		}
	};

	onMount(() => {
		const handleKeydown: (event: KeyboardEvent) => Promise<void> = async (event) => {
			const editCondition = comments.find((column) => column.id === confirmEditId)?.id;
			const removeCondition = comments.find((column) => column.id === confirmDeleteId)?.id;
			if (event.key === 'Enter' && !event.shiftKey) {
				// 조건에 따라 각각 동작해야 함
				// if (editCondition) {
				// 	if (!showEditWindow) await editStart();
				// 	else await editSave();
				// }
				if (removeCondition) {
					if (isAdmin) await removeAdminComment(removeCondition);
					else await removeComment();
				}
			}
			if (event.key === 'Escape') {
				// 조건에 따라 각각 동작해야 함
				if (editCondition) editConfirmCancel();
				if (confirmPassword && editCondition) editCancel();
				if (removeCondition) removeCancel();
			}
		};
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	$effect(() => {
		// 10분 마다 댓글 데이터 갱신하기
		if (commentLoading) {
			(async (): Promise<void> => {
				await loadComments();
			})();
			const interval = setInterval(
				async (): Promise<void> => {
					try {
						await loadComments();
					} catch {
						toast.error('댓글 새로고침 실패 😢');
					}
				},
				10 * 60 * 1000
			);

			return () => clearInterval(interval);
		}
	});
</script>

{#snippet confirmBox(action: () => void, cancel: () => void, condition: string)}
	<div class="flex items-center gap-1">
		<input
			bind:this={focusPassword}
			type="password"
			bind:value={confirmPassword}
			minlength="3"
			maxlength="8"
			placeholder="비밀번호 입력"
			class={`ml-1 w-full cursor-pointer rounded-sm border p-0 text-xs leading-none transition duration-300 hover:shadow-lg focus:scale-105 focus:ring-2 max-[375px]:text-[10px] ${condition === 'edit' ? `border-purple-200 hover:shadow-purple-300 focus:ring-purple-300` : `border-zinc-200 hover:shadow-zinc-300 focus:ring-zinc-300`}`}
		/>
		<!-- bind:this={saveComfirmButton} -->
		<button
			class={`w-12 cursor-pointer rounded py-0.5 text-xs leading-none font-bold text-white transition duration-300 hover:shadow-lg focus:scale-105 active:scale-110 disabled:cursor-not-allowed disabled:opacity-21 disabled:hover:scale-100 max-[375px]:text-[10px] ${condition === 'edit' ? `bg-purple-500 hover:shadow-purple-300` : `bg-zinc-800 hover:shadow-zinc-300`}`}
			onclick={action}
			disabled={!confirmPassword?.trim()}
		>
			확인
		</button>
		<button
			bind:this={cancelButton}
			class="w-12 cursor-pointer rounded bg-gray-400 py-0.5 text-xs leading-none font-bold text-white transition duration-300 hover:shadow-lg hover:shadow-gray-300 focus:scale-105 active:scale-110 max-[375px]:text-[10px]"
			onclick={cancel}
		>
			취소
		</button>
	</div>
{/snippet}

<div class="text-sm max-[375px]:text-xs">
	<Toaster position="top-center" />
</div>
<div
	class="flex flex-col rounded-lg border-3 border-dashed border-purple-200 bg-white/80 p-6 shadow-xl shadow-purple-50 backdrop-blur-xs transition duration-1000 hover:shadow-purple-200"
>
	<div class="mb-6 inline-flex items-center justify-center">
		<span class="text-3xl leading-none max-[375px]:text-2xl">💌</span>
		<span class="mx-1 text-2xl leading-none font-bold text-purple-400 max-[375px]:text-lg"
			>{comments.length}개의 축하 메시지</span
		>
		<span class="text-3xl leading-none max-[375px]:text-2xl">💌</span>
	</div>

	<div class="item-center mb-4 flex flex-col justify-center">
		<div class="flex items-center justify-center space-x-2">
			<input
				bind:this={focusUsername}
				type="text"
				placeholder="이름"
				minlength="3"
				maxlength="6"
				bind:value={username}
				class="w-full cursor-pointer rounded-sm border border-purple-200 bg-purple-50/70 p-1 font-serif text-[13px] transition duration-300 hover:shadow-lg hover:shadow-purple-300 focus:scale-105 focus:ring-2 focus:ring-purple-300 max-[375px]:text-[11px]"
			/>
			<input
				type="password"
				placeholder="비밀번호"
				minlength="3"
				maxlength="8"
				bind:value={password}
				class="w-full cursor-pointer rounded-sm border border-purple-200 bg-purple-50/70 p-1 font-serif text-[13px] transition duration-300 hover:shadow-lg hover:shadow-purple-300 focus:scale-105 focus:ring-2 focus:ring-purple-300 max-[375px]:text-[11px]"
			/>
		</div>
		<textarea
			bind:value={newText}
			placeholder="축하 메시지를 입력하세요!"
			rows="3"
			class="comment-scrollbar mt-2 w-full cursor-pointer resize-none rounded-sm border border-purple-200 bg-purple-50/70 p-2 font-serif text-[13px] transition duration-300 hover:shadow-lg hover:shadow-purple-300 focus:scale-105 focus:ring-2 focus:ring-purple-300 max-[375px]:text-[11px]"
		></textarea>
		<button
			onclick={addComment}
			disabled={!username?.trim() || !password?.trim()}
			class="mt-2 w-full cursor-pointer rounded bg-gradient-to-r from-pink-400 to-rose-400 p-2 text-[13px] leading-none font-bold text-white transition duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-300 focus:scale-105 active:scale-110 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 max-[375px]:text-[11px]"
		>
			💕 메시지 남기기 💕
		</button>
	</div>

	<div class="space-y-4">
		{#each comments.slice(0, visibleCount) as comment (comment.id)}
			<div
				transition:fade={{ duration: 500 }}
				class="rounded-sm border border-pink-200 bg-gradient-to-r from-pink-100 to-blue-100 p-2 transition duration-300 hover:shadow-lg hover:shadow-pink-300"
			>
				<div class="mb-2 flex items-center justify-between">
					<div class="mt-0.5 mb-0.5 flex w-36 items-center justify-start max-[375px]:mt-[1.5px]">
						<span class="mr-0.5"
							><User
								class="h-[18px] w-[18px] max-[375px]:h-[15px] max-[375px]:w-[15px]"
								color="#a855f7"
							/></span
						>
						<span class="text-sm leading-none font-bold max-[375px]:text-[11px]"
							>{comment.username}</span
						>
						<button
							class="ml-1 flex cursor-pointer items-center justify-center rounded-lg pr-1 text-lg leading-none transition duration-300 hover:scale-110"
							hidden={(confirmEditId === comment.id || confirmDeleteId === comment.id
								? true
								: false) ||
								(showEditWindow && confirmEditId === comment.id)}
							onclick={() => addHeart(comment.id)}
						>
							<Heart
								class="h-[17px] w-[17px] max-[375px]:h-[15px] max-[375px]:w-[15px]"
								color="#e11d48"
								fill={(comment.likes ?? 0) > 0 ? '#e11d48' : 'none'}
							/>
							<span class="ml-0.5 font-mono text-xs text-red-500 max-[375px]:text-[11px]"
								>{comment.likes ?? 0}</span
							>
						</button>
					</div>
					<div class="flex items-center justify-end">
						<button
							class="cursor-pointer rounded-lg pr-1 text-lg leading-none transition duration-300 hover:scale-110"
							hidden={(confirmEditId === comment.id || confirmDeleteId === comment.id
								? true
								: false) ||
								(showEditWindow && confirmEditId === comment.id)}
							onclick={() => editDecision(comment.id)}
							><Pencil
								class="h-[17px] w-[17px] max-[375px]:h-[15px] max-[375px]:w-[15px]"
								color="#a855f7"
							/></button
						>
						{#if !showEditWindow && confirmEditId === comment.id}
							{@render confirmBox(editStart, editConfirmCancel, 'edit')}
						{/if}

						<button
							hidden={(confirmDeleteId === comment.id || confirmEditId === comment.id
								? true
								: false) ||
								(showEditWindow && confirmEditId === comment.id)}
							class="cursor-pointer rounded-lg text-lg leading-none transition duration-300 hover:scale-110"
							onclick={() => removeDecision(comment.id)}
							><Trash2
								class="h-[17px] w-[17px] max-[375px]:h-[15px] max-[375px]:w-[15px]"
								color="#3f3f46"
							/></button
						>
						{#if confirmDeleteId === comment.id && !isAdmin}
							{@render confirmBox(removeComment, removeCancel, 'remove')}
						{/if}
					</div>

					{#if showEditWindow && confirmEditId === comment.id}
						<div class="flex items-center justify-center">
							<div class="flex items-center justify-center gap-1">
								<input
									type="password"
									bind:value={editPassword}
									minlength="3"
									maxlength="8"
									placeholder="비밀번호 입력"
									class="ml-1 cursor-pointer rounded-sm border border-emerald-200 p-0 text-xs leading-none transition duration-300 hover:shadow-lg hover:shadow-emerald-300 focus:scale-105 focus:ring-2 focus:ring-emerald-300 max-[375px]:text-[10px]"
								/>
								<!-- bind:this={saveComfirmButton} -->
								<button
									class="w-12 cursor-pointer rounded bg-emerald-500 py-0.5 text-xs leading-none font-bold text-white transition duration-300 hover:shadow-lg hover:shadow-emerald-300 focus:scale-105 active:scale-110 disabled:cursor-not-allowed disabled:opacity-21 disabled:hover:scale-100 max-[375px]:text-[10px]"
									disabled={!editPassword?.trim()}
									onclick={editSave}
								>
									저장
								</button>
								<button
									bind:this={cancelButton}
									class="w-12 cursor-pointer rounded bg-gray-400 py-0.5 text-xs leading-none font-bold text-white transition duration-300 hover:shadow-lg hover:shadow-gray-300 focus:scale-105 active:scale-110 max-[375px]:text-[10px]"
									onclick={editCancel}
								>
									취소
								</button>
							</div>
						</div>
					{/if}
				</div>
				{#if showEditWindow && confirmEditId === comment.id}
					<textarea
						bind:this={focusTextArea}
						bind:value={editText}
						class="comment-scrollbar w-full cursor-pointer resize-none rounded-sm border border-purple-200 bg-purple-50/70 p-2 font-serif text-[13px] transition duration-300 hover:shadow-lg hover:shadow-purple-300 focus:scale-105 focus:ring-2 focus:ring-purple-300 max-[375px]:text-[11px]"
						rows="3"
					></textarea>
				{:else}
					<div
						class="comment-scrollbar flex w-full cursor-pointer flex-col items-start justify-start rounded-sm border border-purple-200 bg-purple-50/70 p-2 transition duration-300 hover:shadow-lg hover:shadow-purple-300"
					>
						<p class="font-serif text-sm whitespace-pre-line max-[375px]:text-xs">{comment.text}</p>
						<p class="mt-2 font-mono text-xs leading-none">{comment.timestamp}</p>
					</div>
				{/if}
			</div>
		{/each}
		{#if visibleCount < comments.length}
			<div class="flex items-center justify-center">
				<button
					class="mt-1 flex w-fit cursor-pointer items-center space-x-2 rounded-lg bg-purple-200/21 p-2 transition duration-300 hover:scale-105 hover:bg-purple-200/50 hover:shadow-lg hover:shadow-purple-200"
					onclick={() => (visibleCount += showComments)}
				>
					<span class="text-sm font-bold max-[375px]:text-xs">댓글 더 보기</span>
					<MessageSquarePlus
						class="h-[21px] w-[21px] max-[375px]:h-[18px] max-[375px]:w-[18px]"
						color="#a855f7"
					/>
				</button>
			</div>
		{:else if comments.length === 0}
			<div class="flex flex-col items-center justify-center p-4 text-gray-500">
				<span class="mb-2 block text-4xl leading-none max-[375px]:text-2xl">💭</span>
				<span class="mt-2 text-sm leading-none max-[375px]:text-xs"
					>💕순돌이에게 인사를 남겨주세요.👄</span
				>
			</div>
		{/if}
	</div>
</div>
