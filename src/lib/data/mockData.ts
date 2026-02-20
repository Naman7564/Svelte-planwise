export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type TaskTag = 'Today' | 'Yesterday' | 'Overdue';

export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  starred: boolean;
  expanded: boolean;
  group: 'overdue' | 'today';
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

export const initialTasks: Task[] = [
  {
    id: 't-1',
    title: 'Call Jason',
    description: 'Follow up on deployment blockers and contract updates.',
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
    completed: false,
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
    completed: false,
    starred: false,
    expanded: false,
    group: 'today',
    tag: 'Today',
    subtasks: []
  }
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
