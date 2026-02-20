// ─── Frontend types (used by components) ────────────────────────────
export type Subtask = {
    id: string;
    title: string;
    done: boolean;
};

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskTag = 'Today' | 'Yesterday' | 'Overdue' | 'Upcoming';

export type Task = {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    priority?: TaskPriority;
    completed: boolean;
    starred: boolean;
    expanded: boolean; // UI-only
    group: 'overdue' | 'today' | 'upcoming'; // derived
    tag: TaskTag; // derived
    subtasks: Subtask[];
};

export type EventItem = {
    id: string;
    title: string;
    startHour: number;
    endHour: number;
    tag: string;
    starred: boolean;
};

export type WeeklyStat = {
    day: string;
    completed: number;
};

export type RecentActivityItem = {
    id: string;
    type: 'completed' | 'starred' | 'added';
    taskTitle: string;
    timestamp: number;
};

export type NewTaskInput = {
    id?: number;
    title: string;
    description?: string;
    dueDate?: string;
    priority?: TaskPriority;
    starred?: boolean;
};

// ─── DB row types (snake_case as returned from PostgREST) ───────────
export type DbTask = {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    priority: string | null;
    status: string | null;
    starred: boolean;
    list_id: string | null;
    project_id: string | null;
    created_at: string;
    updated_at: string;
};

export type DbSubtask = {
    id: string;
    task_id: string;
    user_id: string;
    title: string;
    done: boolean;
    created_at: string;
    updated_at: string;
};

export type DbEvent = {
    id: string;
    user_id: string;
    title: string;
    startTime: string;
    endTime: string;
    date: string;
    tag: string | null;
    createdAt: string;
    updatedAt: string;
};

export type DbActivity = {
    id: string;
    user_id: string;
    action: string;
    taskId: string | null;
    timestamp: string;
    createdAt: string;
    updatedAt: string;
};

export type DbProfile = {
    id: string;
    user_id: string;
    name: string;
    email: string;
    avatar: string;
    productivityScore: number;
    streak: number;
    createdAt: string;
    updatedAt: string;
};

// ─── User type from InsForge auth ────────────────────────────────────
export type AuthUser = {
    id: string;
    email: string;
    emailVerified: boolean;
    providers: string[];
    createdAt: string;
    updatedAt: string;
    profile: {
        name?: string;
        avatar_url?: string;
    };
    metadata: Record<string, unknown>;
};
