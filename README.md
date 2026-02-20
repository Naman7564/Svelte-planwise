# Task & Calendar (SvelteKit + Tailwind)

A mobile-first, dark iOS-style task and calendar app built with SvelteKit and Tailwind CSS.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
npm run preview
```

## Project Structure

```text
src/
  routes/
    +layout.svelte
    +page.svelte
    calendar/+page.svelte
    all/+page.svelte
  lib/
    components/
    stores/
    data/
```

## Features

- My Day, Calendar, and All Tasks views
- Reusable component architecture
- Local state with Svelte stores
- Add, delete, complete, expand, and star tasks
- Collapsible task groups
- Calendar timeline powered by mock event data
- Responsive mobile shell (max width ~420px)
- Smooth transitions and interaction animations
