import { derived, writable } from 'svelte/store';
import {
  initialRecentActivity,
  initialTasks,
  weeklyActivitySeed,
  type TaskPriority,
  type RecentActivitySeed,
  type Task
} from '$lib/data/mockData';

export type WeeklyStat = {
  day: string;
  completed: number;
};

export type RecentActivityItem = RecentActivitySeed;
export type NewTaskInput = {
  id?: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  starred?: boolean;
};

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

const categorizeByDate = (dueDate?: string): { group: Task['group']; tag: Task['tag'] } => {
  if (!dueDate) return { group: 'today', tag: 'Today' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (Number.isNaN(due.getTime())) return { group: 'today', tag: 'Today' };
  if (due.getTime() < today.getTime()) return { group: 'overdue', tag: 'Overdue' };
  if (due.getTime() > today.getTime()) return { group: 'upcoming', tag: 'Upcoming' };
  return { group: 'today', tag: 'Today' };
};

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
  add: (input: string | NewTaskInput) => {
    const payload: NewTaskInput = typeof input === 'string' ? { title: input } : input;
    const trimmed = payload.title.trim();
    if (!trimmed) return;
    const category = categorizeByDate(payload.dueDate);

    tasksStore.update((items) => [
      {
        id: payload.id ? `t-${payload.id}` : id(),
        title: trimmed,
        description: payload.description?.trim(),
        dueDate: payload.dueDate,
        priority: payload.priority ?? 'Medium',
        completed: false,
        starred: payload.starred ?? false,
        expanded: false,
        group: category.group,
        tag: category.tag,
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
