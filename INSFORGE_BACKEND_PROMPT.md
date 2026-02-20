# InsForge Backend Configuration Prompt for Svelte-Planwise

> **Copy-paste this entire prompt into a new AI conversation (with InsForge MCP enabled) to configure and integrate the InsForge backend into this project.**

---

## 🎯 Objective

Configure the **InsForge backend** (via MCP tools) for the **Svelte-Planwise** project — a mobile-first, dark iOS-style task & calendar SvelteKit app using Tailwind CSS. The app currently uses **local Svelte stores with mock data**. The goal is to **replace mock data with a real InsForge-powered PostgreSQL backend**, add **user authentication**, and wire up **real-time sync**.

---

## 📋 Project Overview

| Key              | Value                                                              |
| ---------------- | ------------------------------------------------------------------ |
| **Framework**    | SvelteKit 2 + Svelte 5                                            |
| **Styling**      | Tailwind CSS 3.4                                                   |
| **Language**     | TypeScript                                                         |
| **Build Tool**   | Vite 5                                                             |
| **Project Root** | `c:\Users\NAMAN\Downloads\Svelte-planwise`                         |
| **Backend**      | InsForge BaaS (PostgreSQL + PostgREST API)                         |
| **API Base URL** | `https://hi2vts4c.ap-southeast.insforge.app`                       |
| **Anon Key**     | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTEwNDl9.TFsox1iaDwVobOwqECM4ulskPBVURXI82MjIOwp5evM` |

### Project Structure

```
src/
  app.html                        # HTML shell
  app.css                         # Global styles
  app.d.ts                        # Type declarations
  routes/
    +layout.svelte                # App layout with BottomNav
    +page.svelte                  # "My Day" task list view
    calendar/+page.svelte         # Calendar timeline view
    profile/+page.svelte          # Profile dashboard & analytics
  lib/
    components/
      AddTaskModal.svelte         # Modal for creating tasks
      BottomNav.svelte            # Bottom navigation bar
      CalendarTimeline.svelte     # Calendar event timeline
      Checkbox.svelte             # Task checkbox component
      EventCard.svelte            # Calendar event card
      FloatingAddButton.svelte    # FAB for adding tasks
      Header.svelte               # Page header
      StarButton.svelte           # Star toggle button
      TaskCard.svelte             # Task card with expand/collapse
      TaskGroup.svelte            # Task group (Overdue/Today/Upcoming)
      profile/                    # 6 profile sub-components
    stores/
      tasks.ts                    # Task store (writable + derived stats)
      events.ts                   # Events store (writable)
    data/
      mockData.ts                 # All mock/seed data & TypeScript types
```

### App Features (to be backed by InsForge)

- **Tasks**: Add, delete, complete, star, expand tasks with subtasks
- **Task categorization**: Overdue / Today / Upcoming (derived from due date)
- **Calendar events**: Timeline view with start/end hours, tags
- **Profile dashboard**: Productivity score, streak, weekly stats, recent activity
- **Analytics**: Average completion time, most productive day

---

## 🗄️ Existing InsForge Database Schema

The following tables **already exist** on the InsForge backend. Use these as-is for integration:

### `tasks` table (RLS enabled ✅)
| Column       | Type           | Nullable | Default                       |
| ------------ | -------------- | -------- | ----------------------------- |
| `id`         | uuid (PK)      | NO       | `uuid_generate_v4()`          |
| `user_id`    | uuid           | NO       | —                             |
| `title`      | varchar(255)   | NO       | —                             |
| `description`| text           | YES      | —                             |
| `due_date`   | date           | YES      | —                             |
| `priority`   | varchar(20)    | YES      | `'medium'`                    |
| `status`     | varchar(20)    | YES      | `'pending'`                   |
| `list_id`    | uuid (FK→lists)| YES      | —                             |
| `project_id` | uuid (FK→projects)| YES   | —                             |
| `created_at` | timestamptz    | YES      | `now()`                       |
| `updated_at` | timestamptz    | YES      | `now()`                       |

**RLS Policies**: Users can SELECT, INSERT, UPDATE, DELETE only their own tasks (`auth.uid() = user_id`).
**Indexes**: `user_id`, `due_date`, `status`, `list_id`, `project_id`.

### `events` table (RLS disabled ❌ — needs RLS + `user_id`)
| Column      | Type          | Nullable | Default              |
| ----------- | ------------- | -------- | -------------------- |
| `id`        | uuid (PK)     | NO       | `gen_random_uuid()`  |
| `title`     | text          | NO       | —                    |
| `startTime` | timestamptz   | NO       | —                    |
| `endTime`   | timestamptz   | NO       | —                    |
| `date`      | timestamptz   | NO       | —                    |
| `tag`       | text          | YES      | `'General'`          |
| `createdAt` | timestamptz   | YES      | `now()`              |
| `updatedAt` | timestamptz   | YES      | `now()`              |

### `activity` table (RLS disabled ❌ — needs RLS + `user_id`)
| Column      | Type          | Nullable | Default              |
| ----------- | ------------- | -------- | -------------------- |
| `id`        | uuid (PK)     | NO       | `gen_random_uuid()`  |
| `action`    | text          | NO       | —                    |
| `taskId`    | uuid          | YES      | —                    |
| `timestamp` | timestamptz   | YES      | `now()`              |
| `createdAt` | timestamptz   | YES      | `now()`              |
| `updatedAt` | timestamptz   | YES      | `now()`              |

### `profile` table (RLS disabled ❌ — needs RLS + `user_id` or link to auth)
| Column              | Type          | Nullable | Default              |
| ------------------- | ------------- | -------- | -------------------- |
| `id`                | uuid (PK)     | NO       | `gen_random_uuid()`  |
| `name`              | text          | NO       | —                    |
| `email`             | text (unique) | NO       | —                    |
| `avatar`            | text          | YES      | `''`                 |
| `productivityScore` | integer       | YES      | `0`                  |
| `streak`            | integer       | YES      | `0`                  |
| `createdAt`         | timestamptz   | YES      | `now()`              |
| `updatedAt`         | timestamptz   | YES      | `now()`              |

### `projects` table (RLS enabled ✅)
| Column       | Type          | Nullable | Default              |
| ------------ | ------------- | -------- | -------------------- |
| `id`         | uuid (PK)     | NO       | `uuid_generate_v4()` |
| `user_id`    | uuid          | NO       | —                    |
| `name`       | varchar(255)  | NO       | —                    |
| `created_at` | timestamptz   | YES      | `now()`              |
| `updated_at` | timestamptz   | YES      | `now()`              |

### `lists` table (RLS enabled ✅)
| Column       | Type          | Nullable | Default              |
| ------------ | ------------- | -------- | -------------------- |
| `id`         | uuid (PK)     | NO       | `uuid_generate_v4()` |
| `user_id`    | uuid          | NO       | —                    |
| `name`       | varchar(255)  | NO       | —                    |
| `color`      | varchar(7)    | YES      | `'#3b82f6'`          |
| `created_at` | timestamptz   | YES      | `now()`              |
| `updated_at` | timestamptz   | YES      | `now()`              |

---

## 🔧 Current Frontend Data Model (Mock Data — to be replaced)

### Task type (in `mockData.ts`)
```typescript
type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;          // ISO date string
  priority?: 'Low' | 'Medium' | 'High';
  completed: boolean;
  starred: boolean;
  expanded: boolean;          // UI-only state
  group: 'overdue' | 'today' | 'upcoming';  // derived from dueDate
  tag: 'Today' | 'Yesterday' | 'Overdue' | 'Upcoming';  // derived
  subtasks: { id: string; title: string; done: boolean }[];
};
```

### EventItem type (in `mockData.ts`)
```typescript
type EventItem = {
  id: string;
  title: string;
  startHour: number;
  endHour: number;
  tag: string;
  starred: boolean;
};
```

### RecentActivitySeed type (in `mockData.ts`)
```typescript
type RecentActivitySeed = {
  id: string;
  type: 'completed' | 'starred' | 'added';
  taskTitle: string;
  timestamp: number;     // Unix ms
};
```

---

## ✅ Step-by-Step Integration Plan

### Phase 1: SDK Installation & Client Setup

1. **Install the InsForge SDK**:
   ```bash
   npm install @insforge/sdk@latest
   ```

2. **Create SDK client** at `src/lib/insforge.ts`:
   ```typescript
   import { createClient } from '@insforge/sdk';

   export const insforge = createClient({
     baseUrl: 'https://hi2vts4c.ap-southeast.insforge.app',
     anonKey: '<ANON_KEY_FROM_ABOVE>'
   });
   ```

3. **Fetch the DB SDK docs** for CRUD operations:
   - Use `fetch-docs` with `docType: "db-sdk"` (or `fetch-sdk-docs` with `sdkFeature: "db"` and `sdkLanguage: "typescript"`)

4. **Fetch the Auth SDK docs**:
   - Use `fetch-docs` with `docType: "auth-sdk"` for custom auth flows in Svelte (no pre-built Svelte auth components exist)

---

### Phase 2: Database Schema Fixes (via MCP `run-raw-sql`)

The `events`, `activity`, and `profile` tables are **missing `user_id`** columns and **RLS is disabled**. Fix with:

1. **Add `user_id` to `events` table and enable RLS**:
   ```sql
   ALTER TABLE events ADD COLUMN user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
   ALTER TABLE events ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users can view their own events" ON events FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can create their own events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update their own events" ON events FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "Users can delete their own events" ON events FOR DELETE USING (auth.uid() = user_id);
   ```

2. **Add `user_id` to `activity` table and enable RLS**:
   ```sql
   ALTER TABLE activity ADD COLUMN user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
   ALTER TABLE activity ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users can view their own activity" ON activity FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can create their own activity" ON activity FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

3. **Add `user_id` to `profile` table and enable RLS** (or link `id` to auth user id):
   ```sql
   ALTER TABLE profile ADD COLUMN user_id uuid UNIQUE;
   ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users can view their own profile" ON profile FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can update their own profile" ON profile FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "Users can create their own profile" ON profile FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

4. **Add `starred` boolean column to `tasks` table** (missing from DB, exists in frontend):
   ```sql
   ALTER TABLE tasks ADD COLUMN starred boolean DEFAULT false;
   ```

5. **Create a `subtasks` table** (currently embedded in frontend mock data but not in DB):
   ```sql
   CREATE TABLE subtasks (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
     user_id uuid NOT NULL,
     title varchar(255) NOT NULL,
     done boolean DEFAULT false,
     created_at timestamptz DEFAULT now(),
     updated_at timestamptz DEFAULT now()
   );
   CREATE INDEX idx_subtasks_task_id ON subtasks(task_id);
   ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users can manage their own subtasks" ON subtasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
   ```

---

### Phase 3: Authentication Integration

1. **Fetch auth docs**: Use `fetch-docs` with `docType: "auth-sdk"`
2. **Create auth store** at `src/lib/stores/auth.ts`:
   - Implement sign-up (email/password), login, logout, session persistence
   - InsForge supports OAuth with GitHub and Google — implement social login buttons
   - On register, auto-create a `profile` row linked to `auth.uid()`
3. **Create login/register page** at `src/routes/auth/+page.svelte`
4. **Protect routes**: Add auth guard in `+layout.svelte` — redirect unauthenticated users to `/auth`

---

### Phase 4: Replace Stores with InsForge SDK Calls

1. **Rewrite `src/lib/stores/tasks.ts`**:
   - Replace `writable<Task[]>(seed)` with InsForge DB queries
   - `tasks.add()` → `insforge.db.from('tasks').insert([{...}])`
   - `tasks.remove()` → `insforge.db.from('tasks').delete().eq('id', taskId)`
   - `tasks.toggleComplete()` → `insforge.db.from('tasks').update({status}).eq('id', taskId)`
   - `tasks.toggleStar()` → `insforge.db.from('tasks').update({starred}).eq('id', taskId)`
   - Keep derived stores (`totalTasks`, `completedTasks`, etc.) but derive from fetched data
   - Map DB column names (`due_date` → `dueDate`, `user_id` → `userId`) in a mapper utility

2. **Rewrite `src/lib/stores/events.ts`**:
   - Fetch from `events` table filtered by selected date
   - Map `startTime`/`endTime` timestamps to `startHour`/`endHour` for the timeline component

3. **Create `src/lib/stores/profile.ts`** (or rewrite existing profile logic):
   - Fetch user profile on login
   - Update productivity score and streak from task completion data

4. **Create `src/lib/stores/activity.ts`**:
   - Log activity entries to the `activity` table on task actions
   - Fetch recent activity for the profile dashboard

5. **Remove `src/lib/data/mockData.ts`** — replace all imports with real data

---

### Phase 5: Real-Time Sync (Optional Enhancement)

1. **Fetch real-time docs**: Use `fetch-docs` with `docType: "real-time"`
2. Subscribe to `tasks` table changes for live updates across devices
3. Subscribe to `events` table changes for calendar sync

---

### Phase 6: Storage Bucket (Optional — for avatars)

1. **Create a bucket** via MCP: `create-bucket` with `bucketName: "avatars"`, `isPublic: true`
2. **Fetch storage docs**: Use `fetch-docs` with `docType: "storage-sdk"`
3. Implement avatar upload in the profile section

---

### Phase 7: Deployment

1. **Fetch deployment docs**: Use `fetch-docs` with `docType: "deployment"`
2. Use `create-deployment` MCP tool to deploy the SvelteKit frontend

---

## 🔑 Auth Configuration (Already set on InsForge)

| Setting                     | Value        |
| --------------------------- | ------------ |
| OAuth Providers             | GitHub, Google |
| Require Email Verification  | Yes          |
| Password Min Length          | 6            |
| Verify Email Method          | Code         |
| Reset Password Method        | Code         |

---

## 🤖 AI Models Available (for future AI features)

- `deepseek/deepseek-v3.2`
- `minimax/minimax-m2.1`
- `x-ai/grok-4.1-fast`
- `anthropic/claude-sonnet-4.5`
- `openai/gpt-4o-mini`
- `google/gemini-3-pro-image-preview` (text + image output)

Could be used for: AI task suggestions, smart scheduling, natural language task input, etc.

---

## ⚠️ Important Notes

- **Use Tailwind CSS 3.4** — do NOT upgrade to v4. Keep `"tailwindcss": "^3.4.14"` in `package.json`.
- **InsForge SDK returns `{data, error}`** structure for all operations — always handle errors.
- **Database inserts require array format**: `[{...}]` not `{...}`.
- **Column naming**: The DB uses `snake_case` (`due_date`, `user_id`, `created_at`) while the frontend uses `camelCase` (`dueDate`, `userId`). Create a mapping utility.
- **`group`, `tag`, `expanded`** fields on tasks are **UI-derived/local state** — they should NOT be stored in the database. Compute `group` and `tag` from `due_date` on the client side.
- **`starred`** needs to be added to the `tasks` table (see Phase 2, step 4).
- **Subtasks** are a separate table with FK to `tasks` — fetch them with a join or separate query.
