import { writable, get, derived } from 'svelte/store';
import { insforge } from '$lib/insforge';
import { userId, user } from '$lib/stores/auth';
import type { DbProfile } from '$lib/types';

// ─── Types ──────────────────────────────────────────────────────────
export type Profile = {
    id: string;
    userId: string;
    name: string;
    email: string;
    avatar: string;
    productivityScore: number;
    streak: number;
};

// ─── Internal stores ────────────────────────────────────────────────
const profileStore = writable<Profile | null>(null);
const profileLoading = writable(true);
const profileSaving = writable(false);

export const isProfileLoading = { subscribe: profileLoading.subscribe };
export const isProfileSaving = { subscribe: profileSaving.subscribe };

// ─── Derived display values ─────────────────────────────────────────
export const displayName = derived(
    [profileStore, user],
    ([$profile, $user]) =>
        $profile?.name || $user?.profile?.name || $user?.email?.split('@')[0] || 'User'
);

export const displayEmail = derived(
    [profileStore, user],
    ([$profile, $user]) => $profile?.email || $user?.email || ''
);

export const displayAvatar = derived(
    [profileStore, user],
    ([$profile, $user]) => $profile?.avatar || $user?.profile?.avatar_url || ''
);

export const displayInitials = derived(displayName, ($name) =>
    $name
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
);

// ─── Fetch profile from DB ─────────────────────────────────────────
async function fetchProfile(): Promise<void> {
    profileLoading.set(true);
    try {
        const uid = get(userId);
        if (!uid) {
            profileStore.set(null);
            return;
        }

        const { data, error } = await insforge.database
            .from('profile')
            .select()
            .eq('user_id', uid)
            .limit(1);

        if (error || !data || data.length === 0) {
            // No profile yet — create one
            const $user = get(user);
            const defaultName =
                $user?.profile?.name || $user?.email?.split('@')[0] || 'User';
            const defaultEmail = $user?.email || '';

            const { data: created, error: createErr } = await insforge.database
                .from('profile')
                .insert({
                    user_id: uid,
                    name: defaultName,
                    email: defaultEmail,
                    avatar: ''
                })
                .select();

            if (createErr || !created || created.length === 0) {
                console.error('Failed to create profile:', createErr);
                profileStore.set(null);
                return;
            }

            profileStore.set(dbToProfile(created[0] as DbProfile));
            return;
        }

        profileStore.set(dbToProfile(data[0] as DbProfile));
    } catch (e) {
        console.error('fetchProfile error:', e);
        profileStore.set(null);
    } finally {
        profileLoading.set(false);
    }
}

// ─── Map DB row → Profile ───────────────────────────────────────────
function dbToProfile(row: DbProfile): Profile {
    return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        email: row.email,
        avatar: row.avatar || '',
        productivityScore: row.productivityScore ?? 0,
        streak: row.streak ?? 0
    };
}

// ─── Update profile name ────────────────────────────────────────────
async function updateName(newName: string): Promise<boolean> {
    const uid = get(userId);
    if (!uid || !newName.trim()) return false;

    profileSaving.set(true);
    try {
        const { error } = await insforge.database
            .from('profile')
            .update({ name: newName.trim(), updatedAt: new Date().toISOString() })
            .eq('user_id', uid);

        if (error) {
            console.error('Update name error:', error);
            return false;
        }

        profileStore.update((p) =>
            p ? { ...p, name: newName.trim() } : p
        );
        return true;
    } catch (e) {
        console.error('updateName error:', e);
        return false;
    } finally {
        profileSaving.set(false);
    }
}

// ─── Upload avatar image ────────────────────────────────────────────
async function uploadAvatar(file: File): Promise<string | null> {
    const uid = get(userId);
    if (!uid) return null;

    profileSaving.set(true);
    try {
        // Use a unique key per user to overwrite old avatars
        const ext = file.name.split('.').pop() || 'jpg';
        const key = `${uid}/avatar-${Date.now()}.${ext}`;

        const { data, error } = await insforge.storage
            .from('avatars')
            .upload(key, file);

        if (error || !data) {
            console.error('Avatar upload error:', error);
            return null;
        }

        return data.url;
    } catch (e) {
        console.error('uploadAvatar error:', e);
        return null;
    } finally {
        profileSaving.set(false);
    }
}

// ─── Update avatar URL in DB ────────────────────────────────────────
async function updateAvatar(avatarUrl: string): Promise<boolean> {
    const uid = get(userId);
    if (!uid) return false;

    profileSaving.set(true);
    try {
        const { error } = await insforge.database
            .from('profile')
            .update({ avatar: avatarUrl, updatedAt: new Date().toISOString() })
            .eq('user_id', uid);

        if (error) {
            console.error('Update avatar error:', error);
            return false;
        }

        profileStore.update((p) =>
            p ? { ...p, avatar: avatarUrl } : p
        );
        return true;
    } catch (e) {
        console.error('updateAvatar error:', e);
        return false;
    } finally {
        profileSaving.set(false);
    }
}

// ─── Public API ─────────────────────────────────────────────────────
export const profile = {
    subscribe: profileStore.subscribe,
    load: fetchProfile,
    clear: () => profileStore.set(null),
    updateName,
    uploadAvatar,
    updateAvatar,

    /** Upload file + save URL to DB in one step */
    changeAvatar: async (file: File): Promise<boolean> => {
        const url = await uploadAvatar(file);
        if (!url) return false;
        return updateAvatar(url);
    }
};
