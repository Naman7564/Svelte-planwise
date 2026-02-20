<script lang="ts">
  import { goto } from '$app/navigation';
  import { signOut } from '$lib/stores/auth';

  let darkMode = true;
  let notifications = true;

  async function handleLogout() {
    await signOut();
    goto('/auth', { replaceState: true });
  }
</script>

<section class="rounded-2xl border border-neutral-700 bg-neutral-800/80 p-4 shadow-soft backdrop-blur-md transition hover:-translate-y-0.5">
  <h3 class="mb-4 text-sm font-semibold text-white">Account Settings</h3>

  <div class="space-y-3 text-sm">
    <div class="rounded-xl border border-neutral-700 bg-neutral-900/70 p-3">
      <p class="text-neutral-300">Preferences</p>
      <div class="mt-3 space-y-2">
        <label class="flex items-center justify-between text-neutral-400">
          <span>Dark Mode</span>
          <button
            type="button"
            role="switch"
            aria-checked={darkMode}
            class="h-6 w-11 rounded-full border border-neutral-600 p-1 transition {darkMode ? 'bg-orange-400/90' : 'bg-neutral-700'}"
            on:click={() => (darkMode = !darkMode)}
          >
            <span class="block h-4 w-4 rounded-full bg-white transition {darkMode ? 'translate-x-5' : ''}"></span>
          </button>
        </label>

        <label class="flex items-center justify-between text-neutral-400">
          <span>Notifications</span>
          <button
            type="button"
            role="switch"
            aria-checked={notifications}
            class="h-6 w-11 rounded-full border border-neutral-600 p-1 transition {notifications ? 'bg-orange-400/90' : 'bg-neutral-700'}"
            on:click={() => (notifications = !notifications)}
          >
            <span class="block h-4 w-4 rounded-full bg-white transition {notifications ? 'translate-x-5' : ''}"></span>
          </button>
        </label>
      </div>
    </div>

    <div class="rounded-xl border border-neutral-700 bg-neutral-900/70 p-3">
      <p class="text-neutral-300">Security</p>
      <button type="button" class="mt-3 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-200 transition hover:border-neutral-500 active:scale-95">
        Change Password
      </button>
      <button
        type="button"
        class="mt-2 block rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-950/50 active:scale-95"
        on:click={handleLogout}
      >
        Logout
      </button>
    </div>
  </div>
</section>
