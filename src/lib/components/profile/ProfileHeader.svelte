<script lang="ts">
  export let name = 'Naman Jain';
  export let email = 'naman.jain@example.com';
</script>

<section class="rounded-2xl border border-neutral-700 bg-neutral-800/80 p-4 shadow-soft backdrop-blur-md transition hover:-translate-y-0.5">
  <div class="flex items-start justify-between gap-3">
    <div class="flex items-center gap-3">
      <div class="grid h-14 w-14 place-items-center rounded-full border border-neutral-600 bg-neutral-900 text-lg font-semibold text-white">
        NJ
      </div>
      <div>
        <h2 class="text-lg font-semibold text-white">{name}</h2>
        <p class="text-sm text-neutral-400">{email}</p>
      </div>
    </div>

    <button
      type="button"
      class="rounded-xl border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-xs font-medium text-neutral-200 transition hover:border-neutral-500 active:scale-95"
    >
      Edit Profile
    </button>
  </div>
</section>
