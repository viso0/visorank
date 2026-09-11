import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../data/products';
import { ProductCard } from '../components/ProductCard';

interface ExplorePageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onVisitProduct: (product: Product, e: React.MouseEvent) => void;
  initialCategory?: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  products,
  onSelectProduct,
  onVisitProduct,
  initialCategory = 'All Categories'
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'rank' | 'clicks' | 'newest'>('rank');

  const filtered = products
    .filter((p) => {
      const matchCat = selectedCat === 'All Categories' || p.category === selectedCat;
      const matchSearch =
        search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.tagline.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'rank') return a.rank - b.rank;
      if (sortBy === 'clicks') return b.clicks - a.clicks;
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      return 0;
    });

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>
          Explore Products
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>
          Browse all curated SaaS tools, AI agents, dev libraries, and startups.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        backgroundColor: '#FFFFFF',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Search input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flex: '1 1 300px',
          backgroundColor: 'var(--color-surface-muted)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)'
        }}>
          <Search size={18} color="#64748B" />
          <input
            type="text"
            placeholder="Filter by keyword, tech, founder..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '14px',
              color: 'var(--color-text-main)'
            }}
          />
        </div>

        {/* Sort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Sort by:</span>
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--color-surface-muted)',
            borderRadius: 'var(--radius-sm)',
            padding: '2px',
            gap: '2px'
          }}>
            {(['rank', 'clicks', 'newest'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: sortBy === s ? 700 : 500,
                  backgroundColor: sortBy === s ? '#FFFFFF' : 'transparent',
                  color: sortBy === s ? 'var(--color-text-main)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  boxShadow: sortBy === s ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {s === 'rank' ? 'Top Rank' : s === 'clicks' ? 'Most Clicks' : 'Newest'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '32px'
      }}>
        {CATEGORIES.map((c) => {
          const active = selectedCat === c.name;
          return (
            <button
              key={c.name}
              onClick={() => setSelectedCat(c.name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: active ? 'var(--color-primary-subtle)' : '#FFFFFF',
                color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontSize: '13px',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Product List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.length > 0 ? (
          filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelect={onSelectProduct}
              onVisit={onVisitProduct}
              showRank={true}
            />
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '64px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <p style={{ fontSize: '16px', color: 'var(--color-text-muted)' }}>
              No products found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
