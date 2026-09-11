import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { Product } from '../types';

interface CategoriesPageProps {
  products: Product[];
  onSelectCategory: (categoryName: string) => void;
  onNavigate: (page: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  products,
  onSelectCategory,
  onNavigate
}) => {
  const categoriesWithProducts = CATEGORIES.filter(c => c.name !== 'All Categories').map(cat => {
    const matching = products.filter(p => p.category === cat.name);
    const topProduct = matching.sort((a, b) => b.clicks - a.clicks)[0];
    return {
      ...cat,
      realCount: matching.length,
      topProduct
    };
  });

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>
          Product Categories
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>
          Explore trending tools, services, and software grouped by industry and stack.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {categoriesWithProducts.map(cat => (
          <div
            key={cat.name}
            onClick={() => {
              onSelectCategory(cat.name);
              onNavigate('explore');
            }}
            className="web-card"
            style={{
              padding: '28px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '200px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                  fontSize: '32px',
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--color-surface-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--color-border)'
                }}>
                  {cat.icon}
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '12px' }}>
                  {cat.realCount || cat.count} tools
                </span>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                {cat.name}
              </h3>

              {cat.topProduct && (
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  🔥 Top ranked: <strong>{cat.topProduct.name}</strong> ({cat.topProduct.clicks.toLocaleString()} clicks)
                </p>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '14px',
              marginTop: '20px'
            }}>
              <span>Explore category</span>
              <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
