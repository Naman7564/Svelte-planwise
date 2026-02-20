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
  expanded: boolean;
  group: 'overdue' | 'today' | 'upcoming';
  tag: TaskTag;
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

export type WeeklyStatSeed = {
  day: string;
  completed: number;
};

export type RecentActivitySeed = {
  id: string;
  type: 'completed' | 'starred' | 'added';
  taskTitle: string;
  timestamp: number;
};

const toISODate = (offsetDays = 0) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

export const initialTasks: Task[] = [
  {
    id: 't-1',
    title: 'Call Jason',
    description: 'Follow up on deployment blockers and contract updates.',
    dueDate: toISODate(-1),
    priority: 'High',
    completed: false,
    starred: false,
    expanded: false,
    group: 'overdue',
    tag: 'Yesterday',
    subtasks: []
  },
  {
    id: 't-2',
    title: 'Email Back Mrs James',
    description: 'Confirm intern timeline and onboarding tasks for next week.',
    dueDate: toISODate(0),
    priority: 'Medium',
    completed: true,
    starred: true,
    expanded: true,
    group: 'today',
    tag: 'Today',
    subtasks: [
      { id: 'st-2-1', title: 'Attach roadmap PDF', done: true },
      { id: 'st-2-2', title: 'Include pricing notes', done: false }
    ]
  },
  {
    id: 't-3',
    title: 'New Design System',
    description: 'Review color tokens and reusable card patterns.',
    dueDate: toISODate(0),
    priority: 'High',
    completed: false,
    starred: true,
    expanded: false,
    group: 'today',
    tag: 'Today',
    subtasks: [
      { id: 'st-3-1', title: 'Typography scale', done: false },
      { id: 'st-3-2', title: 'Button states', done: false },
      { id: 'st-3-3', title: 'Grid spacing', done: false }
    ]
  },
  {
    id: 't-4',
    title: 'Continue Coding',
    description: 'Finish timeline interactions and keyboard accessibility.',
    dueDate: toISODate(2),
    priority: 'Low',
    completed: false,
    starred: false,
    expanded: false,
    group: 'upcoming',
    tag: 'Upcoming',
    subtasks: []
  }
];

export const weeklyActivitySeed: WeeklyStatSeed[] = [
  { day: 'Mon', completed: 3 },
  { day: 'Tue', completed: 4 },
  { day: 'Wed', completed: 5 },
  { day: 'Thu', completed: 2 },
  { day: 'Fri', completed: 6 },
  { day: 'Sat', completed: 3 },
  { day: 'Sun', completed: 4 }
];

const now = Date.now();
export const initialRecentActivity: RecentActivitySeed[] = [
  { id: 'a-1', type: 'completed', taskTitle: 'Email Client', timestamp: now - 1000 * 60 * 15 },
  { id: 'a-2', type: 'starred', taskTitle: 'Design System', timestamp: now - 1000 * 60 * 43 },
  { id: 'a-3', type: 'added', taskTitle: 'Meeting Notes', timestamp: now - 1000 * 60 * 85 }
];

export const initialEvents: EventItem[] = [
  {
    id: 'e-1',
    title: 'New Design System',
    startHour: 13,
    endHour: 17,
    tag: 'New Design',
    starred: true
  },
  {
    id: 'e-2',
    title: 'Continue Coding',
    startHour: 18,
    endHour: 19,
    tag: 'Build',
    starred: false
  },
  {
    id: 'e-3',
    title: 'Email Back Mrs James',
    startHour: 19,
    endHour: 20,
    tag: 'Comms',
    starred: false
  }
];
