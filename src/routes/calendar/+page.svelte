<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import CalendarTimeline from '$lib/components/CalendarTimeline.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';

  let mode: 'Week' | 'Day' = 'Day';
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'long'
  }).format(new Date());
</script>

<Header title="Calendar" {dateLabel} />

<section class="rounded-2xl border border-neutral-700 bg-neutral-800/60 p-3 shadow-soft">
  <div class="flex items-center justify-between">
    <div class="inline-flex rounded-xl border border-neutral-700 p-1 text-sm">
      {#each ['Week', 'Day'] as option}
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 transition active:scale-95 {mode === option ? 'bg-neutral-700 text-white' : 'text-neutral-400'}"
          on:click={() => (mode = option as 'Week' | 'Day')}
        >
          {option}
        </button>
      {/each}
    </div>

    <div class="flex items-center gap-2">
      <button type="button" class="rounded-lg border border-neutral-700 p-2 text-neutral-300 transition hover:text-white active:scale-95" aria-label="Previous date">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m15 18-6-6 6-6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button type="button" class="rounded-lg border border-neutral-700 p-2 text-neutral-300 transition hover:text-white active:scale-95" aria-label="Next date">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m9 18 6-6-6-6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
  </div>

  <CalendarTimeline />
</section>

<section class="mt-4 rounded-2xl border border-neutral-700 bg-neutral-900/80 p-3 shadow-soft">
  <p class="mb-2 text-xs uppercase tracking-wide text-neutral-400">Quick tasks</p>
  <div class="flex gap-2 overflow-x-auto pb-1 text-sm">
    <button type="button" class="whitespace-nowrap rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-neutral-200 transition active:scale-95">Continue Coding</button>
    <button type="button" class="whitespace-nowrap rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-neutral-200 transition active:scale-95">Email Back Mrs James</button>
    <button type="button" class="whitespace-nowrap rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-neutral-200 transition active:scale-95">Design Review</button>
  </div>
</section>

<BottomNav />
