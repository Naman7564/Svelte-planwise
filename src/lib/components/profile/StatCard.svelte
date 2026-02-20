<script lang="ts">
  export let title: string;
  export let value: number;
  export let icon = '•';
  export let loading = false;
</script>

<article class="rounded-2xl border border-neutral-700 bg-neutral-800 p-4 shadow-soft transition duration-200 hover:-translate-y-1 hover:border-neutral-600">
  {#if loading}
    <div class="animate-pulse">
      <div class="mb-3 h-5 w-5 rounded bg-neutral-700"></div>
      <div class="h-7 w-16 rounded bg-neutral-700"></div>
      <div class="mt-2 h-3 w-24 rounded bg-neutral-700"></div>
    </div>
  {:else}
    <p class="text-lg leading-none text-neutral-400">{icon}</p>
    <p class="mt-3 text-2xl font-semibold text-white">{value}</p>
    <p class="mt-1 text-xs uppercase tracking-wide text-neutral-400">{title}</p>
  {/if}
</article>
