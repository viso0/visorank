import { supabase, isSupabaseConfigured, DbProduct } from '../lib/supabase';
import { Product, Category, ClickEvent, Favorite } from '../types';
import { INITIAL_PRODUCTS, CATEGORIES } from '../data/products';

// Helper to convert DbProduct to Product
export function mapDbProductToProduct(db: DbProduct, index = 0): Product {
  return {
    id: db.id,
    slug: db.slug,
    name: db.name,
    tagline: db.tagline,
    description: db.description,
    category: db.category_name,
    logo: db.logo_url,
    websiteUrl: db.website_url,
    founder: db.founder_name,
    founderId: db.founder_id || undefined,
    founderTwitter: db.founder_twitter || undefined,
    clicks: db.clicks_count,
    views: db.views_count,
    score: db.score,
    rank: index + 1,
    createdAt: new Date(db.created_at).getTime(),
    featured: db.tier === 'Featured' || db.tier === 'Premium',
    boosted: db.tier === 'Boost',
    premium: db.tier === 'Premium',
    tier: db.tier,
    status: db.status,
    tags: db.tags || [],
    pricingModel: db.pricing_model,
    launchDate: new Date(db.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    })
  };
}

export const productService = {
  /**
   * Fetch approved products from Supabase (or fallback if unconfigured)
   */
  async fetchProducts(filter?: {
    category?: string;
    search?: string;
    includePending?: boolean;
  }): Promise<{ products: Product[]; isFromSupabase: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return { products: INITIAL_PRODUCTS, isFromSupabase: false };
    }

    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('clicks_count', { ascending: false });

      if (!filter?.includePending) {
        query = query.eq('status', 'approved');
      }

      if (filter?.category && filter.category !== 'All') {
        query = query.eq('category_name', filter.category);
      }

      if (filter?.search) {
        query = query.or(`name.ilike.%${filter.search}%,tagline.ilike.%${filter.search}%,tags.cs.{${filter.search}}`);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Supabase fetchProducts error, falling back:', error.message);
        return { products: INITIAL_PRODUCTS, isFromSupabase: false, error: error.message };
      }

      if (!data || data.length === 0) {
        return { products: INITIAL_PRODUCTS, isFromSupabase: false };
      }

      const mapped = (data as DbProduct[]).map((p, idx) => mapDbProductToProduct(p, idx));
      return { products: mapped, isFromSupabase: true };
    } catch (err: any) {
      return { products: INITIAL_PRODUCTS, isFromSupabase: false, error: err.message };
    }
  },

  /**
   * Fetch single product by slug
   */
  async fetchProductBySlug(slug: string): Promise<{ product: Product | null; isFromSupabase: boolean }> {
    if (!isSupabaseConfigured) {
      const found = INITIAL_PRODUCTS.find(p => p.slug === slug) || null;
      return { product: found, isFromSupabase: false };
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        const found = INITIAL_PRODUCTS.find(p => p.slug === slug) || null;
        return { product: found, isFromSupabase: false };
      }

      return { product: mapDbProductToProduct(data as DbProduct), isFromSupabase: true };
    } catch {
      const found = INITIAL_PRODUCTS.find(p => p.slug === slug) || null;
      return { product: found, isFromSupabase: false };
    }
  },

  /**
   * Track verified product click into Supabase click_events and update score atomically
   */
  async recordClick(slug: string, referrer?: string): Promise<{ websiteUrl?: string; clicks?: number; success: boolean }> {
    if (!isSupabaseConfigured) {
      return { success: true };
    }

    try {
      // 1. Try invoking atomic RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('record_product_click', {
        target_slug: slug,
        user_referrer: referrer || document.referrer || null,
        client_ua: navigator.userAgent || null
      });

      if (!rpcError && rpcData?.success) {
        return {
          websiteUrl: rpcData.website_url,
          clicks: rpcData.clicks,
          success: true
        };
      }

      // 2. Fallback direct table update if RPC is missing
      const { data: prod } = await supabase
        .from('products')
        .select('id, website_url, clicks_count')
        .eq('slug', slug)
        .single();

      if (prod) {
        await supabase.from('click_events').insert({
          product_id: prod.id,
          product_slug: slug,
          referrer: referrer || document.referrer || null,
          user_agent: navigator.userAgent
        });

        await supabase
          .from('products')
          .update({ clicks_count: (prod.clicks_count || 0) + 1 })
          .eq('id', prod.id);

        return {
          websiteUrl: prod.website_url,
          clicks: (prod.clicks_count || 0) + 1,
          success: true
        };
      }

      return { success: false };
    } catch (err) {
      console.error('Click tracking error:', err);
      return { success: false };
    }
  },

  /**
   * Upload logo to Supabase Storage bucket 'product-logos'
   */
  async uploadLogo(file: File, slug: string): Promise<string | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    try {
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `${slug}-${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from('product-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error || !data) {
        console.error('Storage upload error:', error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-logos')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Logo upload error:', err);
      return null;
    }
  },

  /**
   * Submit product to Supabase Database
   */
  async submitProduct(productData: {
    name: string;
    slug: string;
    tagline: string;
    description: string;
    category: string;
    websiteUrl: string;
    logoUrl: string;
    founder: string;
    founderId?: string;
    founderTwitter?: string;
    pricingModel: 'Free' | 'Freemium' | 'Free Trial' | 'Paid';
    tier: 'Free' | 'Boost' | 'Featured' | 'Premium';
    tags: string[];
  }): Promise<{ product?: Product; error?: string }> {
    if (!isSupabaseConfigured) {
      // Return typed Product for unconfigured state
      const fallbackProd: Product = {
        id: 'mock_' + Date.now(),
        slug: productData.slug,
        name: productData.name,
        tagline: productData.tagline,
        description: productData.description,
        category: productData.category,
        logo: productData.logoUrl,
        websiteUrl: productData.websiteUrl,
        founder: productData.founder,
        founderId: productData.founderId,
        founderTwitter: productData.founderTwitter,
        clicks: 0,
        rank: 99,
        createdAt: Date.now(),
        tier: productData.tier,
        status: 'approved',
        tags: productData.tags,
        pricingModel: productData.pricingModel,
        launchDate: 'Just now'
      };
      return { product: fallbackProd };
    }

    try {
      const insertPayload = {
        slug: productData.slug,
        name: productData.name,
        tagline: productData.tagline,
        description: productData.description,
        website_url: productData.websiteUrl,
        logo_url: productData.logoUrl,
        category_name: productData.category,
        founder_id: productData.founderId || null,
        founder_name: productData.founder,
        founder_twitter: productData.founderTwitter || null,
        pricing_model: productData.pricingModel,
        tier: productData.tier,
        status: 'approved', // Auto-approved or set to 'pending' if moderation is enabled
        tags: productData.tags,
        clicks_count: 0,
        views_count: 0,
        score: 0.0
      };

      const { data, error } = await supabase
        .from('products')
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { product: mapDbProductToProduct(data as DbProduct) };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  /**
   * Favorites CRUD
   */
  async toggleFavorite(productId: string, userId: string): Promise<{ isFavorited: boolean }> {
    if (!isSupabaseConfigured) return { isFavorited: false };

    try {
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        await supabase.from('favorites').delete().eq('id', existing.id);
        return { isFavorited: false };
      } else {
        await supabase.from('favorites').insert({ user_id: userId, product_id: productId });
        return { isFavorited: true };
      }
    } catch {
      return { isFavorited: false };
    }
  },

  async isProductFavorited(productId: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;
    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();
      return !!data;
    } catch {
      return false;
    }
  },

  async getUserFavorites(userId: string): Promise<Product[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id, products(*)')
        .eq('user_id', userId);

      if (error || !data) return [];
      return data
        .map((f: any) => f.products ? mapDbProductToProduct(f.products) : null)
        .filter(Boolean) as Product[];
    } catch {
      return [];
    }
  },

  /**
   * Admin: Approve or Reject a Product
   */
  async setProductStatus(productId: string | number, status: 'approved' | 'rejected'): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase
        .from('products')
        .update({ status })
        .eq('id', productId);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Founder Analytics: Click Events
   */
  async getClickAnalytics(productId: string | number): Promise<ClickEvent[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('click_events')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error || !data) return [];
      return data.map((c: any) => ({
        id: c.id,
        productId: c.product_id,
        productSlug: c.product_slug,
        referrer: c.referrer,
        userAgent: c.user_agent,
        createdAt: c.created_at
      }));
    } catch {
      return [];
    }
  },

  /**
   * Submit a product report (broken link, spam, incorrect info, copyright)
   */
  async submitReport(reportData: {
    productId: string | number;
    productSlug: string;
    reporterEmail?: string;
    reason: string;
    details?: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      console.log('Report submitted (local mode):', reportData);
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          product_id: String(reportData.productId),
          product_slug: reportData.productSlug,
          reporter_email: reportData.reporterEmail || null,
          reason: reportData.reason,
          details: reportData.details || null
        });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Submit a promotion interest / waitlist lead
   */
  async submitPromotionInterest(data: {
    email: string;
    planId: string;
    productSlug?: string;
    notes?: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      console.log('Promotion interest submitted (local mode):', data);
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('promotion_interests')
        .insert({
          email: data.email,
          plan_id: data.planId,
          product_slug: data.productSlug || null,
          notes: data.notes || null
        });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};
