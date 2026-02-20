import { derived, writable } from 'svelte/store';
import {
  initialRecentActivity,
  initialTasks,
  weeklyActivitySeed,
  type RecentActivitySeed,
  type Task
} from '$lib/data/mockData';

export type WeeklyStat = {
  day: string;
  completed: number;
};

export type RecentActivityItem = RecentActivitySeed;

const cloneTasks = (items: Task[]) =>
  items.map((task) => ({
    ...task,
    subtasks: task.subtasks.map((subtask) => ({ ...subtask }))
  }));

const seed = cloneTasks(initialTasks);
const tasksStore = writable<Task[]>(seed);
const activityStore = writable<RecentActivityItem[]>([...initialRecentActivity]);

const id = () => `t-${Math.random().toString(36).slice(2, 9)}`;
const activityId = () => `a-${Math.random().toString(36).slice(2, 9)}`;

const appendActivity = (type: RecentActivityItem['type'], taskTitle: string) => {
  activityStore.update((items) => [
    {
      id: activityId(),
      type,
      taskTitle,
      timestamp: Date.now()
    },
    ...items
  ]);
};

export const totalTasks = derived(tasksStore, ($tasks) => $tasks.length);
export const completedTasks = derived(tasksStore, ($tasks) => $tasks.filter((task) => task.completed).length);
export const pendingTasks = derived(tasksStore, ($tasks) => $tasks.filter((task) => !task.completed).length);

export const productivityScore = derived(
  [completedTasks, totalTasks],
  ([$completedTasks, $totalTasks]) => ($totalTasks === 0 ? 0 : Math.round(($completedTasks / $totalTasks) * 100))
);

export const weeklyStats = derived(tasksStore, ($tasks): WeeklyStat[] => {
  const completed = $tasks.filter((task) => task.completed).length;
  const ratio = $tasks.length === 0 ? 0 : completed / $tasks.length;

  return weeklyActivitySeed.map((point, index) => ({
    day: point.day,
    completed: Math.max(0, Math.round(point.completed * (0.72 + ratio * 0.85) + (index === 6 ? ratio * 2 : 0)))
  }));
});

export const streak = derived(weeklyStats, ($weeklyStats) => {
  let currentStreak = 0;

  for (let i = $weeklyStats.length - 1; i >= 0; i -= 1) {
    if ($weeklyStats[i].completed > 0) {
      currentStreak += 1;
      continue;
    }
    break;
  }

  return currentStreak;
});

export const mostProductiveDay = derived(weeklyStats, ($weeklyStats) => {
  if ($weeklyStats.length === 0) return 'N/A';
  return $weeklyStats.reduce((max, current) => (current.completed > max.completed ? current : max)).day;
});

export const averageCompletionTime = derived(
  [completedTasks, totalTasks],
  ([$completedTasks, $totalTasks]) => {
    const baseMinutes = 118;
    const efficiency = $totalTasks === 0 ? 0 : $completedTasks / $totalTasks;
    const adjustedMinutes = Math.max(52, Math.round(baseMinutes - efficiency * 30));
    const hours = Math.floor(adjustedMinutes / 60);
    const minutes = adjustedMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
);

export const recentActivity = derived(activityStore, ($activity) => $activity.slice(0, 8));

export const tasks = {
  subscribe: tasksStore.subscribe,
  reset: () => {
    tasksStore.set(cloneTasks(initialTasks));
    activityStore.set([...initialRecentActivity]);
  },
  add: (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    tasksStore.update((items) => [
      {
        id: id(),
        title: trimmed,
        completed: false,
        starred: false,
        expanded: false,
        group: 'today',
        tag: 'Today',
        subtasks: []
      },
      ...items
    ]);

    appendActivity('added', trimmed);
  },
  remove: (taskId: string) => tasksStore.update((items) => items.filter((task) => task.id !== taskId)),
  toggleComplete: (taskId: string) => {
    let completedTitle = '';

    tasksStore.update((items) =>
      items.map((task) => {
        if (task.id !== taskId) return task;

        const nextTask = { ...task, completed: !task.completed };
        if (nextTask.completed) completedTitle = task.title;
        return nextTask;
      })
    );

    if (completedTitle) appendActivity('completed', completedTitle);
  },
  toggleStar: (taskId: string) => {
    let starredTitle = '';

    tasksStore.update((items) =>
      items.map((task) => {
        if (task.id !== taskId) return task;

        const nextTask = { ...task, starred: !task.starred };
        if (nextTask.starred) starredTitle = task.title;
        return nextTask;
      })
    );

    if (starredTitle) appendActivity('starred', starredTitle);
  },
  toggleExpanded: (taskId: string) =>
    tasksStore.update((items) =>
      items.map((task) => (task.id === taskId ? { ...task, expanded: !task.expanded } : task))
    ),
  toggleSubtask: (taskId: string, subtaskId: string) =>
    tasksStore.update((items) =>
      items.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subtasks: task.subtasks.map((subtask) =>
            subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask
          )
        };
      })
    )
};
