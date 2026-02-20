<script lang="ts">
  import { fly } from 'svelte/transition';
  import type { WeeklyStat } from '$lib/stores/tasks';

  export let data: WeeklyStat[] = [];
  export let loading = false;

  $: maxValue = Math.max(1, ...data.map((item) => item.completed));
</script>

<section class="rounded-2xl border border-neutral-700 bg-neutral-800/80 p-4 shadow-soft backdrop-blur-md transition hover:-translate-y-0.5">
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-sm font-semibold text-white">Weekly Activity</h3>
    <p class="text-xs text-neutral-400">Completed Tasks</p>
  </div>

  {#if loading}
    <div class="grid grid-cols-7 items-end gap-2">
      {#each Array(7) as _, i}
        <div class="animate-pulse" style={`animation-delay:${i * 80}ms`}>
          <div class="h-20 rounded-md bg-neutral-700"></div>
          <div class="mx-auto mt-2 h-3 w-7 rounded bg-neutral-700"></div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="grid grid-cols-7 items-end gap-2">
      {#each data as item, i}
        <div class="text-center" in:fly={{ y: 8, duration: 220, delay: i * 35 }}>
          <div class="relative h-24 rounded-xl bg-neutral-900/70 p-1">
            <div class="absolute inset-x-1 bottom-1 rounded-md bg-orange-400/90 transition-all duration-500" style={`height:${Math.max(10, (item.completed / maxValue) * 100)}%`}></div>
          </div>
          <p class="mt-2 text-[11px] text-neutral-400">{item.day}</p>
          <p class="text-[11px] text-neutral-200">{item.completed}</p>
        </div>
      {/each}
    </div>
  {/if}
</section>
