import React from 'react';
import { ExternalLink, Flame, Sparkles, ArrowLeft, Globe, Share2, ShieldCheck, CheckCircle2, Bookmark, ArrowUpRight, Check, Flag, X, AlertTriangle } from 'lucide-react';
import { XIcon } from '../components/SocialIcons';
import { Product, User } from '../types';
import { productService } from '../services/productService';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  currentUser?: User | null;
  onBack: () => void;
  onVisit: (product: Product, e: React.MouseEvent) => void;
  onNavigate: (page: string, param?: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  currentUser,
  onBack,
  onVisit,
  onNavigate
}) => {
  const similarProducts = allProducts
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  const [bookmarked, setBookmarked] = React.useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('visorank_favorites');
      if (saved) {
        const ids = JSON.parse(saved);
        return Array.isArray(ids) && ids.includes(product.id);
      }
    } catch {}
    return false;
  });

  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (currentUser) {
      productService.isProductFavorited(String(product.id), currentUser.id).then(fav => {
        setBookmarked(fav);
      });
    }
  }, [product.id, currentUser]);

  const handleToggleBookmark = async () => {
    const next = !bookmarked;
    setBookmarked(next);
    try {
      const saved = localStorage.getItem('visorank_favorites');
      let ids: any[] = saved ? JSON.parse(saved) : [];
      if (next) {
        if (!ids.includes(product.id)) ids.push(product.id);
      } else {
        ids = ids.filter((id: any) => id !== product.id);
      }
      localStorage.setItem('visorank_favorites', JSON.stringify(ids));
    } catch {}

    if (currentUser) {
      await productService.toggleFavorite(String(product.id), currentUser.id);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/go/${product.slug}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Report Modal State
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [reportReason, setReportReason] = React.useState('broken_link');
  const [reportDetails, setReportDetails] = React.useState('');
  const [reporterEmail, setReporterEmail] = React.useState(currentUser?.email || '');
  const [reportSubmitting, setReportSubmitting] = React.useState(false);
  const [reportSubmitted, setReportSubmitted] = React.useState(false);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitting(true);
    await productService.submitReport({
      productId: product.id,
      productSlug: product.slug,
      reporterEmail,
      reason: reportReason,
      details: reportDetails
    });
    setReportSubmitting(false);
    setReportSubmitted(true);
    setTimeout(() => {
      setIsReportOpen(false);
      setReportSubmitted(false);
      setReportDetails('');
    }, 2000);
  };

  return (
    <div className="container" style={{ padding: '32px 24px 80px', maxWidth: '1100px' }}>
      {/* Back link */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: 'var(--color-text-secondary)',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '28px',
          padding: 0
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to products</span>
      </button>

      {/* Main SaaS Product Hero Card */}
      <div className="web-card" style={{
        padding: '40px',
        marginBottom: '40px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Logo & Core Info */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '20px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0,
              overflow: 'hidden'
            }}>
              {product.logo && (product.logo.startsWith('http') || product.logo.startsWith('data:') || product.logo.includes('/')) ? (
                <img
                  src={product.logo}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                product.logo || '🚀'
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
                  {product.name}
                </h1>
                <span className="badge badge-neutral">{product.category}</span>
                {product.featured && <span className="badge badge-featured"><Sparkles size={12} /> Featured</span>}
                {product.boosted && <span className="badge badge-boost"><Flame size={12} /> Boosted</span>}
              </div>

              <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                {product.tagline}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                <span>Founder: <strong style={{ color: 'var(--color-text-main)' }}>{product.founder}</strong></span>
                {product.founderTwitter && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)' }}>
                    <XIcon size={14} />
                    {product.founderTwitter}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Rank & Metrics Box */}
          <div style={{
            display: 'flex',
            gap: '16px',
            backgroundColor: 'var(--color-surface-muted)',
            padding: '16px 24px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{ textAlign: 'center', paddingRight: '16px', borderRight: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Global Rank
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary)' }}>
                #{product.rank}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Verified Clicks
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {product.clicks.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          paddingTop: '24px',
          borderTop: '1px solid var(--color-border)'
        }}>
          {/* Main CTA */}
          <button
            onClick={(e) => onVisit(product, e)}
            className="btn btn-primary btn-lg"
            style={{ minWidth: '200px' }}
          >
            <span>Visit Product</span>
            <ExternalLink size={18} />
          </button>

          {/* Secondary CTA */}
          <button
            onClick={() => onNavigate('pricing')}
            className="btn btn-secondary btn-lg"
          >
            <Flame size={18} color="#FF5733" />
            <span>Promote Product</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={handleToggleBookmark}
            className="btn btn-secondary btn-lg"
            style={{ color: bookmarked ? 'var(--color-primary)' : undefined }}
          >
            <Bookmark size={18} fill={bookmarked ? 'var(--color-primary)' : 'none'} />
            <span>{bookmarked ? 'Saved' : 'Save'}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="btn btn-secondary btn-lg"
            title="Copy direct tracking link"
          >
            {copied ? <Check size={18} color="var(--color-success)" /> : <Share2 size={18} />}
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>

          {/* Report */}
          <button
            onClick={() => setIsReportOpen(true)}
            className="btn btn-secondary btn-lg"
            title="Report inaccurate info or spam"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Flag size={17} />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px',
        marginBottom: '48px'
      }}>
        {/* Left: Full Description & Features */}
        <div className="web-card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text-main)' }}>
            About {product.name}
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
            {product.description}
          </p>

          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--color-text-main)' }}>
            Tags & Tech Stack
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {product.tags.map(t => (
              <span key={t} className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: '12px' }}>
                #{t}
              </span>
            ))}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            fontSize: '13px',
            fontWeight: 600
          }}>
            <ShieldCheck size={18} />
            <span>Verified Founder & URL checked by VisoRank system</span>
          </div>
        </div>

        {/* Right: Product Metadata & Pricing Model */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="web-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text-main)' }}>
              Product Info
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Pricing Model</span>
                <strong>{product.pricingModel}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Launched</span>
                <strong>{product.launchDate}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Official Website</span>
                <a href={product.websiteUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                  {product.websiteUrl.replace(/^https?:\/\//, '')}
                </a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Promotion Tier</span>
                <span className="badge badge-coral">{product.tier}</span>
              </div>
            </div>
          </div>

          <div className="web-card" style={{
            padding: '24px',
            backgroundColor: 'var(--color-primary-subtle)',
            border: '1px solid var(--color-primary-border)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
              Want to boost {product.name}?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Unlock 48-Hour Boost or 7-Day Featured placement to skyrocket discovery rankings.
            </p>
            <button
              onClick={() => onNavigate('pricing')}
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
            >
              View Promotion Tiers
            </button>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px', color: 'var(--color-text-main)' }}>
            More in {product.category}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {similarProducts.map(p => (
              <div
                key={p.id}
                onClick={() => onNavigate('product', p.slug)}
                className="web-card"
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-surface-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}>
                  {p.logo && (p.logo.startsWith('http') || p.logo.startsWith('data:') || p.logo.includes('/')) ? (
                    <img
                      src={p.logo}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    p.logo || '🚀'
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px 0', color: 'var(--color-text-main)' }}>
                    {p.name}
                  </h4>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {p.tagline}
                  </div>
                </div>
                <ArrowUpRight size={16} color="#94A3B8" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="web-card" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            position: 'relative',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <button
              onClick={() => setIsReportOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF4444'
              }}>
                <AlertTriangle size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Report {product.name}
              </h3>
            </div>

            {reportSubmitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 size={40} color="var(--color-success)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Report Submitted</h4>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Thank you for helping keep VisoRank accurate. Our moderators will review this listing.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Reason for reporting
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="input-field"
                    style={{ width: '100%' }}
                  >
                    <option value="broken_link">Broken / dead destination link</option>
                    <option value="misleading">Misleading or fraudulent product</option>
                    <option value="spam">Spam or duplicate listing</option>
                    <option value="copyright">Copyright or trademark infringement</option>
                    <option value="other">Other issue</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Your Email (optional)
                  </label>
                  <input
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Details or context
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Brief description of what is incorrect or broken..."
                    className="input-field"
                    style={{ width: '100%', resize: 'vertical' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="btn btn-primary btn-sm"
                  >
                    {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
