<script lang="ts">
  import StarButton from '$lib/components/StarButton.svelte';
  import { events } from '$lib/stores/events';
  import type { EventItem } from '$lib/types';

  export let event: EventItem;
  export let top = 0;
  export let height = 0;
</script>

<article
  class="absolute left-16 right-2 rounded-2xl border border-neutral-700 bg-neutral-800 p-3 shadow-soft transition hover:border-neutral-600"
  style={`top: ${top}px; height: ${Math.max(height, 60)}px;`}
>
  <div class="flex h-full flex-col justify-between">
    <div>
      <h3 class="text-sm font-semibold text-white">{event.title}</h3>
      <p class="mt-1 text-[11px] text-emerald-400">{event.tag}</p>
    </div>
    <div class="flex items-center justify-between">
      <p class="text-xs text-neutral-300">{event.startHour % 12 || 12}{event.startHour >= 12 ? 'PM' : 'AM'} - {event.endHour % 12 || 12}{event.endHour >= 12 ? 'PM' : 'AM'}</p>
      <StarButton starred={event.starred} onToggle={() => events.toggleStar(event.id)} />
    </div>
  </div>
</article>
