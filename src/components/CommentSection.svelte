<script lang="ts">
  import { onMount } from 'svelte';
  
  interface Comment {
    id: number;
    text: string;
    author: string;
    timestamp: string;
    date: Date;
  }

  interface LoginForm {
    username: string;
    password: string;
  }

  interface Props {
    isLoggedIn: boolean;
    currentUser: string;
    handleLogin: (username: string) => void;
    handleLogout: () => void;
  }

  let { isLoggedIn, currentUser, handleLogin, handleLogout }: Props = $props();
  
  let comments = $state<Comment[]>([]);
  let newComment = $state<string>('');
  let loginForm = $state<LoginForm>({ username: '', password: '' });
  let showLoginForm = $state<boolean>(false);

  onMount(() => {
    const savedComments = localStorage.getItem('celebrationComments');
    if (savedComments) {
      const parsedComments = JSON.parse(savedComments);
      comments = parsedComments.map((comment: any) => ({
        ...comment,
        date: new Date(comment.date)
      }));
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

  function submitLogin(e: SubmitEvent): void {
    e.preventDefault();
    if (loginForm.username && loginForm.password) {
      handleLogin(loginForm.username);
      loginForm = { username: '', password: '' };
      showLoginForm = false;
    }
  }

  function toggleLoginForm(): void {
    showLoginForm = !showLoginForm;
    if (!showLoginForm) {
      loginForm = { username: '', password: '' };
    }
  }

  function handleLoginFormChange(field: keyof LoginForm, value: string): void {
    loginForm = { ...loginForm, [field]: value };
  }
</script>

<div class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-rose-100">
  <h3 class="text-lg font-semibold text-gray-800 mb-4 text-center">
    축하 메세지 💌
  </h3>
  
  {#if isLoggedIn}
    <!-- User Info & Comment Form -->
    <div class="mb-6">
      <!-- User Header -->
      <div class="flex justify-between items-center mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-100">
        <div class="flex items-center space-x-2">
          <span class="text-lg">👋</span>
          <span class="text-gray-700">Welcome, <strong>{currentUser}</strong>!</span>
        </div>
        <button
          onclick={handleLogout}
          class="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
        >
          Logout
        </button>
      </div>

      <!-- Comment Input -->
      <textarea
        bind:value={newComment}
        placeholder="Share your wishes and blessings..."
        class="w-full px-4 py-3 rounded-2xl border border-rose-200 focus:border-rose-400 focus:outline-none bg-white/90 resize-none transition-colors"
        rows="3"
      ></textarea>
      <button
        onclick={addComment}
        disabled={!newComment.trim()}
        class="mt-3 w-full bg-gradient-to-r from-rose-400 to-pink-400 text-white py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send Love 💕
      </button>
    </div>
  {:else}
    <!-- Login Prompt & Form -->
    <div class="mb-6">
      {#if !showLoginForm}
        <!-- Login Prompt -->
        <div class="text-center p-6 bg-gradient-to-r from-pink-50 to-blue-50 rounded-2xl border border-pink-100">
          <span class="text-4xl mb-3 block">💭</span>
          <p class="text-gray-700 mb-4">Join the celebration to share your love and wishes!</p>
          <button
            onclick={toggleLoginForm}
            class="bg-gradient-to-r from-pink-400 to-blue-400 text-white px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Join the celebration 🎉
          </button>
        </div>
      {:else}
        <!-- Login Form -->
        <div class="p-4 bg-gradient-to-r from-pink-50 to-blue-50 rounded-2xl border border-pink-100">
          <div class="flex justify-between items-center mb-4">
            <h4 class="font-semibold text-gray-800">Join the celebration</h4>
            <button
              onclick={toggleLoginForm}
              class="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
          
          <form onsubmit={submitLogin}>
            <div class="space-y-3">
              <input
                type="text"
                bind:value={loginForm.username}
                placeholder="Your name"
                required
                class="w-full px-4 py-3 rounded-2xl border border-pink-200 focus:border-pink-400 focus:outline-none bg-white/90 transition-colors"
              />
              <input
                type="password"
                bind:value={loginForm.password}
                placeholder="Simple password"
                required
                class="w-full px-4 py-3 rounded-2xl border border-blue-200 focus:border-blue-400 focus:outline-none bg-white/90 transition-colors"
              />
              <button
                type="submit"
                class="w-full bg-gradient-to-r from-pink-400 to-blue-400 text-white py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start sharing love 💕
              </button>
            </div>
          </form>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Comments List -->
  <div class="space-y-4 max-h-96 overflow-y-auto">
    {#each comments as comment (comment.id)}
      <div class="bg-gradient-to-r from-pink-50 to-blue-50 rounded-2xl p-4 shadow-sm border border-pink-100">
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center space-x-2">
            <span class="text-lg">👤</span>
            <span class="font-medium text-gray-800">{comment.author}</span>
          </div>
          {#if comment.author === currentUser}
            <button
              onclick={() => deleteComment(comment.id)}
              class="text-gray-400 hover:text-red-500 text-sm transition-colors"
            >
              🗑️
            </button>
          {/if}
        </div>
        <p class="text-gray-700 mb-2 leading-relaxed">{comment.text}</p>
        <p class="text-xs text-gray-500">{comment.timestamp}</p>
      </div>
    {:else}
      <div class="text-center text-gray-500 py-8">
        <span class="text-4xl mb-2 block">💭</span>
        <p>
          No messages yet. {isLoggedIn ? 'Be the first to share your love!' : 'Join to start the conversation!'}
        </p>
      </div>
    {/each}
  </div>
</div>
