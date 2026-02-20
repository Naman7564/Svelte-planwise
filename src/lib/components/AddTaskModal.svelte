<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { scale } from 'svelte/transition';
  import type { TaskPriority } from '$lib/types';
  import type { NewTaskInput } from '$lib/stores/tasks';

  const dispatch = createEventDispatcher<{
    close: void;
    addTask: NewTaskInput;
  }>();

  let title = '';
  let description = '';
  let dueDate = new Date().toISOString().slice(0, 10);
  let priority: TaskPriority = 'Medium';
  let starred = false;
  let submitting = false;
  let titleInput: HTMLInputElement | null = null;

  const maxDescription = 280;

  const close = () => {
    if (submitting) return;
    dispatch('close');
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close();
  };

  const onOverlayClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) close();
  };

  const submit = async () => {
    if (submitting || !title.trim()) return;
    submitting = true;

    await new Promise((resolve) => setTimeout(resolve, 500));

    dispatch('addTask', {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      starred
    });
    dispatch('close');
  };

  const priorityClass = (value: TaskPriority) => {
    if (value === 'Low') return 'bg-emerald-400';
    if (value === 'High') return 'bg-red-400';
    return 'bg-yellow-400';
  };

  onMount(async () => {
    await tick();
    titleInput?.focus();
  });
</script>

<svelte:window on:keydown={onKeyDown} />

<div
  class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
  on:click={onOverlayClick}
>
  <section
    class="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900 p-6 shadow-xl transition duration-200 ease-out"
    in:scale={{ start: 0.95, duration: 200 }}
    out:scale={{ start: 0.95, duration: 150 }}
  >
    <header class="mb-5">
      <h2 class="text-xl font-semibold text-white">Add New Task</h2>
      <p class="mt-1 text-sm text-neutral-400">Capture details and schedule it right away.</p>
    </header>

    <form class="space-y-4" on:submit|preventDefault={submit}>
      <div class="space-y-2">
        <label class="text-xs font-medium uppercase tracking-wide text-neutral-400" for="task-title">Task Title</label>
        <input
          id="task-title"
          bind:this={titleInput}
          bind:value={title}
          class="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500"
          maxlength="90"
          placeholder="Enter task title"
          required
        />
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium uppercase tracking-wide text-neutral-400" for="task-description">Description</label>
          <span class="text-xs text-neutral-500">{description.length}/{maxDescription}</span>
        </div>
        <textarea
          id="task-description"
          bind:value={description}
          rows="4"
          maxlength={maxDescription}
          class="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500"
          placeholder="Add context or next steps"
        ></textarea>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <label class="text-xs font-medium uppercase tracking-wide text-neutral-400" for="task-due-date">Due Date</label>
          <input
            id="task-due-date"
            type="date"
            bind:value={dueDate}
            class="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500"
          />
        </div>

        <div class="space-y-2">
          <label class="text-xs font-medium uppercase tracking-wide text-neutral-400" for="task-priority">Priority</label>
          <div class="relative">
            <span class={`absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full ${priorityClass(priority)}`}></span>
            <select
              id="task-priority"
              bind:value={priority}
              class="w-full appearance-none rounded-xl border border-neutral-700 bg-neutral-800 py-2.5 pl-8 pr-8 text-sm text-white outline-none transition focus:border-orange-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">v</span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between rounded-xl border border-neutral-700 bg-neutral-800/60 px-3 py-2.5">
        <span class="text-sm text-neutral-200">Star task</span>
        <button
          type="button"
          role="switch"
          aria-checked={starred}
          class={`h-6 w-11 rounded-full border border-neutral-600 p-1 transition ${starred ? 'bg-orange-500' : 'bg-neutral-700'}`}
          on:click={() => (starred = !starred)}
        >
          <span class={`block h-4 w-4 rounded-full bg-white transition ${starred ? 'translate-x-5' : ''}`}></span>
        </button>
      </div>

      <div class="border-t border-neutral-700 pt-4"></div>

      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="rounded-xl border border-neutral-600 px-4 py-2 text-sm text-neutral-200 transition hover:border-neutral-400 active:scale-95"
          on:click={close}
        >
          Cancel
        </button>
        <button
          type="submit"
          class="inline-flex min-w-[108px] items-center justify-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-80"
          disabled={submitting}
        >
          {#if submitting}
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
          {:else}
            Add Task
          {/if}
        </button>
      </div>
    </form>
  </section>
</div>
