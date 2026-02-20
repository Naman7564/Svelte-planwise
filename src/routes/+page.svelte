<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import TaskGroup from '$lib/components/TaskGroup.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import FloatingAddButton from '$lib/components/FloatingAddButton.svelte';
  import { tasks } from '$lib/stores/tasks';

  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'long'
  }).format(new Date());

  $: overdue = $tasks.filter((task) => task.group === 'overdue');
  $: today = $tasks.filter((task) => task.group === 'today');
</script>

<Header title="My Day" {dateLabel} />

<div class="space-y-6">
  <TaskGroup title="Overdue" tasks={overdue} />
  <TaskGroup title="Today" tasks={today} />
</div>

<FloatingAddButton />
<BottomNav />
