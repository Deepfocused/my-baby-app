<script lang="ts">
  import { onMount } from 'svelte';
  
  interface Leaf {
    id: number;
    left: number;
    animationDelay: number;
    animationDuration: number;
    emoji: string;
  }

  let leaves = $state<Leaf[]>([]);
  
  onMount(() => {
    const emojis: string[] = ['🧑', '👩', '👶', '👨‍👩‍👦'];
    const newLeaves: Leaf[] = [];

    // Create falling leaves
    for (let i = 0; i < 21; i++) {
      newLeaves.push({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 10,
        animationDuration: 8 + Math.random() * 4,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      });
    }
    
    leaves = newLeaves;
  });
</script>

<div class="fixed inset-0 pointer-events-none overflow-hidden">
  {#each leaves as leaf (leaf.id)}
    <div
      class="absolute text-2xl opacity-60 animate-bounce"
      style="
        left: {leaf.left}%;
        animation-delay: {leaf.animationDelay}s;
        animation-duration: {leaf.animationDuration}s;
        animation-iteration-count: infinite;
        animation-timing-function: ease-in-out;
        transform: translateY(-100px);
      "
    >
      <div
        class="animate-pulse"
        style="
          animation-delay: {leaf.animationDelay + 1}s;
          animation-duration: {leaf.animationDuration / 2}s;
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
      transform: translateY(-100px) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 0.5;
    }
    90% {
      opacity: 0.9;
    }
    100% {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
  
  .animate-bounce {
    animation-name: fall;
  }
</style>
