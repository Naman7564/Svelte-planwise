import { writable } from 'svelte/store';
import { initialTasks, type Task } from '$lib/data/mockData';

const seed = initialTasks;
const tasksStore = writable<Task[]>(seed);

const id = () => `t-${Math.random().toString(36).slice(2, 9)}`;

export const tasks = {
  subscribe: tasksStore.subscribe,
  reset: () => tasksStore.set(seed),
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
  },
  remove: (taskId: string) => tasksStore.update((items) => items.filter((task) => task.id !== taskId)),
  toggleComplete: (taskId: string) =>
    tasksStore.update((items) =>
      items.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    ),
  toggleStar: (taskId: string) =>
    tasksStore.update((items) =>
      items.map((task) => (task.id === taskId ? { ...task, starred: !task.starred } : task))
    ),
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
