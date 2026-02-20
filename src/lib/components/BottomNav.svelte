<script lang="ts">
  import { page } from '$app/stores';

  const tabs = [
    { label: 'My Day', href: '/' },
    { label: 'Calendar', href: '/calendar' },
    { label: 'All', href: '/all' }
  ];
</script>

<nav class="fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] max-w-[380px] -translate-x-1/2 rounded-2xl border border-neutral-700 bg-neutral-900/95 p-3 shadow-soft backdrop-blur">
  <ul class="grid grid-cols-3 gap-2 text-center text-xs">
    {#each tabs as tab}
      <li>
        <a
          class="block rounded-xl px-2 py-2 transition active:scale-95 {$page.url.pathname === tab.href ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-800/70 hover:text-white'}"
          href={tab.href}
        >
          {tab.label}
        </a>
      </li>
    {/each}
  </ul>
</nav>
