<script lang="ts">
  export let checked = false;
  export let onToggle: () => void;
</script>

<button
  type="button"
  class="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-500 transition hover:border-neutral-300 active:scale-95"
  aria-label="Toggle complete"
  on:click={onToggle}
>
  {#if checked}
    <span class="h-2.5 w-2.5 rounded-full bg-orange-400"></span>
  {/if}
</button>
