<script lang="ts">
  import { onMount } from 'svelte';
  import PhotoUpload from '../components/PhotoUpload.svelte';
  import CommentSection from '../components/CommentSection.svelte';
  import MusicPlayer from '../components/MusicPlayer.svelte';
  import FallingLeaves from '../components/FallingLeaves.svelte';

  let isLoggedIn = $state<boolean>(false);
  let currentUser = $state<string>('');

  onMount(() => {
    const savedUser: string | null = localStorage.getItem('celebrationUser');
    if (savedUser) {
      currentUser = savedUser;
      isLoggedIn = true;
    }
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
</script>

<div class="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-amber-50 relative overflow-hidden">
  <FallingLeaves />
  
  <div class="relative z-10 container mx-auto px-4 py-6 max-w-md">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-pink-100">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">
          🦾 순돌이👨 세상에 오신 것을 환영합니다.💕
        </h1>
        <p class="text-pink-600 font-medium">2025년 9월 20일 탄생!</p>
        <div class="flex justify-center mt-4 space-x-2">
          <span class="text-2xl">🦾</span>
          <span class="text-2xl">👶</span>
          <span class="text-2xl">🤏</span>
        </div>
      </div>
    </div>

    <!-- Music Player -->
    <MusicPlayer />

    <!-- Photo Upload Section -->
    <PhotoUpload />

    <!-- Comment Section -->
    <CommentSection {isLoggedIn} {currentUser} {handleLogin} {handleLogout} />

    <!-- Footer -->
    <div class="text-center mt-8 text-gray-500 text-sm">
      <p>Made with 💕 for our little miracle</p>
      <div class="flex justify-center mt-2 space-x-1">
        <span>🌸</span>
        <span>🍼</span>
        <span>🌸</span>
      </div>
    </div>
  </div>
</div>