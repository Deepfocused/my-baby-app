<script lang="ts">
  interface Photo {
    id: number;
    url: string;
    name: string;
    timestamp: string;
  }

  let photos = $state<Photo[]>([]);
  let fileInput: HTMLInputElement;

  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    
    files.forEach((file: File) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const newPhoto: Photo = {
            id: Date.now() + Math.random(),
            url: e.target?.result as string,
            name: file.name,
            timestamp: new Date().toLocaleString()
          };
          photos = [...photos, newPhoto];
        };
        reader.readAsDataURL(file);
      }
    });
  }

  function removePhoto(id: number): void {
    photos = photos.filter((photo: Photo) => photo.id !== id);
  }

  function triggerFileInput(): void {
    fileInput?.click();
  }
</script>

<div class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-amber-100 mb-6">
  <h2 class="text-xl font-semibold text-gray-800 mb-4 text-center">
     📸 소중한 순간 📸
  </h2>
  
  <!-- Upload Button -->
  <div class="mb-6">
    <input
      bind:this={fileInput}
      type="file"
      multiple
      accept="image/*"
      onchange={handleFileUpload}
      class="hidden"
    />
    <button
      onclick={triggerFileInput}
      class="w-full bg-gradient-to-r from-amber-300 to-pink-300 text-gray-800 py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-dashed border-amber-400"
    >
      <div class="flex flex-col items-center space-y-2">
        <span class="text-2xl">📱</span>
        <span>사진 업로드</span>
        <span class="text-sm opacity-75">Click</span>
      </div>
    </button>
  </div>

  <!-- Photo Grid -->
  {#if photos.length > 0}
    <div class="grid grid-cols-2 gap-3">
      {#each photos as photo (photo.id)}
        <div class="relative group">
          <img
            src={photo.url || "/placeholder.svg?height=128&width=128&query=baby photo"}
            alt={photo.name}
            class="w-full h-32 object-cover rounded-2xl shadow-md"
          />
          <button
            onclick={() => removePhoto(photo.id)}
            class="absolute top-2 right-2 bg-red-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            ×
          </button>
          <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 rounded-b-2xl">
            {photo.timestamp}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-center text-gray-500 py-8">
      <span class="text-4xl mb-2 block">👶</span>
      <p>아직...</p>
    </div>
  {/if}
</div>
