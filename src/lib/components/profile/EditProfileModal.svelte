<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { scale, fade } from 'svelte/transition';
  import {
    profile,
    displayName,
    displayEmail,
    displayAvatar,
    displayInitials,
    isProfileSaving
  } from '$lib/stores/profile';

  const dispatch = createEventDispatcher<{ close: void }>();

  let name = '';
  let previewUrl = '';
  let fileInput: HTMLInputElement;
  let nameInput: HTMLInputElement;
  let selectedFile: File | null = null;
  let saving = false;
  let savedToast = false;
  let dragOver = false;

  // Initialize from current profile
  onMount(async () => {
    await tick();
    name = $displayName;
    previewUrl = $displayAvatar;
    nameInput?.focus();
  });

  const close = () => {
    if (saving) return;
    dispatch('close');
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };

  const onOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) close();
  };

  const handleFileSelect = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      processFile(input.files[0]);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    dragOver = false;
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    dragOver = true;
  };

  const handleDragLeave = () => {
    dragOver = false;
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5 MB');
      return;
    }
    selectedFile = file;
    previewUrl = URL.createObjectURL(file);
  };

  const removeAvatar = () => {
    selectedFile = null;
    previewUrl = '';
  };

  const submit = async () => {
    if (saving) return;
    saving = true;

    try {
      // Update name if changed
      const trimmedName = name.trim();
      if (trimmedName && trimmedName !== $displayName) {
        await profile.updateName(trimmedName);
      }

      // Upload and update avatar if a new file was selected
      if (selectedFile) {
        await profile.changeAvatar(selectedFile);
      } else if (previewUrl === '' && $displayAvatar !== '') {
        // Avatar was removed
        await profile.updateAvatar('');
      }

      savedToast = true;
      setTimeout(() => {
        dispatch('close');
      }, 800);
    } catch (e) {
      console.error('Save profile error:', e);
    } finally {
      saving = false;
    }
  };
</script>

<svelte:window on:keydown={onKeyDown} />

<div
  class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
  on:click={onOverlayClick}
  transition:fade={{ duration: 150 }}
>
  <section
    class="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900 p-6 shadow-xl"
    in:scale={{ start: 0.95, duration: 200 }}
    out:scale={{ start: 0.95, duration: 150 }}
  >
    <!-- Header -->
    <header class="mb-6">
      <h2 class="text-xl font-semibold text-white">Edit Profile</h2>
      <p class="mt-1 text-sm text-neutral-400">Update your photo and personal info.</p>
    </header>

    <form class="space-y-6" on:submit|preventDefault={submit}>

      <!-- Avatar Section -->
      <div class="flex flex-col items-center gap-4">
        <!-- Avatar Preview -->
        <div class="relative group">
          <button
            type="button"
            class="relative h-24 w-24 overflow-hidden rounded-full border-2 transition
              {dragOver
                ? 'border-orange-400 ring-4 ring-orange-500/20'
                : 'border-neutral-600 hover:border-neutral-500'}
              focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            on:click={() => fileInput?.click()}
            on:drop={handleDrop}
            on:dragover={handleDragOver}
            on:dragleave={handleDragLeave}
            aria-label="Change avatar"
          >
            {#if previewUrl}
              <img
                src={previewUrl}
                alt="Avatar preview"
                class="h-full w-full object-cover"
              />
            {:else}
              <div class="flex h-full w-full items-center justify-center bg-neutral-800 text-2xl font-bold text-white">
                {$displayInitials}
              </div>
            {/if}

            <!-- Hover Overlay -->
            <div class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
              <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke-width="1.5"/>
              </svg>
            </div>
          </button>

          <!-- Remove button -->
          {#if previewUrl}
            <button
              type="button"
              class="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-600 bg-neutral-800 text-xs text-neutral-300 transition hover:bg-red-600 hover:text-white active:scale-90"
              on:click|stopPropagation={removeAvatar}
              aria-label="Remove avatar"
            >
              ✕
            </button>
          {/if}
        </div>

        <!-- Upload Hint -->
        <p class="text-center text-xs text-neutral-500">
          Click to upload or drag & drop · JPG, PNG · Max 5 MB
        </p>

        <input
          bind:this={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          class="hidden"
          on:change={handleFileSelect}
        />
      </div>

      <!-- Name Field -->
      <div class="space-y-2">
        <label class="text-xs font-medium uppercase tracking-wide text-neutral-400" for="profile-name">
          Display Name
        </label>
        <input
          id="profile-name"
          bind:this={nameInput}
          bind:value={name}
          class="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500"
          maxlength="60"
          placeholder="Your name"
          required
        />
      </div>

      <!-- Email (Read-only) -->
      <div class="space-y-2">
        <label class="text-xs font-medium uppercase tracking-wide text-neutral-400" for="profile-email">
          Email
        </label>
        <input
          id="profile-email"
          value={$displayEmail}
          class="w-full cursor-not-allowed rounded-xl border border-neutral-700/50 bg-neutral-800/50 px-3 py-2.5 text-sm text-neutral-500 outline-none"
          disabled
        />
        <p class="text-[10px] text-neutral-600">Email cannot be changed here.</p>
      </div>

      <div class="border-t border-neutral-700 pt-4"></div>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="rounded-xl border border-neutral-600 px-4 py-2 text-sm text-neutral-200 transition hover:border-neutral-400 active:scale-95"
          on:click={close}
        >
          Cancel
        </button>
        <button
          type="submit"
          class="inline-flex min-w-[120px] items-center justify-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-80"
          disabled={saving}
        >
          {#if saving}
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
          {:else if savedToast}
            <svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 6 9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="ml-1.5">Saved!</span>
          {:else}
            Save Changes
          {/if}
        </button>
      </div>
    </form>
  </section>
</div>
