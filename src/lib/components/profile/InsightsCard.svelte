<script lang="ts">
  export let streak = 0;
  export let mostProductiveDay = 'N/A';
  export let averageCompletionTime = '0h 0m';
  export let productivityScore = 0;
  export let loading = false;
</script>

<section class="rounded-2xl border border-neutral-700 bg-neutral-800/80 p-4 shadow-soft backdrop-blur-md transition hover:-translate-y-0.5">
  <h3 class="mb-4 text-sm font-semibold text-white">Productivity Insights</h3>

  {#if loading}
    <div class="space-y-3 animate-pulse">
      <div class="h-5 w-full rounded bg-neutral-700"></div>
      <div class="h-5 w-full rounded bg-neutral-700"></div>
      <div class="h-5 w-full rounded bg-neutral-700"></div>
    </div>
  {:else}
    <ul class="space-y-3 text-sm text-neutral-300">
      <li class="flex items-center justify-between">
        <span>Current streak</span>
        <strong class="text-orange-400">{streak} days</strong>
      </li>
      <li class="flex items-center justify-between">
        <span>Most productive day</span>
        <strong class="text-orange-400">{mostProductiveDay}</strong>
      </li>
      <li class="flex items-center justify-between">
        <span>Average completion time</span>
        <strong class="text-orange-400">{averageCompletionTime}</strong>
      </li>
      <li class="flex items-center justify-between border-t border-neutral-700 pt-3">
        <span>Productivity score</span>
        <strong class="text-orange-400">{productivityScore}%</strong>
      </li>
    </ul>
  {/if}
</section>
