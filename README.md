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
    profile/+page.svelte
  lib/
    components/
    components/profile/
    stores/
    data/
```

## Features

- My Day and Calendar views
- Profile dashboard analytics page
- Reusable component architecture
- Local state with Svelte stores and derived stats
- Add, delete, complete, expand, and star tasks
- Activity chart, insights, settings cards, and recent activity feed
- Responsive mobile shell (max width ~420px)
- Smooth transitions and interaction animations
