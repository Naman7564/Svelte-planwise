import { get } from 'svelte/store';
import { insforge } from '$lib/insforge';
import { userId } from '$lib/stores/auth';
import { tasks } from '$lib/stores/tasks';
import { events } from '$lib/stores/events';

let connected = false;
let subscribedChannels: string[] = [];

/**
 * Connect to InsForge realtime and subscribe to user-specific channels.
 * Call after successful authentication.
 */
export async function connectRealtime(): Promise<void> {
    const uid = get(userId);
    if (!uid || connected) return;

    try {
        await insforge.realtime.connect();
        connected = true;

        // Subscribe to tasks channel
        const taskChannel = `tasks:${uid}`;
        const { ok: taskOk } = await insforge.realtime.subscribe(taskChannel);
        if (taskOk) subscribedChannels.push(taskChannel);

        // Subscribe to events channel
        const eventChannel = `events:${uid}`;
        const { ok: eventOk } = await insforge.realtime.subscribe(eventChannel);
        if (eventOk) subscribedChannels.push(eventChannel);

        // Listen for task changes → reload tasks
        insforge.realtime.on('INSERT_task', () => tasks.load());
        insforge.realtime.on('UPDATE_task', () => tasks.load());
        insforge.realtime.on('DELETE_task', () => tasks.load());

        // Listen for event changes → reload events
        insforge.realtime.on('INSERT_event', () => events.load());
        insforge.realtime.on('UPDATE_event', () => events.load());
        insforge.realtime.on('DELETE_event', () => events.load());

        console.log('[Realtime] Connected and subscribed');
    } catch (e) {
        console.warn('[Realtime] Connection failed:', e);
    }
}

/**
 * Disconnect and clean up.
 * Call on logout.
 */
export function disconnectRealtime(): void {
    try {
        for (const ch of subscribedChannels) {
            insforge.realtime.unsubscribe(ch);
        }
        subscribedChannels = [];
        insforge.realtime.disconnect();
    } catch {
        // ignore
    } finally {
        connected = false;
    }
}
