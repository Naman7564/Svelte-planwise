<script lang="ts">
  import { onMount } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import ProfileHeader from '$lib/components/profile/ProfileHeader.svelte';
  import StatCard from '$lib/components/profile/StatCard.svelte';
  import ActivityChart from '$lib/components/profile/ActivityChart.svelte';
  import InsightsCard from '$lib/components/profile/InsightsCard.svelte';
  import SettingsCard from '$lib/components/profile/SettingsCard.svelte';
  import RecentActivity from '$lib/components/profile/RecentActivity.svelte';
  import {
    averageCompletionTime,
    completedTasks,
    mostProductiveDay,
    pendingTasks,
    productivityScore,
    recentActivity,
    streak,
    totalTasks,
    weeklyStats
  } from '$lib/stores/tasks';

  let loading = true;

  const totalCounter = tweened(0, { duration: 500, easing: cubicOut });
  const completedCounter = tweened(0, { duration: 500, easing: cubicOut });
  const pendingCounter = tweened(0, { duration: 500, easing: cubicOut });
  const productivityCounter = tweened(0, { duration: 500, easing: cubicOut });

  $: totalCounter.set($totalTasks);
  $: completedCounter.set($completedTasks);
  $: pendingCounter.set($pendingTasks);
  $: productivityCounter.set($productivityScore);

  onMount(() => {
    const timer = setTimeout(() => {
      loading = false;
    }, 650);

    return () => clearTimeout(timer);
  });
</script>

<section class="space-y-4">
  <ProfileHeader />

  <div class="grid grid-cols-2 gap-3">
    <StatCard title="Total Tasks" value={Math.round($totalCounter)} icon="TT" {loading} />
    <StatCard title="Completed" value={Math.round($completedCounter)} icon="OK" {loading} />
    <StatCard title="Pending" value={Math.round($pendingCounter)} icon="PD" {loading} />
    <StatCard title="Productivity" value={Math.round($productivityCounter)} icon="PR" {loading} />
  </div>

  <ActivityChart data={$weeklyStats} {loading} />

  <InsightsCard
    streak={$streak}
    mostProductiveDay={$mostProductiveDay}
    averageCompletionTime={$averageCompletionTime}
    productivityScore={Math.round($productivityCounter)}
    {loading}
  />

  <SettingsCard />
  <RecentActivity items={$recentActivity} {loading} />
</section>

<BottomNav />
