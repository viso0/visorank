import { supabase, isSupabaseConfigured, DbProfile } from '../lib/supabase';
import { User } from '../types';

export const authService = {
  /**
   * Listen to auth state changes from Supabase
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    if (!isSupabaseConfigured) {
      return { unsubscribe: () => {} };
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await authService.getUserProfile(session.user.id, session.user.email || '');
        callback(user);
      } else {
        callback(null);
      }
    });

    return {
      unsubscribe: () => authListener.subscription.unsubscribe()
    };
  },

  /**
   * Get user profile from public.profiles
   */
  async getUserProfile(userId: string, fallbackEmail: string): Promise<User> {
    if (!isSupabaseConfigured) {
      return {
        id: userId,
        email: fallbackEmail,
        name: fallbackEmail.split('@')[0] || 'Founder',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: 'founder'
      };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return {
          id: userId,
          email: fallbackEmail,
          name: fallbackEmail.split('@')[0] || 'Founder',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          role: 'founder'
        };
      }

      const profile = data as DbProfile;
      return {
        id: profile.id,
        email: profile.email || fallbackEmail,
        name: profile.full_name || profile.username || fallbackEmail.split('@')[0] || 'Founder',
        avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: profile.role,
        website: profile.website || undefined,
        twitter: profile.twitter || undefined
      };
    } catch {
      return {
        id: userId,
        email: fallbackEmail,
        name: fallbackEmail.split('@')[0] || 'Founder',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: 'founder'
      };
    }
  },

  /**
   * Sign up with Supabase Auth
   */
  async signUp(email: string, password: string, fullName: string, role: 'founder' | 'user' = 'founder'): Promise<{ user?: User; error?: string }> {
    if (!isSupabaseConfigured) {
      const mockUser: User = {
        id: 'usr_' + Date.now(),
        email,
        name: fullName.trim() || email.split('@')[0],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role
      };
      return { user: mockUser };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const user = await authService.getUserProfile(data.user.id, data.user.email || email);
        return { user };
      }

      return { error: 'Verification email sent. Please check your inbox.' };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  /**
   * Sign in with Supabase Auth
   */
  async signIn(email: string, password: string): Promise<{ user?: User; error?: string }> {
    if (!isSupabaseConfigured) {
      const mockUser: User = {
        id: 'usr_' + Date.now(),
        email,
        name: email.split('@')[0],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: email.includes('admin') ? 'admin' : 'founder'
      };
      return { user: mockUser };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const user = await authService.getUserProfile(data.user.id, data.user.email || email);
        return { user };
      }

      return { error: 'Sign in failed.' };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  /**
   * Sign in with OAuth (GitHub or Google)
   */
  async signInWithOAuth(provider: 'github' | 'google'): Promise<{ error?: string }> {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase credentials not configured' };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  }
};
