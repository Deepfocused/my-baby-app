<script lang="ts">
  import { onMount } from 'svelte';
  
  let audio: HTMLAudioElement;
  let isPlaying = $state<boolean>(false);
  let isLoaded = $state<boolean>(false);

  onMount(() => {
    // Auto-play gentle music when page loads
    if (audio) {
      audio.volume = 0.3;
      audio.loop = true;
      
      // Try to auto-play (may be blocked by browser)
      audio.play().then(() => {
        isPlaying = true;
      }).catch((error: Error) => {
        // Auto-play blocked, user will need to click play
        console.log('Auto-play blocked:', error.message);
      });
    }
  });

  function togglePlay(): void {
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
    } else {
      audio.play();
      isPlaying = true;
    }
  }

  function handleLoadedData(): void {
    isLoaded = true;
  }
</script>

<div class="bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-lg border border-purple-100 mb-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <span class="text-2xl">🎵</span>
      <div>
        <p class="font-medium text-gray-800">아직...</p>
        <p class="text-sm text-gray-500">~~~~</p>
      </div>
    </div>
    
    <button
      onclick={togglePlay}
      class="bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {#if isPlaying}
        <span class="text-lg">⏸️</span>
      {:else}
        <span class="text-lg">▶️</span>
      {/if}
    </button>
  </div>
  
  <!-- Audio element with placeholder lullaby -->
  <audio
    bind:this={audio}
    src="/placeholder.mp3?query=gentle piano lullaby for newborn baby"
    onloadeddata={handleLoadedData}
  ></audio>
</div>
