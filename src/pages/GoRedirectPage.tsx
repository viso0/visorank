import React, { useEffect, useState } from 'react';
import { ExternalLink, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { productService } from '../services/productService';

interface GoRedirectPageProps {
  slug: string;
  allProducts: Product[];
  onNavigate: (page: string) => void;
}

export const GoRedirectPage: React.FC<GoRedirectPageProps> = ({
  slug,
  allProducts,
  onNavigate
}) => {
  const [product, setProduct] = useState<Product | null>(
    allProducts.find(p => p.slug === slug) || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState<string | null>(product?.websiteUrl || null);

  useEffect(() => {
    let isMounted = true;

    async function trackAndRedirect() {
      try {
        setLoading(true);
        // 1. Fetch live product if not found
        let currentProd = product;
        if (!currentProd) {
          const res = await productService.fetchProductBySlug(slug);
          if (res.product) {
            currentProd = res.product;
            if (isMounted) setProduct(res.product);
          }
        }

        if (!currentProd) {
          if (isMounted) {
            setError(`Product "${slug}" was not found.`);
            setLoading(false);
          }
          return;
        }

        // 2. Record click into Supabase click_events and update score
        const trackingResult = await productService.recordClick(slug, document.referrer);
        const destination = trackingResult.websiteUrl || currentProd.websiteUrl;
        
        if (isMounted) {
          setTargetUrl(destination);
          setLoading(false);
        }

        // 3. Perform redirect
        const timer = setTimeout(() => {
          if (destination) {
            window.location.href = destination;
          }
        }, 1200);

        return () => clearTimeout(timer);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to process redirect.');
          setLoading(false);
        }
      }
    }

    trackAndRedirect();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return (
    <div className="container" style={{ padding: '80px 24px', maxWidth: '560px', textAlign: 'center' }}>
      <div className="web-card" style={{ padding: '48px 36px', boxShadow: 'var(--shadow-lg)' }}>
        
        {loading ? (
          <div>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Loader2 className="animate-spin" size={32} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
              Logging Verified Click...
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              Recording telemetry to VisoRank verified analytics engine.
            </p>
          </div>
        ) : error ? (
          <div>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <AlertCircle size={32} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
              Redirect Failed
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              {error}
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="btn btn-primary"
            >
              Return to Homepage
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              fontSize: '44px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {product?.logo && (product.logo.startsWith('http') || product.logo.startsWith('data:') || product.logo.includes('/')) ? (
                <img
                  src={product.logo}
                  alt={product.name}
                  style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '12px' }}
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                product?.logo || '🚀'
              )}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>
              Redirecting to {product?.name}...
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              {product?.tagline}
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '28px'
            }}>
              <ShieldCheck size={16} />
              <span>Verified Direct Link</span>
            </div>

            <div>
              {targetUrl && (
                <a
                  href={targetUrl}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>Continue immediately</span>
                  <ExternalLink size={18} />
                </a>
              )}
            </div>

            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '20px' }}>
              VisoRank protects founders from bot fraud with cryptographic click verification.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
