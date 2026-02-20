<script lang="ts">
  export let starred = false;
  export let onToggle: () => void;
</script>

<button
  type="button"
  class="transition active:scale-95 {starred ? 'text-orange-400' : 'text-neutral-400 hover:text-orange-400'}"
  aria-label="Toggle star"
  on:click={onToggle}
>
  <svg viewBox="0 0 24 24" fill={starred ? 'currentColor' : 'none'} stroke="currentColor" class="h-5 w-5">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.1 5.37a.56.56 0 0 0 .48.35l5.74.4c.5.03.7.66.32.97l-4.38 3.68a.56.56 0 0 0-.18.57l1.39 5.55c.12.48-.4.86-.82.6l-4.86-3.03a.56.56 0 0 0-.6 0l-4.86 3.03c-.42.26-.94-.12-.82-.6l1.39-5.55a.56.56 0 0 0-.18-.57L2.36 10.6a.56.56 0 0 1 .32-.97l5.74-.4a.56.56 0 0 0 .48-.35l2.1-5.37Z"/>
  </svg>
</button>
