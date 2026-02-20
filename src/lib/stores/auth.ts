import { writable, derived, get } from 'svelte/store';
import { insforge } from '$lib/insforge';
import type { AuthUser } from '$lib/types';

// ─── Stores ─────────────────────────────────────────────────────────
export const user = writable<AuthUser | null>(null);
export const loading = writable(true);
export const authError = writable<string | null>(null);
export const isAuthenticated = derived(user, ($u) => $u !== null);
export const userId = derived(user, ($u) => $u?.id ?? null);

// ─── Helpers ────────────────────────────────────────────────────────
function clearError() {
    authError.set(null);
}

// ─── Initialize session (call on app start) ─────────────────────────
export async function initSession(): Promise<void> {
    loading.set(true);
    try {
        const { data, error } = await insforge.auth.getCurrentSession();
        if (error) {
            user.set(null);
        } else if (data?.session?.user) {
            user.set(data.session.user as AuthUser);
        } else {
            user.set(null);
        }
    } catch {
        user.set(null);
    } finally {
        loading.set(false);
    }
}

// ─── Sign Up ────────────────────────────────────────────────────────
export async function signUp(
    email: string,
    password: string,
    name: string
): Promise<{ requireEmailVerification: boolean }> {
    clearError();
    loading.set(true);
    try {
        const { data, error } = await insforge.auth.signUp({ email, password, name });
        if (error) {
            authError.set(error.message || 'Sign up failed');
            return { requireEmailVerification: false };
        }
        if (data?.requireEmailVerification) {
            return { requireEmailVerification: true };
        }
        if (data?.user) {
            user.set(data.user as AuthUser);
        }
        return { requireEmailVerification: false };
    } catch (e: any) {
        authError.set(e?.message || 'Unexpected error');
        return { requireEmailVerification: false };
    } finally {
        loading.set(false);
    }
}

// ─── Verify Email ───────────────────────────────────────────────────
export async function verifyEmail(email: string, otp: string): Promise<boolean> {
    clearError();
    loading.set(true);
    try {
        const { data, error } = await insforge.auth.verifyEmail({ email, otp });
        if (error) {
            authError.set(error.message || 'Verification failed');
            return false;
        }
        if (data?.user) {
            user.set(data.user as AuthUser);
        }
        return true;
    } catch (e: any) {
        authError.set(e?.message || 'Unexpected error');
        return false;
    } finally {
        loading.set(false);
    }
}

// ─── Resend Verification Email ──────────────────────────────────────
export async function resendVerification(email: string): Promise<boolean> {
    clearError();
    try {
        const { data, error } = await insforge.auth.resendVerificationEmail({ email });
        if (error) {
            authError.set(error.message || 'Failed to resend');
            return false;
        }
        return data?.success ?? false;
    } catch (e: any) {
        authError.set(e?.message || 'Unexpected error');
        return false;
    }
}

// ─── Sign In ────────────────────────────────────────────────────────
export async function signIn(email: string, password: string): Promise<boolean> {
    clearError();
    loading.set(true);
    try {
        const { data, error } = await insforge.auth.signInWithPassword({ email, password });
        if (error) {
            authError.set(error.message || 'Login failed');
            return false;
        }
        if (data?.user) {
            user.set(data.user as AuthUser);
        }
        return true;
    } catch (e: any) {
        authError.set(e?.message || 'Unexpected error');
        return false;
    } finally {
        loading.set(false);
    }
}

// ─── OAuth ──────────────────────────────────────────────────────────
export async function signInWithOAuth(provider: 'google' | 'github'): Promise<void> {
    clearError();
    try {
        const { error } = await insforge.auth.signInWithOAuth({
            provider,
            redirectTo: window.location.origin + '/'
        });

        if (error) {
            authError.set(error.message || 'OAuth error');
        }
    } catch (e: any) {
        authError.set(e?.message || 'OAuth error');
    }
}

// ─── Sign Out ───────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
    clearError();
    try {
        await insforge.auth.signOut();
    } catch {
        // ignore
    } finally {
        user.set(null);
    }
}

// ─── Password Reset ─────────────────────────────────────────────────
export async function sendResetEmail(email: string): Promise<boolean> {
    clearError();
    try {
        const { data, error } = await insforge.auth.sendResetPasswordEmail({ email });
        if (error) {
            authError.set(error.message || 'Failed to send reset email');
            return false;
        }
        return data?.success ?? false;
    } catch (e: any) {
        authError.set(e?.message || 'Unexpected error');
        return false;
    }
}

export async function resetPassword(otp: string, newPassword: string): Promise<boolean> {
    clearError();
    try {
        const { data, error } = await insforge.auth.resetPassword({ otp, newPassword });
        if (error) {
            authError.set(error.message || 'Reset failed');
            return false;
        }
        return true;
    } catch (e: any) {
        authError.set(e?.message || 'Unexpected error');
        return false;
    }
}

export async function exchangeResetCode(
    email: string,
    code: string
): Promise<string | null> {
    clearError();
    try {
        const { data, error } = await insforge.auth.exchangeResetPasswordToken({
            email,
            code
        });
        if (error) {
            authError.set(error.message || 'Invalid code');
            return null;
        }
        return data?.token ?? null;
    } catch (e: any) {
        authError.set(e?.message || 'Unexpected error');
        return null;
    }
}
