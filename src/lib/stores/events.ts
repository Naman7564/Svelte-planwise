import { writable, get } from 'svelte/store';
import { insforge } from '$lib/insforge';
import { dbEventToEventItem } from '$lib/mappers';
import { userId } from '$lib/stores/auth';
import type { EventItem, DbEvent } from '$lib/types';

// ─── Internal store ─────────────────────────────────────────────────
const eventsStore = writable<EventItem[]>([]);
const eventsLoading = writable(true);

export const isEventsLoading = { subscribe: eventsLoading.subscribe };

// ─── Fetch events for a specific date ───────────────────────────────
async function fetchEvents(dateStr?: string): Promise<void> {
  eventsLoading.set(true);
  try {
    const uid = get(userId);
    if (!uid) {
      eventsStore.set([]);
      return;
    }

    let query = insforge.database
      .from('events')
      .select()
      .eq('user_id', uid)
      .order('startTime', { ascending: true });

    // If a date is provided, filter events for that day
    if (dateStr) {
      const dayStart = new Date(dateStr);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dateStr);
      dayEnd.setHours(23, 59, 59, 999);

      query = query
        .gte('date', dayStart.toISOString())
        .lte('date', dayEnd.toISOString());
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('Failed to fetch events:', error);
      eventsStore.set([]);
      return;
    }

    eventsStore.set((data as DbEvent[]).map(dbEventToEventItem));
  } catch (e) {
    console.error('fetchEvents error:', e);
    eventsStore.set([]);
  } finally {
    eventsLoading.set(false);
  }
}

// ─── Public API ─────────────────────────────────────────────────────
export const events = {
  subscribe: eventsStore.subscribe,

  /** Load events (default: today). Call after auth. */
  load: (dateStr?: string) => fetchEvents(dateStr),

  /** Clear on logout */
  clear: () => eventsStore.set([]),

  /** Local-only star toggle (no DB column) */
  toggleStar: (eventId: string) =>
    eventsStore.update((items) =>
      items.map((ev) => (ev.id === eventId ? { ...ev, starred: !ev.starred } : ev))
    ),

  /** Add a new event */
  add: async (input: {
    title: string;
    date: string;
    startHour: number;
    endHour: number;
    tag?: string;
  }) => {
    const uid = get(userId);
    if (!uid) return;

    const startTime = new Date(input.date);
    startTime.setHours(Math.floor(input.startHour), (input.startHour % 1) * 60, 0, 0);

    const endTime = new Date(input.date);
    endTime.setHours(Math.floor(input.endHour), (input.endHour % 1) * 60, 0, 0);

    const { data, error } = await insforge.database
      .from('events')
      .insert({
        user_id: uid,
        title: input.title,
        date: new Date(input.date).toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        tag: input.tag ?? 'General'
      })
      .select();

    if (error) {
      console.error('Add event error:', error);
      return;
    }

    if (data && data[0]) {
      const mapped = dbEventToEventItem(data[0] as DbEvent);
      eventsStore.update((items) => [...items, mapped].sort((a, b) => a.startHour - b.startHour));
    }
  },

  /** Delete an event */
  remove: async (eventId: string) => {
    eventsStore.update((items) => items.filter((ev) => ev.id !== eventId));
    const { error } = await insforge.database.from('events').delete().eq('id', eventId);
    if (error) {
      console.error('Remove event error:', error);
      await fetchEvents();
    }
  }
};
