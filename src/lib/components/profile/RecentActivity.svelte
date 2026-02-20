<script lang="ts">
  import type { RecentActivityItem } from '$lib/stores/tasks';

  export let items: RecentActivityItem[] = [];
  export let loading = false;

  const labelMap = {
    completed: { icon: '&#10004;', title: 'Completed' },
    starred: { icon: '&#11088;', title: 'Starred' },
    added: { icon: '&#10133;', title: 'Added' }
  };

  const formatAgo = (timestamp: number) => {
    const diffMinutes = Math.max(1, Math.floor((Date.now() - timestamp) / (1000 * 60)));
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}h ago`;
  };
</script>

<section class="rounded-2xl border border-neutral-700 bg-neutral-800/80 p-4 shadow-soft backdrop-blur-md transition hover:-translate-y-0.5">
  <h3 class="mb-4 text-sm font-semibold text-white">Recent Activity</h3>

  {#if loading}
    <div class="space-y-2 animate-pulse">
      {#each Array(3) as _}
        <div class="h-9 rounded-lg bg-neutral-700"></div>
      {/each}
    </div>
  {:else if items.length === 0}
    <p class="text-sm text-neutral-400">No recent updates yet.</p>
  {:else}
    <ul class="space-y-2 text-sm">
      {#each items as item (item.id)}
        <li class="flex items-center justify-between rounded-xl border border-neutral-700/80 bg-neutral-900/65 px-3 py-2 text-neutral-300">
          <p>
            <span class="mr-2">{@html labelMap[item.type].icon}</span>
            <span>{labelMap[item.type].title} "{item.taskTitle}"</span>
          </p>
          <span class="text-xs text-neutral-500">{formatAgo(item.timestamp)}</span>
        </li>
      {/each}
    </ul>
  {/if}
</section>
