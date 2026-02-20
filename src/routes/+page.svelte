<script lang="ts">
  import { onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import AddTaskModal from '$lib/components/AddTaskModal.svelte';
  import Header from '$lib/components/Header.svelte';
  import TaskGroup from '$lib/components/TaskGroup.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import FloatingAddButton from '$lib/components/FloatingAddButton.svelte';
  import { tasks, type NewTaskInput } from '$lib/stores/tasks';

  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'long'
  }).format(new Date());

  let showModal = false;
  let toastVisible = false;
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  const handleAddTask = (event: CustomEvent<NewTaskInput>) => {
    tasks.add(event.detail);
    showModal = false;
    toastVisible = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastVisible = false;
    }, 1800);
  };

  onDestroy(() => {
    if (toastTimer) clearTimeout(toastTimer);
  });

  $: overdue = $tasks.filter((task) => task.group === 'overdue');
  $: today = $tasks.filter((task) => task.group === 'today');
  $: upcoming = $tasks.filter((task) => task.group === 'upcoming');
</script>

<Header title="My Day" {dateLabel} />

<div class="space-y-6">
  <TaskGroup title="Overdue" tasks={overdue} />
  <TaskGroup title="Today" tasks={today} />
  <TaskGroup title="Upcoming" tasks={upcoming} startOpen={false} />
</div>

<FloatingAddButton on:click={() => (showModal = true)} />
<BottomNav />

{#if showModal}
  <AddTaskModal on:close={() => (showModal = false)} on:addTask={handleAddTask} />
{/if}

{#if toastVisible}
  <div
    class="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-neutral-700 bg-neutral-900/95 px-4 py-2 text-sm text-neutral-100 shadow-soft"
    transition:fade={{ duration: 150 }}
  >
    Task added
  </div>
{/if}
