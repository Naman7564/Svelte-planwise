<script lang="ts">
  import { onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import Header from '$lib/components/Header.svelte';
  import CalendarTimeline from '$lib/components/CalendarTimeline.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import FloatingAddButton from '$lib/components/FloatingAddButton.svelte';
  import AddTaskModal from '$lib/components/AddTaskModal.svelte';
  import AddEventModal from '$lib/components/AddEventModal.svelte';
  import { tasks, type NewTaskInput } from '$lib/stores/tasks';
  import { events } from '$lib/stores/events';

  let mode: 'Week' | 'Day' = 'Day';
  let selectedDate = new Date();
  let showAddMenu = false;
  let showTaskModal = false;
  let showEventModal = false;
  let toastVisible = false;
  let toastMessage = '';
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  const formatDateLabel = (d: Date) =>
    new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'long'
    }).format(d);

  const formatISODate = (d: Date) => d.toISOString().slice(0, 10);

  $: dateLabel = formatDateLabel(selectedDate);
  $: isoDate = formatISODate(selectedDate);

  const goToPrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    selectedDate = d;
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    selectedDate = d;
  };

  const goToToday = () => {
    selectedDate = new Date();
  };

  const showToast = (msg: string) => {
    toastMessage = msg;
    toastVisible = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastVisible = false;
    }, 1800);
  };

  const handleAddTask = (event: CustomEvent<NewTaskInput>) => {
    // Override the due date to the selected calendar date
    const input = { ...event.detail, dueDate: isoDate };
    tasks.add(input);
    showTaskModal = false;
    showToast('Task added to calendar');
  };

  const handleAddEvent = (event: CustomEvent<{
    title: string;
    date: string;
    startHour: number;
    endHour: number;
    tag?: string;
  }>) => {
    events.add(event.detail);
    showEventModal = false;
    showToast('Event added');
  };

  const handleFabClick = () => {
    showAddMenu = !showAddMenu;
  };

  const openTaskModal = () => {
    showAddMenu = false;
    showTaskModal = true;
  };

  const openEventModal = () => {
    showAddMenu = false;
    showEventModal = true;
  };

  const isToday = (d: Date) => {
    const now = new Date();
    return d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
  };

  onDestroy(() => {
    if (toastTimer) clearTimeout(toastTimer);
  });
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
      {#if !isToday(selectedDate)}
        <button
          type="button"
          class="rounded-lg border border-neutral-700 px-2.5 py-1.5 text-xs text-neutral-300 transition hover:text-white hover:border-neutral-500 active:scale-95"
          on:click={goToToday}
        >
          Today
        </button>
      {/if}
      <button type="button" class="rounded-lg border border-neutral-700 p-2 text-neutral-300 transition hover:text-white active:scale-95" aria-label="Previous date" on:click={goToPrevDay}>
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m15 18-6-6 6-6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button type="button" class="rounded-lg border border-neutral-700 p-2 text-neutral-300 transition hover:text-white active:scale-95" aria-label="Next date" on:click={goToNextDay}>
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m9 18 6-6-6-6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
  </div>

  <CalendarTimeline selectedDate={isoDate} />
</section>

<!-- FAB with context menu -->
<div class="fixed bottom-24 right-6 z-30">
  {#if showAddMenu}
    <div class="mb-3 flex flex-col gap-2" transition:fade={{ duration: 120 }}>
      <button
        type="button"
        class="flex items-center gap-2.5 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white shadow-soft transition hover:bg-neutral-700 active:scale-95"
        on:click={openEventModal}
      >
        <svg class="h-4 w-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        New Event
      </button>

      <button
        type="button"
        class="flex items-center gap-2.5 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white shadow-soft transition hover:bg-neutral-700 active:scale-95"
        on:click={openTaskModal}
      >
        <svg class="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="m9 14 2 2 4-4" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        New Task
      </button>
    </div>
  {/if}

  <button
    type="button"
    class="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-2xl text-white shadow-soft transition hover:bg-neutral-700 active:scale-95 {showAddMenu ? 'rotate-45' : ''}"
    aria-label="Add item"
    on:click={handleFabClick}
  >
    +
  </button>
</div>

<BottomNav />

{#if showTaskModal}
  <AddTaskModal on:close={() => (showTaskModal = false)} on:addTask={handleAddTask} />
{/if}

{#if showEventModal}
  <AddEventModal on:close={() => (showEventModal = false)} on:addEvent={handleAddEvent} />
{/if}

{#if toastVisible}
  <div
    class="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-neutral-700 bg-neutral-900/95 px-4 py-2 text-sm text-neutral-100 shadow-soft"
    transition:fade={{ duration: 150 }}
  >
    {toastMessage}
  </div>
{/if}
