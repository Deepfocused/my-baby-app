<script lang="ts">
  import { onMount } from 'svelte';
  import PhotoUpload from '../components/PhotoUpload.svelte';
  import CommentSection from '../components/CommentSection.svelte';
  import MusicPlayer from '../components/MusicPlayer.svelte';
  import FallingLeaves from '../components/FallingLeaves.svelte';
  import type { PageProps } from './$types';
  import { scale } from 'svelte/transition';

  // from +page.ts
  let { data= $bindable() }: PageProps = $props();
  let isLoggedIn = $state<boolean>(false);
  let currentUser = $state<string>('');
  let isModalOpen = $state<boolean>(true);
  let isPlaying = $state<boolean>(false);

  function handleKeydown(event: KeyboardEvent) {
    if (isModalOpen && event.key === 'Enter') {
      closeModal();
    }
    if (isModalOpen && event.key === 'Escape'){
      window.history.back();
    }
  }

  onMount(() => {
    const savedUser: string | null = localStorage.getItem('celebrationUser');
    if (savedUser) {
      currentUser = savedUser;
      isLoggedIn = true;
    }
    return () => {
    };
  });

  function handleLogin(username: string): void {
    currentUser = username;
    isLoggedIn = true;
    localStorage.setItem('celebrationUser', username);
  }

  function handleLogout(): void {
    isLoggedIn = false;
    currentUser = '';
    localStorage.removeItem('celebrationUser');
  }

  function closeModal(): void {
    isModalOpen = false;
    isPlaying = true;
  }
  
  function handleGoBack(): void {
    window.history.back();
  }
</script>

<!-- select-none : 마우스 드래그를 막는 기능 -->
<main class="select-none bg-gradient-to-br from-teal-200 via-rose-100 to-lime-200">
  <FallingLeaves />

  <section class="container relative mx-auto max-w-md px-4 py-8">
    <header class="mb-8 text-center">
      <div
        class="rounded-3xl border border-rose-200 bg-white/70 p-6 shadow-lg backdrop-blur-xs"
      >
        <p class="mb-2 hidden text-2xl font-bold text-rose-400 lg:block">
          너무💘귀여운 🦾순돌이🍼 탄생
        </p>
        <p class="mb-2 text-2xl font-bold text-rose-400 lg:hidden">
          너무💘귀여운 <br />🦾순돌이🍼 탄생
        </p>
        <p class="font-bold text-orange-400">2025년 9월 20일에 태어나다!</p>
        <div class="mt-1 flex justify-center space-x-2">
          <span class="text-3xl">👨🏻</span>
          <span class="text-2xl">👩🏻</span>
          <span class="text-xl">👶🏻</span>
        </div>
      </div>
    </header>

    <section>
      <MusicPlayer bind:isPlaying={isPlaying} data />
    </section>

    <section>
      <PhotoUpload />
    </section>
    <section>
      <CommentSection
        {isLoggedIn}
        {currentUser}
        {handleLogin}
        {handleLogout}
      />
    </section>

    <footer class="mt-6 text-center text-sm text-gray-700">
      <p>🌸❤️ Made by 순돌이 아빠 ❤️🌸</p>
    </footer>
  </section>
</main>

{#if isModalOpen}
  <div
    transition:scale={{ duration: 2121, start: 7 }}
    class="fixed inset-0 z-[121] flex items-center justify-center backdrop-blur-sm"
  >
    <div
      class="flex flex-col items-center justify-center rounded-3xl bg-white/80 p-8 text-center shadow-lg "
    >
      <p class="mb-6 text-3xl font-bold text-pink-400">👶🏻순돌이 세계로🌎</p>
      
      <div class="flex space-x-4">
        <button
          class="cursor-pointer rounded-full bg-rose-500 px-6 py-3 text-lg font-bold text-white shadow-md transition duration-300 hover:scale-110 active:scale-110"
          onclick={closeModal}
          onkeydown={handleKeydown}
        >
          입장하기
        </button>

        <button
          class="cursor-pointer rounded-full bg-emerald-400 px-6 py-3 text-lg font-bold text-white shadow-md transition duration-300 hover:scale-110 active:scale-110"
          onclick={handleGoBack}
          onkeydown={handleKeydown}
        >
          뒤로가기
        </button>
      </div>
    </div>
  </div>
{/if}