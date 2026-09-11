-- ============================================================================
-- VisoRank Supabase Database Schema & Production Migrations
-- Complete relational architecture for product discovery, tracking, & ranking
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. Profiles Table (Extends Supabase auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'founder' CHECK (role IN ('user', 'founder', 'admin')),
    website TEXT,
    twitter TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for profile queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- ============================================================================
-- 3. Categories Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT NOT NULL DEFAULT '⚡',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- ============================================================================
-- 4. Products Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    website_url TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    founder_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    founder_name TEXT NOT NULL,
    founder_twitter TEXT,
    pricing_model TEXT NOT NULL DEFAULT 'Freemium' CHECK (pricing_model IN ('Free', 'Freemium', 'Free Trial', 'Paid')),
    tags TEXT[] NOT NULL DEFAULT '{}',
    tier TEXT NOT NULL DEFAULT 'Free' CHECK (tier IN ('Free', 'Boost', 'Featured', 'Premium')),
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    clicks_count INT NOT NULL DEFAULT 0,
    views_count INT NOT NULL DEFAULT 0,
    score FLOAT8 NOT NULL DEFAULT 0.0,
    featured_until TIMESTAMPTZ,
    boosted_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_name);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_tier ON public.products(tier);
CREATE INDEX IF NOT EXISTS idx_products_clicks ON public.products(clicks_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_score ON public.products(score DESC);
CREATE INDEX IF NOT EXISTS idx_products_founder ON public.products(founder_id);

-- ============================================================================
-- 5. Click Events Table (Real Telemetry & Analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.click_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    product_slug TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    referrer TEXT,
    user_agent TEXT,
    ip_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_click_events_product ON public.click_events(product_id);
CREATE INDEX IF NOT EXISTS idx_click_events_slug ON public.click_events(product_slug);
CREATE INDEX IF NOT EXISTS idx_click_events_created_at ON public.click_events(created_at);

-- ============================================================================
-- 6. Favorites Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product ON public.favorites(product_id);

-- ============================================================================
-- 7. Promotions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('Boost', 'Featured', 'Premium')),
    amount_usd NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotions_product ON public.promotions(product_id);
CREATE INDEX IF NOT EXISTS idx_promotions_user ON public.promotions(user_id);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON public.promotions(status);

-- ============================================================================
-- 8. Storage Bucket for Logos
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-logos', 'product-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Anyone can view logos
CREATE POLICY "Public Access to Product Logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-logos');

-- Storage RLS: Authenticated users can upload logos
CREATE POLICY "Authenticated Users Can Upload Product Logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-logos');

-- ============================================================================
-- 9. Automatic Profile Creation on Signup (Trigger)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, username, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::text, 1, 6)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'founder')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 10. Admin Role Helper Function
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- 11. Real Leaderboard & Ranking Calculation Function
-- ============================================================================
-- Time-decay gravity formula:
-- score = clicks * tier_multiplier / (hours_since_launch + 2)^1.4
CREATE OR REPLACE FUNCTION public.calculate_product_score(
    clicks_count INT,
    tier TEXT,
    created_at TIMESTAMPTZ
)
RETURNS FLOAT8 AS $$
DECLARE
    tier_mult FLOAT8 := 1.0;
    hours_age FLOAT8;
BEGIN
    IF tier = 'Premium' THEN
        tier_mult := 2.5;
    ELSIF tier = 'Featured' THEN
        tier_mult := 1.8;
    ELSIF tier = 'Boost' THEN
        tier_mult := 1.3;
    END IF;

    hours_age := GREATEST(EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600.0, 0.1);
    RETURN (clicks_count * tier_mult) / POWER(hours_age + 2.0, 1.4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 12. Atomic Click Tracking & Leaderboard Recalculation RPC
-- ============================================================================
CREATE OR REPLACE FUNCTION public.record_product_click(
    target_slug TEXT,
    user_referrer TEXT DEFAULT NULL,
    client_ua TEXT DEFAULT NULL,
    ip_hash_val TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    prod RECORD;
    new_score FLOAT8;
BEGIN
    -- Select product
    SELECT * INTO prod FROM public.products WHERE slug = target_slug;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Product not found');
    END IF;

    -- Insert telemetry click event
    INSERT INTO public.click_events (product_id, product_slug, user_id, referrer, user_agent, ip_hash)
    VALUES (prod.id, prod.slug, auth.uid(), user_referrer, client_ua, ip_hash_val);

    -- Calculate updated algorithmic score
    new_score := public.calculate_product_score(prod.clicks_count + 1, prod.tier, prod.created_at);

    -- Atomically update clicks count and score
    UPDATE public.products
    SET clicks_count = clicks_count + 1,
        score = new_score,
        updated_at = NOW()
    WHERE id = prod.id;

    RETURN json_build_object(
        'success', true,
        'slug', prod.slug,
        'name', prod.name,
        'website_url', prod.website_url,
        'clicks', prod.clicks_count + 1,
        'score', new_score
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 13. Row Level Security (RLS) Policies
-- ============================================================================

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Categories RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage categories"
ON public.categories FOR ALL
USING (public.is_admin());

-- Products RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Approved products are viewable by anyone. Pending/rejected are viewable only by owner or admin.
CREATE POLICY "Public can view approved products"
ON public.products FOR SELECT
USING (
    status = 'approved' 
    OR auth.uid() = founder_id 
    OR public.is_admin()
);

-- Authenticated users can insert products
CREATE POLICY "Authenticated users can submit products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = founder_id
);

-- Founders can update their own products (or admins can update any)
CREATE POLICY "Founders can update their own products"
ON public.products FOR UPDATE
USING (
    auth.uid() = founder_id OR public.is_admin()
)
WITH CHECK (
    auth.uid() = founder_id OR public.is_admin()
);

-- Founders or admins can delete products
CREATE POLICY "Founders or admins can delete products"
ON public.products FOR DELETE
USING (
    auth.uid() = founder_id OR public.is_admin()
);

-- Click Events RLS
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

-- Product owners or admins can view telemetry for their products
CREATE POLICY "Founders can view click events for their products"
ON public.click_events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.products
        WHERE products.id = click_events.product_id
        AND (products.founder_id = auth.uid() OR public.is_admin())
    )
);

-- Anyone can insert click events (handled also by RPC)
CREATE POLICY "Anyone can log click events"
ON public.click_events FOR INSERT
WITH CHECK (true);

-- Favorites RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
ON public.favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
ON public.favorites FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
ON public.favorites FOR DELETE
USING (auth.uid() = user_id);

-- Promotions RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own promotions"
ON public.promotions FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users can create promotions"
ON public.promotions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update promotions"
ON public.promotions FOR UPDATE
USING (public.is_admin());

-- ============================================================================
-- 14. Reports Table (Content Moderation & Flagging)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    product_slug TEXT NOT NULL,
    reporter_email TEXT,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_product ON public.reports(product_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a report" ON public.reports;
CREATE POLICY "Anyone can submit a report"
ON public.reports FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view reports" ON public.reports;
CREATE POLICY "Only admins can view reports"
ON public.reports FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can update reports" ON public.reports;
CREATE POLICY "Only admins can update reports"
ON public.reports FOR UPDATE
USING (public.is_admin());

-- ============================================================================
-- 15. Promotion Interests Table (Waitlist & Beta Lead Capture)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.promotion_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    product_slug TEXT,
    plan_id TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotion_interests_email ON public.promotion_interests(email);
CREATE INDEX IF NOT EXISTS idx_promotion_interests_plan ON public.promotion_interests(plan_id);

ALTER TABLE public.promotion_interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit promotion interest" ON public.promotion_interests;
CREATE POLICY "Anyone can submit promotion interest"
ON public.promotion_interests FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view promotion interests" ON public.promotion_interests;
CREATE POLICY "Only admins can view promotion interests"
ON public.promotion_interests FOR SELECT
USING (public.is_admin());

-- ============================================================================
-- 16. Seed Data (Initial Categories)
-- ============================================================================
INSERT INTO public.categories (name, slug, description, icon, sort_order) VALUES
('AI Tools', 'ai-tools', 'Workbenches, fine-tuning, vector search, and LLM utilities', '⚡', 1),
('AI Agents', 'ai-agents', 'Autonomous browser, workflow, and robotic desktop bots', '🤖', 2),
('Developer Tools', 'developer-tools', 'IDEs, compilers, CI/CD, terminals, and cloud SDKs', '💻', 3),
('SaaS', 'saas', 'Subscription software for modern internet operations', '🛠️', 4),
('Marketing & Sales', 'marketing-sales', 'Attribution engines, outbound bots, and cold emailers', '📈', 5),
('Productivity & Ops', 'productivity-ops', 'Calendars, docs, project workspaces, and automations', '🎨', 6),
('Fintech & Web3', 'fintech-web3', 'Payment rails, crypto infrastructure, and invoicing', '💳', 7),
('Design & Creative', 'design-creative', '3D tools, vector design, canvas suites, and styling', '🔍', 8)
ON CONFLICT (slug) DO NOTHING;
