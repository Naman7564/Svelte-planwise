<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import '../app.css';
  import {
    initSession,
    isAuthenticated,
    loading as authLoading,
    user
  } from '$lib/stores/auth';
  import { tasks } from '$lib/stores/tasks';
  import { events } from '$lib/stores/events';
  import { connectRealtime, disconnectRealtime } from '$lib/stores/realtime';

  let initialized = false;

  onMount(async () => {
    await initSession();
    initialized = true;
  });

  // When auth state changes: load data or redirect
  $: if (initialized && !$authLoading) {
    if ($isAuthenticated) {
      // Load data once authenticated
      tasks.load();
      events.load();
      connectRealtime();

      // If on /auth, redirect to home
      if ($page.url.pathname === '/auth') {
        goto('/', { replaceState: true });
      }
    } else {
      // Clear data and redirect to auth
      tasks.clear();
      events.clear();
      disconnectRealtime();

      if ($page.url.pathname !== '/auth') {
        goto('/auth', { replaceState: true });
      }
    }
  }

  onDestroy(() => {
    disconnectRealtime();
  });
</script>

{#if !initialized || $authLoading}
  <!-- Splash / loading screen -->
  <div class="flex min-h-screen items-center justify-center bg-neutral-950">
    <div class="text-center">
      <div class="mx-auto mb-4 grid h-16 w-16 animate-pulse place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-3xl font-bold text-white shadow-lg shadow-orange-500/25">
        P
      </div>
      <p class="text-sm text-neutral-400">Loading…</p>
    </div>
  </div>
{:else if $page.url.pathname === '/auth'}
  <!-- Auth page has its own full-screen layout -->
  <slot />
{:else}
  <!-- Main app layout -->
  <div class="mx-auto min-h-screen max-w-[420px] px-4 pb-28 pt-6">
    <slot />
  </div>
{/if}
