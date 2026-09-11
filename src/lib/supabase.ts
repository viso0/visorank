import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || (import.meta.env as any).NEXT_PUBLIC_SUPABASE_URL || '') as string;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || (import.meta.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || '') as string;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' &&
  supabaseUrl.startsWith('https://')
);

// If configured, create real client; otherwise create a dummy client to prevent runtime errors
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

// Supabase Database Row Definitions for Type Safety
export interface DbProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: 'user' | 'founder' | 'admin';
  website: string | null;
  twitter: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface DbProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  website_url: string;
  logo_url: string;
  category_id: string | null;
  category_name: string;
  founder_id: string | null;
  founder_name: string;
  founder_twitter: string | null;
  pricing_model: 'Free' | 'Freemium' | 'Free Trial' | 'Paid';
  tags: string[];
  tier: 'Free' | 'Boost' | 'Featured' | 'Premium';
  status: 'pending' | 'approved' | 'rejected';
  clicks_count: number;
  views_count: number;
  score: number;
  featured_until: string | null;
  boosted_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbClickEvent {
  id: string;
  product_id: string;
  product_slug: string;
  user_id: string | null;
  referrer: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  created_at: string;
}

export interface DbFavorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface DbPromotion {
  id: string;
  product_id: string;
  user_id: string;
  plan_id: string;
  tier: 'Boost' | 'Featured' | 'Premium';
  amount_usd: number;
  currency: string;
  status: 'active' | 'expired' | 'cancelled';
  starts_at: string;
  expires_at: string;
  created_at: string;
}

export interface DbReport {
  id: string;
  product_id: string;
  product_slug: string;
  reporter_email?: string | null;
  reason: string;
  details?: string | null;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface DbPromotionInterest {
  id: string;
  email: string;
  product_slug?: string | null;
  plan_id: string;
  notes?: string | null;
  created_at: string;
}
