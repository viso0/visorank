import React, { useState } from 'react';
import { Search, Sparkles, TrendingUp, Award, ArrowUpRight, Flame, PlusCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../data/products';
import { ProductCard } from '../components/ProductCard';

interface HomePageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onVisitProduct: (product: Product, e: React.MouseEvent) => void;
  onNavigate: (page: string, param?: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  onSelectProduct,
  onVisitProduct,
  onNavigate,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory
}) => {
  const [leaderboardTab, setLeaderboardTab] = useState<'today' | 'week' | 'all'>('today');

  // Filter products by search and category
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All Categories' || p.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const trendingProducts = [...filteredProducts].sort((a, b) => b.clicks - a.clicks).slice(0, 5);
  const featuredProducts = products.filter(p => p.featured || p.tier === 'Featured' || p.tier === 'Premium');
  const latestProducts = [...products].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', paddingBottom: '80px' }}>
      
      {/* 1. LARGE HERO SECTION */}
      <section style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--color-border)',
        padding: '72px 0 64px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative radial gradient */}
        <div style={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255, 87, 51, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: '900px' }}>
          
          {/* Launch velocity pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-primary-subtle)',
            border: '1px solid var(--color-primary-border)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 16px',
            marginBottom: '24px',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--color-primary)'
          }}>
            <Sparkles size={15} />
            <span>Launch. Rank. Get Discovered.</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 60px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            color: 'var(--color-text-main)',
            marginBottom: '20px'
          }}>
            Discover what’s <span style={{
              background: 'linear-gradient(135deg, #FF5733 0%, #E04824 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>worth building.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(17px, 2vw, 21px)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
            marginBottom: '36px',
            maxWidth: '680px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Explore the next generation of SaaS, AI tools, apps and startups. Rated and ranked by verified user traffic.
          </p>

          {/* LARGE CENTERED SEARCH BAR */}
          <div style={{
            maxWidth: '640px',
            margin: '0 auto 36px',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--color-border)',
              padding: '6px 8px 6px 18px',
              boxShadow: 'var(--shadow-md)',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}>
              <Search size={22} color="#64748B" style={{ flexShrink: 0, marginRight: '12px' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AI agents, developer tools, SaaS, startups..."
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '16px',
                  color: 'var(--color-text-main)',
                  backgroundColor: 'transparent'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    marginRight: '8px',
                    padding: '4px'
                  }}
                >
                  Clear
                </button>
              )}
              <button 
                onClick={() => onNavigate('explore')}
                className="btn btn-primary"
                style={{ padding: '10px 20px', borderRadius: '8px' }}
              >
                Search
              </button>
            </div>
          </div>

          {/* CATEGORY NAVIGATION PILLS */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-primary-subtle)' : '#FFFFFF',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span style={{
                    fontSize: '11px',
                    opacity: 0.7,
                    backgroundColor: isSelected ? '#FFFFFF' : 'var(--color-surface-muted)',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* 2. TRENDING PRODUCTS */}
      <section className="container">
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '4px'
            }}>
              <Flame size={18} />
              <span>Real-Time Momentum</span>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
              Trending Products
            </h2>
          </div>

          <button
            onClick={() => onNavigate('explore')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <span>View All ({products.length})</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Wide Professional Product Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {trendingProducts.length > 0 ? (
            trendingProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onVisit={onVisitProduct}
                showRank={true}
              />
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>
                No products found matching "{searchQuery}" in {selectedCategory}.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All Categories'); }}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '12px' }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. WIDE DESKTOP LEADERBOARD SECTION */}
      <section className="container">
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '32px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
            flexWrap: 'wrap',
            gap: '16px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '20px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Award size={22} color="#FF5733" />
                <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--color-text-main)' }}>
                  Product Discovery Leaderboard
                </h2>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
                Transparent rankings scored by real organic engagement and launch recency.
              </p>
            </div>

            {/* Timeframe selector */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--color-surface-muted)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px',
              gap: '4px'
            }}>
              {(['today', 'week', 'all'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLeaderboardTab(tab)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: leaderboardTab === tab ? 700 : 500,
                    backgroundColor: leaderboardTab === tab ? '#FFFFFF' : 'transparent',
                    color: leaderboardTab === tab ? 'var(--color-text-main)' : 'var(--color-text-secondary)',
                    boxShadow: leaderboardTab === tab ? 'var(--shadow-sm)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {tab === 'today' ? 'Today' : tab === 'week' ? 'This Week' : 'All-Time'}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Table (Wide desktop responsive) */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <th style={{ padding: '12px 16px', width: '60px' }}>Rank</th>
                  <th style={{ padding: '12px 16px' }}>Product</th>
                  <th style={{ padding: '12px 16px', width: '140px' }}>Category</th>
                  <th style={{ padding: '12px 16px', width: '140px', textAlign: 'right' }}>Verified Clicks</th>
                  <th style={{ padding: '12px 16px', width: '120px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 6).map((item, index) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectProduct(item)}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Rank */}
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 800,
                        backgroundColor: index === 0 ? '#FEF3C7' : index === 1 ? '#F1F5F9' : index === 2 ? '#FFEDD5' : 'transparent',
                        color: index === 0 ? '#B45309' : index === 1 ? '#475569' : index === 2 ? '#C2410C' : 'var(--color-text-muted)'
                      }}>
                        {index + 1}
                      </span>
                    </td>

                    {/* Product */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          flexShrink: 0
                        }}>
                          {item.logo}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: 'var(--color-text-main)', fontSize: '15px' }}>{item.name}</strong>
                            {item.featured && <span className="badge badge-featured" style={{ fontSize: '10px' }}>Featured</span>}
                            {item.boosted && <span className="badge badge-boost" style={{ fontSize: '10px' }}>Boost</span>}
                          </div>
                          <div style={{
                            color: 'var(--color-text-secondary)',
                            fontSize: '13px',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            maxWidth: '460px'
                          }}>
                            {item.tagline}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '16px' }}>
                      <span className="badge badge-neutral">
                        {item.category}
                      </span>
                    </td>

                    {/* Verified Clicks */}
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <strong style={{ fontSize: '15px', color: 'var(--color-text-main)' }}>
                        {item.clicks.toLocaleString()}
                      </strong>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => onVisitProduct(item, e)}
                        className="btn btn-outline-primary btn-sm"
                        style={{ padding: '6px 12px' }}
                      >
                        Visit <ArrowUpRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="btn btn-secondary"
              style={{ width: '100%', maxWidth: '300px' }}
            >
              Explore Full Leaderboard →
            </button>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS (Desktop 2/3 column grid) */}
      <section className="container">
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#E04824',
            fontWeight: 700,
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '4px'
          }}>
            <Sparkles size={16} />
            <span>Curated Placements</span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
            Featured Products
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '20px'
        }}>
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="web-card"
              style={{
                padding: '24px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid #FFDCD4',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDFD 100%)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    {product.logo}
                  </div>
                  <span className="badge badge-featured">
                    <Sparkles size={12} /> Featured
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-main)' }}>
                  {product.name}
                </h3>

                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {product.description}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-border-subtle)'
              }}>
                <span className="badge badge-neutral">{product.category}</span>
                
                <button
                  onClick={(e) => onVisitProduct(product, e)}
                  className="btn btn-primary btn-sm"
                >
                  Visit <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. LATEST PRODUCTS */}
      <section className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-success)',
              fontWeight: 700,
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '4px'
            }}>
              <Zap size={16} />
              <span>Just Launched</span>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
              Latest Submissions
            </h2>
          </div>

          <button
            onClick={() => onNavigate('explore')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <span>See Newest</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {latestProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelect={onSelectProduct}
              onVisit={onVisitProduct}
              showRank={false}
            />
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION: "Have a product worth discovering?" */}
      <section className="container">
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-primary-border)',
          padding: '64px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #FFF9F7 0%, #FFFFFF 100%)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <PlusCircle size={28} />
            </div>

            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: 800,
              color: 'var(--color-text-main)',
              letterSpacing: '-0.8px',
              marginBottom: '12px'
            }}>
              Have a product worth discovering?
            </h2>

            <p style={{
              fontSize: '17px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              marginBottom: '32px'
            }}>
              Submit your product to VisoRank. Join hundreds of founders getting high-intent traffic, organic feedback, and global ranking exposure.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onNavigate('submit')}
                className="btn btn-primary btn-lg"
              >
                <span>Submit Your Product</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => onNavigate('pricing')}
                className="btn btn-secondary btn-lg"
              >
                View Promotion Options
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
