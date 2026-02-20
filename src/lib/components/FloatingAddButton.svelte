<script lang="ts">
  import { tasks } from '$lib/stores/tasks';

  const addTask = () => {
    const title = window.prompt('Task title');
    if (title) tasks.add(title);
  };
</script>

<button
  type="button"
  class="fixed bottom-24 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-2xl text-white shadow-soft transition hover:bg-neutral-700 active:scale-95"
  aria-label="Add task"
  on:click={addTask}
>
  +
</button>
