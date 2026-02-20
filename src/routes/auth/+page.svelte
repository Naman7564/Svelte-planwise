<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade, fly, scale } from 'svelte/transition';
  import {
    signUp,
    signIn,
    signInWithOAuth,
    verifyEmail,
    resendVerification,
    authError,
    loading,
    isAuthenticated
  } from '$lib/stores/auth';

  type View = 'login' | 'register' | 'verify';

  let view: View = 'login';
  let email = '';
  let password = '';
  let name = '';
  let otp = '';
  let pendingEmail = '';
  let localError = '';
  let resendCooldown = 0;
  let resendTimer: ReturnType<typeof setInterval> | undefined;

  // Redirect if already authenticated
  $: if ($isAuthenticated) {
    goto('/', { replaceState: true });
  }

  function clearForm() {
    email = '';
    password = '';
    name = '';
    otp = '';
    localError = '';
    authError.set(null);
  }

  function switchView(target: View) {
    clearForm();
    view = target;
  }

  async function handleLogin() {
    localError = '';
    if (!email.trim() || !password.trim()) {
      localError = 'Please enter email and password';
      return;
    }
    const ok = await signIn(email.trim(), password.trim());
    if (ok) {
      goto('/', { replaceState: true });
    }
  }

  async function handleRegister() {
    localError = '';
    if (!name.trim()) {
      localError = 'Please enter your name';
      return;
    }
    if (!email.trim() || !password.trim()) {
      localError = 'Please enter email and password';
      return;
    }
    if (password.length < 6) {
      localError = 'Password must be at least 6 characters';
      return;
    }

    const result = await signUp(email.trim(), password.trim(), name.trim());
    if (result.requireEmailVerification) {
      pendingEmail = email.trim();
      view = 'verify';
    }
  }

  async function handleVerify() {
    localError = '';
    if (otp.length !== 6) {
      localError = 'Enter the 6-digit code';
      return;
    }
    const ok = await verifyEmail(pendingEmail, otp);
    if (ok) {
      goto('/', { replaceState: true });
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    await resendVerification(pendingEmail);
    resendCooldown = 30;
    resendTimer = setInterval(() => {
      resendCooldown--;
      if (resendCooldown <= 0) clearInterval(resendTimer);
    }, 1000);
  }

  async function handleOAuth(provider: 'google' | 'github') {
    await signInWithOAuth(provider);
  }

  $: displayError = localError || $authError || '';
</script>

<svelte:head>
  <title>PlanWise — Sign In</title>
  <meta name="description" content="Sign in to PlanWise to manage your tasks and calendar." />
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
  <div
    class="w-full max-w-sm"
    in:fade={{ duration: 200 }}
  >
    <!-- Logo / Brand -->
    <div class="mb-8 text-center">
      <div class="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-2xl font-bold text-white shadow-lg shadow-orange-500/25">
        P
      </div>
      <h1 class="text-2xl font-bold text-white">PlanWise</h1>
      <p class="mt-1 text-sm text-neutral-400">
        {#if view === 'login'}Sign in to continue{:else if view === 'register'}Create your account{:else}Verify your email{/if}
      </p>
    </div>

    <!-- Error Display -->
    {#if displayError}
      <div
        class="mb-4 rounded-xl border border-red-800/50 bg-red-950/40 px-4 py-2.5 text-sm text-red-300"
        transition:fly={{ y: -8, duration: 150 }}
      >
        {displayError}
      </div>
    {/if}

    <!-- ─── LOGIN VIEW ──────────────────────────────────── -->
    {#if view === 'login'}
      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-xs font-medium uppercase tracking-wide text-neutral-400" for="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            bind:value={email}
            class="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-orange-500"
            placeholder="you@example.com"
            required
          />
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-medium uppercase tracking-wide text-neutral-400" for="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            bind:value={password}
            class="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-orange-500"
            placeholder="••••••"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60"
          disabled={$loading}
        >
          {#if $loading}
            <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
          {:else}
            Sign In
          {/if}
        </button>
      </form>

      <!-- Divider -->
      <div class="my-5 flex items-center gap-3">
        <div class="h-px flex-1 bg-neutral-700"></div>
        <span class="text-xs text-neutral-500">or continue with</span>
        <div class="h-px flex-1 bg-neutral-700"></div>
      </div>

      <!-- OAuth -->
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          class="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/60 py-2.5 text-sm text-neutral-200 transition hover:border-neutral-500 active:scale-95"
          on:click={() => handleOAuth('google')}
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </button>
        <button
          type="button"
          class="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/60 py-2.5 text-sm text-neutral-200 transition hover:border-neutral-500 active:scale-95"
          on:click={() => handleOAuth('github')}
        >
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub
        </button>
      </div>

      <p class="mt-6 text-center text-sm text-neutral-400">
        Don't have an account?
        <button type="button" class="text-orange-400 hover:underline" on:click={() => switchView('register')}>
          Sign up
        </button>
      </p>

    <!-- ─── REGISTER VIEW ───────────────────────────────── -->
    {:else if view === 'register'}
      <form on:submit|preventDefault={handleRegister} class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-xs font-medium uppercase tracking-wide text-neutral-400" for="reg-name">Name</label>
          <input
            id="reg-name"
            type="text"
            bind:value={name}
            class="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-orange-500"
            placeholder="Your name"
            required
          />
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-medium uppercase tracking-wide text-neutral-400" for="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            bind:value={email}
            class="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-orange-500"
            placeholder="you@example.com"
            required
          />
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-medium uppercase tracking-wide text-neutral-400" for="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            bind:value={password}
            minlength="6"
            class="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-orange-500"
            placeholder="Min 6 characters"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60"
          disabled={$loading}
        >
          {#if $loading}
            <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
          {:else}
            Create Account
          {/if}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-neutral-400">
        Already have an account?
        <button type="button" class="text-orange-400 hover:underline" on:click={() => switchView('login')}>
          Sign in
        </button>
      </p>

    <!-- ─── VERIFY VIEW ─────────────────────────────────── -->
    {:else if view === 'verify'}
      <form on:submit|preventDefault={handleVerify} class="space-y-4">
        <p class="text-sm text-neutral-300">
          We sent a 6-digit verification code to <span class="font-medium text-white">{pendingEmail}</span>.
        </p>

        <div class="space-y-1.5">
          <label class="text-xs font-medium uppercase tracking-wide text-neutral-400" for="verify-otp">Verification Code</label>
          <input
            id="verify-otp"
            type="text"
            inputmode="numeric"
            maxlength="6"
            bind:value={otp}
            class="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-3 text-center text-lg tracking-[0.5em] text-white outline-none transition focus:border-orange-500"
            placeholder="000000"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60"
          disabled={$loading || otp.length < 6}
        >
          Verify Email
        </button>

        <div class="flex items-center justify-between text-sm">
          <button type="button" class="text-neutral-400 hover:text-neutral-200" on:click={() => switchView('login')}>
            ← Back to login
          </button>
          <button
            type="button"
            class="text-orange-400 disabled:text-neutral-600 disabled:cursor-not-allowed"
            disabled={resendCooldown > 0}
            on:click={handleResend}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
          </button>
        </div>
      </form>
    {/if}
  </div>
</div>
