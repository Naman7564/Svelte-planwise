import type {
    DbTask,
    DbSubtask,
    DbEvent,
    DbActivity,
    Task,
    Subtask,
    EventItem,
    RecentActivityItem,
    TaskPriority,
    TaskTag
} from './types';

// ─── Date-based group / tag derivation ──────────────────────────────
export function categorizeByDate(dueDate?: string | null): {
    group: Task['group'];
    tag: TaskTag;
} {
    if (!dueDate) return { group: 'today', tag: 'Today' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    if (Number.isNaN(due.getTime())) return { group: 'today', tag: 'Today' };
    if (due.getTime() < today.getTime()) return { group: 'overdue', tag: 'Overdue' };
    if (due.getTime() > today.getTime()) return { group: 'upcoming', tag: 'Upcoming' };
    return { group: 'today', tag: 'Today' };
}

// ─── DB → Frontend mappers ──────────────────────────────────────────
function normalizePriority(val: string | null): TaskPriority {
    if (!val) return 'Medium';
    const lower = val.toLowerCase();
    if (lower === 'low') return 'Low';
    if (lower === 'high') return 'High';
    return 'Medium';
}

export function dbTaskToTask(row: DbTask, subtasks: Subtask[] = []): Task {
    const cat = categorizeByDate(row.due_date);
    return {
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        dueDate: row.due_date ?? undefined,
        priority: normalizePriority(row.priority),
        completed: row.status === 'completed',
        starred: row.starred ?? false,
        expanded: false,
        group: cat.group,
        tag: cat.tag,
        subtasks
    };
}

export function dbSubtaskToSubtask(row: DbSubtask): Subtask {
    return {
        id: row.id,
        title: row.title,
        done: row.done
    };
}

export function dbEventToEventItem(row: DbEvent): EventItem {
    const start = new Date(row.startTime);
    const end = new Date(row.endTime);
    return {
        id: row.id,
        title: row.title,
        startHour: start.getHours() + start.getMinutes() / 60,
        endHour: end.getHours() + end.getMinutes() / 60,
        tag: row.tag ?? 'General',
        starred: false // events table has no starred column; local-only
    };
}

const actionTypeMap: Record<string, RecentActivityItem['type']> = {
    completed: 'completed',
    starred: 'starred',
    added: 'added'
};

export function dbActivityToItem(row: DbActivity): RecentActivityItem {
    return {
        id: row.id,
        type: actionTypeMap[row.action] ?? 'added',
        taskTitle: row.action, // we store "completed: Task Name" style; extract title
        timestamp: new Date(row.timestamp).getTime()
    };
}
