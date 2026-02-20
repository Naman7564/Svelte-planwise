<script lang="ts">
  import EventCard from '$lib/components/EventCard.svelte';
  import { events } from '$lib/stores/events';
  import { tasks } from '$lib/stores/tasks';
  import type { Task } from '$lib/types';

  export let startHour = 8;
  export let endHour = 21;
  export let selectedDate: string = new Date().toISOString().slice(0, 10);

  const hourHeight = 76;

  const timeLabel = (hour24: number) => {
    const suffix = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${hour12.toString().padStart(2, '0')} ${suffix}`;
  };

  $: hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  // Filter tasks that match the selected date and are not completed
  $: todayTasks = $tasks.filter((t: Task) => {
    if (!t.dueDate || t.completed) return false;
    return t.dueDate === selectedDate;
  });

  // Assign each task a 1-hour slot starting from 9 AM, stacking them
  const getTaskSlot = (index: number) => {
    const baseHour = 9;
    return {
      startHour: baseHour + index,
      endHour: baseHour + index + 1
    };
  };

  const priorityColor = (priority?: string) => {
    switch (priority) {
      case 'High':
        return 'border-red-500/60 bg-red-500/10 text-red-300';
      case 'Medium':
        return 'border-yellow-500/60 bg-yellow-500/10 text-yellow-300';
      case 'Low':
        return 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300';
      default:
        return 'border-violet-500/60 bg-violet-500/10 text-violet-300';
    }
  };

  const priorityDot = (priority?: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-400';
      case 'Medium':
        return 'bg-yellow-400';
      case 'Low':
        return 'bg-emerald-400';
      default:
        return 'bg-violet-400';
    }
  };
</script>

<section class="relative mt-4 rounded-2xl border border-neutral-700 bg-neutral-900/70 p-3">
  <div class="relative">
    {#each hours as hour}
      <div class="flex h-[76px] items-start gap-3 border-t border-neutral-800 pt-1 first:border-t-0">
        <span class="w-10 text-[10px] uppercase tracking-wide text-neutral-500">{timeLabel(hour)}</span>
        <div class="mt-2 h-px flex-1 bg-neutral-800"></div>
      </div>
    {/each}

    <!-- Events -->
    {#each $events as event (event.id)}
      <EventCard
        {event}
        top={(event.startHour - startHour) * hourHeight + 8}
        height={(event.endHour - event.startHour) * hourHeight - 10}
      />
    {/each}

    <!-- Tasks rendered on the calendar -->
    {#each todayTasks as task, i (task.id)}
      {@const slot = getTaskSlot(i)}
      <article
        class="absolute left-16 right-2 rounded-2xl border-2 border-dashed p-3 shadow-soft transition hover:brightness-110 {priorityColor(task.priority)}"
        style="top: {(slot.startHour - startHour) * hourHeight + 8}px; height: {Math.max((slot.endHour - slot.startHour) * hourHeight - 10, 60)}px;"
      >
        <div class="flex h-full flex-col justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full {priorityDot(task.priority)}"></span>
              <h3 class="truncate text-sm font-semibold">{task.title}</h3>
            </div>
            {#if task.description}
              <p class="mt-1 truncate text-[11px] opacity-70">{task.description}</p>
            {/if}
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-[10px] uppercase tracking-wider opacity-60">
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Task · {task.priority ?? 'Medium'}
            </div>
            {#if task.starred}
              <svg class="h-3.5 w-3.5 fill-amber-400 text-amber-400" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            {/if}
          </div>
        </div>
      </article>
    {/each}
  </div>
</section>
