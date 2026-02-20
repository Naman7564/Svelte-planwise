<script lang="ts">
  import EventCard from '$lib/components/EventCard.svelte';
  import { events } from '$lib/stores/events';

  export let startHour = 11;
  export let endHour = 21;

  const hourHeight = 76;

  const timeLabel = (hour24: number) => {
    const suffix = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${hour12.toString().padStart(2, '0')} ${suffix}`;
  };

  $: hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
</script>

<section class="relative mt-4 rounded-2xl border border-neutral-700 bg-neutral-900/70 p-3">
  <div class="relative">
    {#each hours as hour}
      <div class="flex h-[76px] items-start gap-3 border-t border-neutral-800 pt-1 first:border-t-0">
        <span class="w-10 text-[10px] uppercase tracking-wide text-neutral-500">{timeLabel(hour)}</span>
        <div class="mt-2 h-px flex-1 bg-neutral-800"></div>
      </div>
    {/each}

    {#each $events as event (event.id)}
      <EventCard
        {event}
        top={(event.startHour - startHour) * hourHeight + 8}
        height={(event.endHour - event.startHour) * hourHeight - 10}
      />
    {/each}
  </div>
</section>
