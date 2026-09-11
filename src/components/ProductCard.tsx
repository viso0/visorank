import React from 'react';
import { ExternalLink, Flame, ChevronRight, MousePointerClick, Clock, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onVisit: (product: Product, e: React.MouseEvent) => void;
  showRank?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onVisit,
  showRank = true
}) => {
  return (
    <div
      onClick={() => onSelect(product)}
      className="web-card"
      style={{
        padding: '20px 24px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: product.featured 
          ? '4px solid #FF5733' 
          : product.boosted 
            ? '4px solid #F59E0B' 
            : undefined
      }}
    >
      {/* Left side: Rank + Logo + Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flex: 1,
        minWidth: 0
      }}>
        {/* Rank Number */}
        {showRank && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            minWidth: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: product.rank <= 3 ? 'var(--color-primary-subtle)' : 'var(--color-surface-muted)',
            color: product.rank <= 3 ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: 800,
            fontSize: '15px'
          }}>
            #{product.rank}
          </div>
        )}

        {/* Product Logo / Icon */}
        <div style={{
          width: '52px',
          minWidth: '52px',
          height: '52px',
          borderRadius: '12px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          {product.logo && (product.logo.startsWith('http') || product.logo.startsWith('data:') || product.logo.includes('/')) ? (
            <img
              src={product.logo}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                // Fallback if image URL fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            product.logo || '🚀'
          )}
        </div>

        {/* Product Content Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h3 style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--color-text-main)',
              margin: 0
            }}>
              {product.name}
            </h3>

            {/* Category Tag */}
            <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
              {product.category}
            </span>

            {/* Badges for Featured / Boost */}
            {product.featured && (
              <span className="badge badge-featured">
                <Sparkles size={11} /> Featured
              </span>
            )}
            {product.boosted && (
              <span className="badge badge-boost">
                <Flame size={11} /> Boosted
              </span>
            )}
            {product.pricingModel && (
              <span className="badge" style={{ backgroundColor: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', fontSize: '11px' }}>
                {product.pricingModel}
              </span>
            )}
          </div>

          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 6px 0',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.tagline}
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '12px',
            color: 'var(--color-text-muted)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} />
              {product.launchDate}
            </span>
            <span>•</span>
            <span>by <strong style={{ color: 'var(--color-text-secondary)' }}>{product.founder}</strong></span>
          </div>
        </div>
      </div>

      {/* Right side: Clicks & Action Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexShrink: 0
      }} className="product-card-actions">
        {/* Verified Clicks Counter */}
        <div style={{
          textAlign: 'right',
          padding: '6px 14px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-surface-muted)',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '5px',
            fontSize: '15px',
            fontWeight: 800,
            color: 'var(--color-text-main)'
          }}>
            <MousePointerClick size={14} color="#FF5733" />
            <span>{product.clicks.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            verified clicks
          </div>
        </div>

        {/* Visit Product Button */}
        <button
          onClick={(e) => onVisit(product, e)}
          className="btn btn-primary btn-sm"
          style={{ padding: '9px 18px' }}
        >
          <span>Visit Product</span>
          <ExternalLink size={14} />
        </button>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .web-card {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
          }
          .product-card-actions {
            justify-content: space-between !important;
            border-top: 1px solid var(--color-border);
            padding-top: 12px;
          }
        }
      `}</style>
    </div>
  );
};
