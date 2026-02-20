<script lang="ts">
  import { flip } from 'svelte/animate';
  import { slide } from 'svelte/transition';
  import TaskCard from '$lib/components/TaskCard.svelte';
  import type { Task } from '$lib/types';

  export let title: string;
  export let tasks: Task[];
  export let startOpen = true;

  let open = startOpen;
</script>

<section class="space-y-3">
  <button
    type="button"
    class="flex w-full items-center justify-between text-left"
    on:click={() => (open = !open)}
    aria-expanded={open}
  >
    <h2 class="text-lg font-semibold text-white">{title}</h2>
    <svg class="h-4 w-4 text-neutral-300 transition {open ? 'rotate-180' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="m6 9 6 6 6-6" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>

  {#if open}
    <div class="space-y-3" transition:slide>
      {#if tasks.length === 0}
        <p class="rounded-2xl border border-dashed border-neutral-700 bg-neutral-800/40 p-4 text-sm text-neutral-400">
          No tasks in this section.
        </p>
      {:else}
        {#each tasks as task (task.id)}
          <div animate:flip>
            <TaskCard {task} />
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</section>
