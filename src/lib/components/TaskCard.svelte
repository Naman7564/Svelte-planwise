<script lang="ts">
  import { fly, slide } from 'svelte/transition';
  import Checkbox from '$lib/components/Checkbox.svelte';
  import { tasks } from '$lib/stores/tasks';
  import type { Task } from '$lib/types';

  export let task: Task;

  const formatDueDate = (value?: string) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(parsed);
  };
</script>

<article
  class="rounded-2xl border border-neutral-700 bg-neutral-800 p-4 shadow-soft transition hover:border-neutral-600 hover:bg-neutral-800/90"
  in:fly={{ y: 8, duration: 180 }}
>
  <div class="flex items-start gap-3">
    <Checkbox checked={task.completed} onToggle={() => tasks.toggleComplete(task.id)} />
    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-3">
        <h3 class="truncate text-[15px] font-medium {task.completed ? 'text-neutral-500 line-through' : 'text-white'}">
          {task.title}
        </h3>
        <button
          type="button"
          class="text-neutral-400 transition hover:text-white active:scale-95"
          aria-label="Toggle details"
          on:click={() => tasks.toggleExpanded(task.id)}
        >
          <svg class="h-4 w-4 transition {task.expanded ? 'rotate-180' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="m6 9 6 6 6-6" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      {#if task.description}
        <p class="mt-1 text-xs leading-5 text-neutral-400">{task.description}</p>
      {/if}

      <div class="mt-2 flex items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <span class="font-medium {task.tag === 'Yesterday' || task.tag === 'Overdue' ? 'text-red-400' : task.tag === 'Upcoming' ? 'text-sky-400' : 'text-neutral-400'}">
            {task.tag}
          </span>
          {#if task.priority}
            <span class="rounded-full px-2 py-0.5 {task.priority === 'High' ? 'bg-red-400/15 text-red-300' : task.priority === 'Low' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-yellow-400/15 text-yellow-300'}">
              {task.priority}
            </span>
          {/if}
          {#if task.dueDate}
            <span class="text-neutral-500">{formatDueDate(task.dueDate)}</span>
          {/if}
          <span class="text-neutral-500">Tasks</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="text-neutral-500 transition hover:text-red-400 active:scale-95"
            aria-label="Delete task"
            on:click={() => tasks.remove(task.id)}
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 6h18M8 6V4h8v2m-9 0v14h10V6" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {#if task.expanded && task.subtasks.length > 0}
        <ul class="mt-3 space-y-2 border-t border-neutral-700 pt-3" transition:slide>
          {#each task.subtasks as subtask}
            <li class="flex items-center gap-2 text-xs text-neutral-300">
              <button
                type="button"
                class="h-4 w-4 rounded-full border border-neutral-500 text-[10px] leading-none transition active:scale-95"
                on:click={() => tasks.toggleSubtask(task.id, subtask.id)}
              >
                {subtask.done ? 'x' : ''}
              </button>
              <span class={subtask.done ? 'text-neutral-500 line-through' : ''}>{subtask.title}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</article>
