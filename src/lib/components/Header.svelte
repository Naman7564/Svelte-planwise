<script lang="ts">
  export let title: string;
  export let dateLabel: string;
</script>

<header class="mb-5 flex items-start justify-between gap-4">
  <div>
    <h1 class="text-3xl font-semibold tracking-tight text-white">{title}</h1>
    <p class="mt-1 text-lg font-medium text-neutral-200">{dateLabel}</p>
  </div>
  <button
    type="button"
    class="mt-1 rounded-xl border border-neutral-700 bg-neutral-800 p-2 text-neutral-300 transition hover:text-white active:scale-95"
    aria-label="Options"
  >
    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M6 12h.01M12 12h.01M18 12h.01" stroke-width="2" stroke-linecap="round" />
    </svg>
  </button>
</header>
