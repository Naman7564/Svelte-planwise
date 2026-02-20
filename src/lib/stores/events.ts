import { writable } from 'svelte/store';
import { initialEvents, type EventItem } from '$lib/data/mockData';

const eventsStore = writable<EventItem[]>(initialEvents);

export const events = {
  subscribe: eventsStore.subscribe,
  // Event card stars are local-only interactions in the mock timeline.
  toggleStar: (eventId: string) =>
    eventsStore.update((items) =>
      items.map((event) => (event.id === eventId ? { ...event, starred: !event.starred } : event))
    )
};
