export interface Product {
  id: string | number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  logo: string;
  websiteUrl: string;
  founder: string;
  founderId?: string;
  founderTwitter?: string;
  clicks: number;
  views?: number;
  rank: number;
  score?: number;
  createdAt: number;
  featured?: boolean;
  boosted?: boolean;
  premium?: boolean;
  tier: 'Free' | 'Boost' | 'Featured' | 'Premium';
  status: 'pending' | 'approved' | 'rejected';
  tags: string[];
  pricingModel: 'Free' | 'Freemium' | 'Free Trial' | 'Paid';
  launchDate: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sortOrder: number;
}

export interface PromotionPlan {
  id: string;
  name: string;
  priceUSD: number;
  priceINR: number;
  duration: string;
  popular?: boolean;
  description: string;
  features: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'founder' | 'admin';
  website?: string;
  twitter?: string;
}

export interface ClickEvent {
  id: string;
  productId: string;
  productSlug: string;
  referrer?: string;
  userAgent?: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export interface Promotion {
  id: string;
  productId: string;
  userId: string;
  planId: string;
  tier: 'Boost' | 'Featured' | 'Premium';
  amountUSD: number;
  status: 'active' | 'expired' | 'cancelled';
  startsAt: string;
  expiresAt: string;
  createdAt: string;
}
