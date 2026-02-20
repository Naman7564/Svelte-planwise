import { derived, get, writable } from 'svelte/store';
import { insforge } from '$lib/insforge';
import { categorizeByDate, dbTaskToTask, dbSubtaskToSubtask } from '$lib/mappers';
import { userId } from '$lib/stores/auth';
import type {
  DbSubtask,
  DbTask,
  RecentActivityItem,
  Task,
  TaskPriority,
  Subtask
} from '$lib/types';

// ─── Types ──────────────────────────────────────────────────────────
export type WeeklyStat = { day: string; completed: number };
export type NewTaskInput = {
  id?: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  starred?: boolean;
};

export { type RecentActivityItem };

// ─── Internal writable stores ───────────────────────────────────────
const tasksStore = writable<Task[]>([]);
const activityStore = writable<RecentActivityItem[]>([]);
const tasksLoading = writable(true);

export const isTasksLoading = { subscribe: tasksLoading.subscribe };

// ─── ID generators (local fallback) ─────────────────────────────────
const activityId = () => `a-${Math.random().toString(36).slice(2, 9)}`;

// ─── Weekly stats seed (used for chart rendering) ───────────────────
const weeklyActivitySeed = [
  { day: 'Mon', completed: 3 },
  { day: 'Tue', completed: 4 },
  { day: 'Wed', completed: 5 },
  { day: 'Thu', completed: 2 },
  { day: 'Fri', completed: 6 },
  { day: 'Sat', completed: 3 },
  { day: 'Sun', completed: 4 }
];

// ─── Fetch all tasks + subtasks from InsForge ───────────────────────
async function fetchTasks(): Promise<void> {
  tasksLoading.set(true);
  try {
    const uid = get(userId);
    if (!uid) {
      tasksStore.set([]);
      return;
    }

    // Fetch tasks
    const { data: taskRows, error: taskErr } = await insforge.database
      .from('tasks')
      .select()
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (taskErr || !taskRows) {
      console.error('Failed to fetch tasks:', taskErr);
      tasksStore.set([]);
      return;
    }

    // Fetch subtasks for all tasks
    const taskIds = (taskRows as DbTask[]).map((t) => t.id);
    let subtaskMap: Record<string, Subtask[]> = {};

    if (taskIds.length > 0) {
      const { data: subRows } = await insforge.database
        .from('subtasks')
        .select()
        .in('task_id', taskIds)
        .order('created_at', { ascending: true });

      if (subRows) {
        for (const row of subRows as DbSubtask[]) {
          const mapped = dbSubtaskToSubtask(row);
          if (!subtaskMap[row.task_id]) subtaskMap[row.task_id] = [];
          subtaskMap[row.task_id].push(mapped);
        }
      }
    }

    const mapped = (taskRows as DbTask[]).map((row) =>
      dbTaskToTask(row, subtaskMap[row.id] ?? [])
    );
    tasksStore.set(mapped);
  } catch (e) {
    console.error('fetchTasks error:', e);
    tasksStore.set([]);
  } finally {
    tasksLoading.set(false);
  }
}

// ─── Fetch recent activity ──────────────────────────────────────────
async function fetchActivity(): Promise<void> {
  try {
    const uid = get(userId);
    if (!uid) {
      activityStore.set([]);
      return;
    }

    const { data, error } = await insforge.database
      .from('activity')
      .select()
      .eq('user_id', uid)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error || !data) {
      activityStore.set([]);
      return;
    }

    activityStore.set(
      (data as any[]).map((row) => ({
        id: row.id,
        type: row.action as RecentActivityItem['type'],
        taskTitle: row.taskId ?? '',
        timestamp: new Date(row.timestamp).getTime()
      }))
    );
  } catch {
    activityStore.set([]);
  }
}

// ─── Log activity to DB ─────────────────────────────────────────────
async function logActivity(type: string, taskTitle: string): Promise<void> {
  const uid = get(userId);
  if (!uid) return;

  // Optimistic local update
  activityStore.update((items) => [
    {
      id: activityId(),
      type: type as RecentActivityItem['type'],
      taskTitle,
      timestamp: Date.now()
    },
    ...items
  ]);

  try {
    await insforge.database.from('activity').insert({
      user_id: uid,
      action: type,
      taskId: taskTitle,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('logActivity error:', e);
  }
}

// ─── Derived stores ─────────────────────────────────────────────────
export const totalTasks = derived(tasksStore, ($t) => $t.length);
export const completedTasks = derived(tasksStore, ($t) => $t.filter((t) => t.completed).length);
export const pendingTasks = derived(tasksStore, ($t) => $t.filter((t) => !t.completed).length);

export const productivityScore = derived(
  [completedTasks, totalTasks],
  ([$c, $t]) => ($t === 0 ? 0 : Math.round(($c / $t) * 100))
);

export const weeklyStats = derived(tasksStore, ($tasks): WeeklyStat[] => {
  const completed = $tasks.filter((t) => t.completed).length;
  const ratio = $tasks.length === 0 ? 0 : completed / $tasks.length;
  return weeklyActivitySeed.map((p, i) => ({
    day: p.day,
    completed: Math.max(
      0,
      Math.round(p.completed * (0.72 + ratio * 0.85) + (i === 6 ? ratio * 2 : 0))
    )
  }));
});

export const streak = derived(weeklyStats, ($ws) => {
  let s = 0;
  for (let i = $ws.length - 1; i >= 0; i--) {
    if ($ws[i].completed > 0) {
      s++;
    } else break;
  }
  return s;
});

export const mostProductiveDay = derived(weeklyStats, ($ws) => {
  if ($ws.length === 0) return 'N/A';
  return $ws.reduce((max, c) => (c.completed > max.completed ? c : max)).day;
});

export const averageCompletionTime = derived(
  [completedTasks, totalTasks],
  ([$c, $t]) => {
    const base = 118;
    const eff = $t === 0 ? 0 : $c / $t;
    const adj = Math.max(52, Math.round(base - eff * 30));
    return `${Math.floor(adj / 60)}h ${adj % 60}m`;
  }
);

export const recentActivity = derived(activityStore, ($a) => $a.slice(0, 8));

// ─── Tasks public API ───────────────────────────────────────────────
export const tasks = {
  subscribe: tasksStore.subscribe,

  /** Called after login / session restore */
  load: async () => {
    await Promise.all([fetchTasks(), fetchActivity()]);
  },

  /** Clear local state on logout */
  clear: () => {
    tasksStore.set([]);
    activityStore.set([]);
  },

  add: async (input: string | NewTaskInput) => {
    const payload: NewTaskInput = typeof input === 'string' ? { title: input } : input;
    const trimmed = payload.title.trim();
    if (!trimmed) return;

    const uid = get(userId);
    if (!uid) return;

    const cat = categorizeByDate(payload.dueDate);
    const priorityMap: Record<string, string> = { Low: 'low', Medium: 'medium', High: 'high' };

    // Insert into DB
    const { data, error } = await insforge.database
      .from('tasks')
      .insert({
        user_id: uid,
        title: trimmed,
        description: payload.description?.trim() || null,
        due_date: payload.dueDate || null,
        priority: priorityMap[payload.priority ?? 'Medium'] ?? 'medium',
        status: 'pending',
        starred: payload.starred ?? false
      })
      .select();

    if (error) {
      console.error('Add task error:', error);
      return;
    }

    if (data && data[0]) {
      const row = data[0] as DbTask;
      const task: Task = {
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        dueDate: row.due_date ?? undefined,
        priority: payload.priority ?? 'Medium',
        completed: false,
        starred: row.starred ?? false,
        expanded: false,
        group: cat.group,
        tag: cat.tag,
        subtasks: []
      };
      tasksStore.update((items) => [task, ...items]);
      logActivity('added', trimmed);
    }
  },

  remove: async (taskId: string) => {
    // Optimistic
    tasksStore.update((items) => items.filter((t) => t.id !== taskId));

    const { error } = await insforge.database.from('tasks').delete().eq('id', taskId);
    if (error) {
      console.error('Remove task error:', error);
      // Re-fetch to restore consistency
      await fetchTasks();
    }
  },

  toggleComplete: async (taskId: string) => {
    let title = '';
    let nextStatus = '';

    tasksStore.update((items) =>
      items.map((t) => {
        if (t.id !== taskId) return t;
        const next = { ...t, completed: !t.completed };
        nextStatus = next.completed ? 'completed' : 'pending';
        if (next.completed) title = t.title;
        return next;
      })
    );

    const { error } = await insforge.database
      .from('tasks')
      .update({ status: nextStatus })
      .eq('id', taskId);

    if (error) {
      console.error('Toggle complete error:', error);
      await fetchTasks();
      return;
    }

    if (title) logActivity('completed', title);
  },

  toggleStar: async (taskId: string) => {
    let newStarred = false;
    let title = '';

    tasksStore.update((items) =>
      items.map((t) => {
        if (t.id !== taskId) return t;
        newStarred = !t.starred;
        if (newStarred) title = t.title;
        return { ...t, starred: newStarred };
      })
    );

    const { error } = await insforge.database
      .from('tasks')
      .update({ starred: newStarred })
      .eq('id', taskId);

    if (error) {
      console.error('Toggle star error:', error);
      await fetchTasks();
      return;
    }

    if (title) logActivity('starred', title);
  },

  toggleExpanded: (taskId: string) =>
    tasksStore.update((items) =>
      items.map((t) => (t.id === taskId ? { ...t, expanded: !t.expanded } : t))
    ),

  toggleSubtask: async (taskId: string, subtaskId: string) => {
    let newDone = false;
    tasksStore.update((items) =>
      items.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((s) => {
            if (s.id !== subtaskId) return s;
            newDone = !s.done;
            return { ...s, done: newDone };
          })
        };
      })
    );

    await insforge.database.from('subtasks').update({ done: newDone }).eq('id', subtaskId);
  }
};
