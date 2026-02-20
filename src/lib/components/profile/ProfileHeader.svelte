<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    displayName,
    displayEmail,
    displayAvatar,
    displayInitials,
    isProfileLoading
  } from '$lib/stores/profile';

  const dispatch = createEventDispatcher<{ editProfile: void }>();
</script>

<section class="rounded-2xl border border-neutral-700 bg-neutral-800/80 p-4 shadow-soft backdrop-blur-md transition hover:-translate-y-0.5">
  <div class="flex items-start justify-between gap-3">
    <div class="flex items-center gap-3">
      {#if $isProfileLoading}
        <!-- Skeleton avatar -->
        <div class="h-14 w-14 animate-pulse rounded-full bg-neutral-700"></div>
        <div class="space-y-2">
          <div class="h-4 w-24 animate-pulse rounded bg-neutral-700"></div>
          <div class="h-3 w-32 animate-pulse rounded bg-neutral-700"></div>
        </div>
      {:else}
        <!-- Avatar -->
        {#if $displayAvatar}
          <img
            src={$displayAvatar}
            alt={$displayName}
            class="h-14 w-14 rounded-full border border-neutral-600 object-cover shadow-md"
          />
        {:else}
          <div
            class="grid h-14 w-14 place-items-center rounded-full border border-neutral-600 bg-gradient-to-br from-orange-500/20 to-amber-600/20 text-lg font-semibold text-white shadow-md"
          >
            {$displayInitials}
          </div>
        {/if}

        <!-- Info -->
        <div>
          <h2 class="text-lg font-semibold text-white">{$displayName}</h2>
          <p class="text-sm text-neutral-400">{$displayEmail}</p>
        </div>
      {/if}
    </div>

    <button
      type="button"
      class="rounded-xl border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-xs font-medium text-neutral-200 transition hover:border-orange-500/50 hover:text-orange-300 active:scale-95"
      on:click={() => dispatch('editProfile')}
    >
      Edit Profile
    </button>
  </div>
</section>
