import React, { useState, useRef } from 'react';
import { Sparkles, Flame, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES, PROMOTION_PLANS } from '../data/products';
import { productService } from '../services/productService';
import { isSupabaseConfigured } from '../lib/supabase';

interface SubmitPageProps {
  onSubmitProduct: (product: Omit<Product, 'id' | 'clicks' | 'rank' | 'createdAt'>) => void;
  onNavigate: (page: string) => void;
}

export const SubmitPage: React.FC<SubmitPageProps> = ({
  onSubmitProduct,
  onNavigate
}) => {
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('AI Tools');
  const [logoEmoji, setLogoEmoji] = useState('🚀');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [founder, setFounder] = useState('');
  const [founderTwitter, setFounderTwitter] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('free');
  const [pricingModel, setPricingModel] = useState<'Free' | 'Freemium' | 'Free Trial' | 'Paid'>('Freemium');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojiOptions = ['🚀', '⚡', '🤖', '💻', '🛠️', '📈', '🎨', '🎙️', '💳', '🚢', '🔍', '🧠', '🛡️', '📦'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError('Logo file size must be less than 2MB.');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !websiteUrl.trim() || !tagline.trim() || !description.trim() || !founder.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const tierMap: Record<string, 'Free' | 'Boost' | 'Featured' | 'Premium'> = {
      free: 'Free',
      boost: 'Boost',
      featured: 'Featured',
      premium: 'Premium'
    };

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const selectedTier = tierMap[selectedPlanId] || 'Free';

    try {
      let finalLogo = logoEmoji;

      // If user uploaded a logo file, upload to Supabase Storage bucket 'product-logos'
      if (logoFile) {
        const uploadedUrl = await productService.uploadLogo(logoFile, slug);
        if (uploadedUrl) {
          finalLogo = uploadedUrl;
        } else if (logoPreview) {
          finalLogo = logoPreview;
        }
      }

      // Submit to Supabase Database
      const submitRes = await productService.submitProduct({
        name,
        slug,
        tagline,
        description,
        category,
        websiteUrl: websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`,
        logoUrl: finalLogo,
        founder,
        founderTwitter: founderTwitter ? (founderTwitter.startsWith('@') ? founderTwitter : `@${founderTwitter}`) : undefined,
        pricingModel,
        tier: selectedTier,
        tags: [category, pricingModel, 'SaaS']
      });

      // If user expressed interest in a paid promotion tier, record interest
      if (selectedPlanId !== 'free') {
        await productService.submitPromotionInterest({
          email: currentUser?.email || 'founder@launch.com',
          planId: selectedPlanId,
          productSlug: slug,
          notes: `Promotion tier '${selectedTier}' selected during submission`
        });
      }

      if (submitRes.error && isSupabaseConfigured) {
        setError(`Database error: ${submitRes.error}`);
        setIsSubmitting(false);
        return;
      }

      const newProduct = {
        slug,
        name,
        tagline,
        description,
        category,
        logo: finalLogo,
        websiteUrl: websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`,
        founder,
        founderTwitter: founderTwitter ? (founderTwitter.startsWith('@') ? founderTwitter : `@${founderTwitter}`) : undefined,
        tier: selectedTier,
        status: 'approved' as const,
        featured: selectedPlanId === 'featured' || selectedPlanId === 'premium',
        boosted: selectedPlanId === 'boost',
        premium: selectedPlanId === 'premium',
        tags: [category, pricingModel, 'SaaS'],
        pricingModel,
        launchDate: 'Just now'
      };

      onSubmitProduct(newProduct);
      setSubmittedSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="container" style={{ padding: '80px 24px', maxWidth: '640px', textAlign: 'center' }}>
        <div className="web-card" style={{ padding: '48px 32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '12px' }}>
            Product Submitted Successfully!
          </h1>

          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
            <strong>{name}</strong> is now listed in the VisoRank database. Your initial ranking has been seeded based on your selected promotion tier.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="btn btn-primary"
            >
              View on Leaderboard
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="btn btn-secondary"
            >
              Go to Founder Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    fontSize: '14px',
    color: 'var(--color-text-main)',
    backgroundColor: '#FFFFFF',
    marginTop: '6px'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--color-text-secondary)'
  };

  return (
    <div className="container" style={{ padding: '48px 24px 80px', maxWidth: '840px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '9999px',
          backgroundColor: 'var(--color-primary-subtle)',
          color: 'var(--color-primary)',
          fontSize: '12px',
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          <Sparkles size={14} />
          <span>JOIN 1,400+ LISTED BUILDERS</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '10px' }}>
          Launch Your Product on VisoRank
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '580px', margin: '0 auto' }}>
          Get immediate organic traffic, verified clicks, founder backlinks, and early adopter feedback.
        </p>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          backgroundColor: '#FEE2E2',
          border: '1px solid #F87171',
          borderRadius: '8px',
          color: '#DC2626',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        
        {/* Section 1: Product Basics */}
        <div className="web-card" style={{ padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>1. Product Details</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. SupaAgent AI"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Product Website URL *</label>
              <input
                type="text"
                required
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                placeholder="https://yourstartup.com"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Short Tagline (Punchy one-liner) *</label>
            <input
              type="text"
              required
              maxLength={120}
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              placeholder="Autonomous AI browser agents for automated web research"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Full Description *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain the problem you solve, who it's for, and why builders love it..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={inputStyle}
              >
                {CATEGORIES.filter(c => c.name !== 'All Categories').map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Pricing Model</label>
              <select
                value={pricingModel}
                onChange={e => setPricingModel(e.target.value as any)}
                style={inputStyle}
              >
                <option value="Freemium">Freemium</option>
                <option value="Free">100% Free / Open Source</option>
                <option value="Free Trial">Free Trial</option>
                <option value="Paid">Paid Only</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Logo (Storage Upload or Emoji)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <Upload size={14} />
                  <span>Upload Image</span>
                </button>
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--color-border)' }}
                  />
                ) : (
                  <div style={{ fontSize: '20px' }}>{logoEmoji}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                {emojiOptions.slice(0, 7).map(emoji => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => {
                      setLogoEmoji(emoji);
                      setLogoFile(null);
                      setLogoPreview(null);
                    }}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '6px',
                      border: logoEmoji === emoji && !logoPreview ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: logoEmoji === emoji && !logoPreview ? 'var(--color-primary-subtle)' : '#FFFFFF',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Founder Info */}
        <div className="web-card" style={{ padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
            2. Founder Identity
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Founder / Team Name *</label>
              <input
                type="text"
                required
                value={founder}
                onChange={e => setFounder(e.target.value)}
                placeholder="e.g. Maya Lin"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Founder Twitter / X Handle (Optional)</label>
              <input
                type="text"
                value={founderTwitter}
                onChange={e => setFounderTwitter(e.target.value)}
                placeholder="@mayabuilds"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Promotion Tiers */}
        <div className="web-card" style={{ padding: '32px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
              3. Promotion Tier & Visibility Boost
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>
              Free launch active • Paid checkouts coming soon
            </span>
          </div>

          <div style={{
            backgroundColor: 'var(--color-surface-muted)',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            marginBottom: '16px'
          }}>
            <strong>Notice:</strong> Online Stripe payment rails are currently in closed testing (Coming Soon). All submissions launch immediately with free verified indexing. Selecting a paid tier logs your early access promotion interest for moderation review.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {PROMOTION_PLANS.map(plan => {
              const isSelected = selectedPlanId === plan.id;
              const isPaid = plan.id !== 'free' && plan.priceUSD > 0;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-primary-subtle)' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)' }}>
                      {plan.name}
                    </span>
                    {isPaid ? (
                      <span className="badge badge-boost" style={{ fontSize: '9px' }}>COMING SOON</span>
                    ) : (
                      <span className="badge badge-coral" style={{ fontSize: '9px' }}>FREE</span>
                    )}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                    {plan.priceUSD === 0 ? 'Free' : `$${plan.priceUSD}`}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {isPaid ? `${plan.duration} • Waitlist` : plan.duration}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Action */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-lg"
            style={{ minWidth: '240px', gap: '10px' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Publishing to Database...</span>
              </>
            ) : (
              <>
                <span>Publish Product Launch</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <ShieldCheck size={14} color="var(--color-success)" />
            <span>Instant indexing. Verified ranking algorithm active.</span>
          </div>
        </div>

      </form>
    </div>
  );
};
