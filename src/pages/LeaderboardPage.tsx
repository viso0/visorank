import React, { useState } from 'react';
import { Award, ArrowUpRight, Flame, Sparkles, HelpCircle, TrendingUp, Info } from 'lucide-react';
import { Product } from '../types';

interface LeaderboardPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onVisitProduct: (product: Product, e: React.MouseEvent) => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  products,
  onSelectProduct,
  onVisitProduct
}) => {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [showFormula, setShowFormula] = useState(false);

  const sortedProducts = React.useMemo(() => {
    const now = Date.now();
    let filtered = [...products];

    if (timeframe === 'today') {
      // Recent products (within 48 hours for test/seed data)
      filtered = filtered.filter(p => (now - p.createdAt) <= 1000 * 60 * 60 * 48);
    } else if (timeframe === 'week') {
      filtered = filtered.filter(p => (now - p.createdAt) <= 1000 * 60 * 60 * 24 * 7);
    } else if (timeframe === 'month') {
      filtered = filtered.filter(p => (now - p.createdAt) <= 1000 * 60 * 60 * 24 * 30);
    }

    if (filtered.length === 0) {
      filtered = [...products];
    }

    return filtered.sort((a, b) => b.clicks - a.clicks);
  }, [products, timeframe]);

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      {/* Title & Info */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '36px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-coral">OFFICIAL RANKINGS</span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Updated real-time</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
            Global Product Leaderboard
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
            Discover the highest-performing SaaS, AI agents, and startup innovations worldwide.
          </p>

          {/* Timeframe Filter Buttons */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--color-surface-muted)',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            marginTop: '16px',
            border: '1px solid var(--color-border)'
          }}>
            {(['today', 'week', 'month', 'all'] as const).map(tf => {
              const labels = { today: 'Today', week: 'This Week', month: 'This Month', all: 'All Time' };
              const isSelected = timeframe === tf;
              return (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 500,
                    backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                    color: isSelected ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {labels[tf]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Algorithm Info Toggle */}
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="btn btn-secondary btn-sm"
          style={{ gap: '6px' }}
        >
          <Info size={15} color="#FF5733" />
          <span>How VisoRank Calculates Ranks</span>
        </button>
      </div>

      {/* Algorithm Explainer Box */}
      {showFormula && (
        <div style={{
          backgroundColor: 'var(--color-primary-subtle)',
          border: '1px solid var(--color-primary-border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
          marginBottom: '32px',
          fontSize: '14px',
          lineHeight: 1.6
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '6px' }}>
            The VisoRank Transparency Guarantee
          </h3>
          <p style={{ color: 'var(--color-text-main)', marginBottom: '8px' }}>
            Unlike black-box aggregators, VisoRank uses an open mathematical ranking algorithm:
          </p>
          <div style={{
            fontFamily: 'var(--font-mono)',
            backgroundColor: '#FFFFFF',
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-primary-border)',
            fontSize: '13px',
            color: 'var(--color-primary-hover)',
            marginBottom: '8px'
          }}>
            Score = (UniqueClicks × 1.0) / (HoursSinceLaunch + 2)^1.5 + (BoostBonus × 1.15)
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            This prevents legacy incumbents from permanently hogging the top spots and ensures fresh high-velocity launches reach the podium.
          </p>
        </div>
      )}

      {/* Podium Top 3 Showcase */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {sortedProducts.slice(0, 3).map((item, index) => {
          const medals = ['🥇 1st Place', '🥈 2nd Place', '🥉 3rd Place'];
          const borders = ['#F59E0B', '#94A3B8', '#EA580C'];
          return (
            <div
              key={item.id}
              onClick={() => onSelectProduct(item)}
              className="web-card"
              style={{
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
                borderTop: `4px solid ${borders[index]}`
              }}
            >
              <div style={{
                fontSize: '12px',
                fontWeight: 800,
                color: borders[index],
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px'
              }}>
                {medals[index]}
              </div>

              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 12px'
              }}>
                {item.logo}
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                {item.name}
              </h3>

              <p style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                marginBottom: '16px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {item.tagline}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-surface-muted)',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px'
              }}>
                <Flame size={16} color="#FF5733" />
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                  {item.clicks.toLocaleString()}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>clicks</span>
              </div>

              <button
                onClick={(e) => onVisitProduct(item, e)}
                className="btn btn-primary btn-sm"
                style={{ width: '100%' }}
              >
                <span>Visit Product</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{
                backgroundColor: 'var(--color-surface-muted)',
                borderBottom: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <th style={{ padding: '14px 20px', width: '70px' }}>Rank</th>
                <th style={{ padding: '14px 20px' }}>Product</th>
                <th style={{ padding: '14px 20px' }}>Category</th>
                <th style={{ padding: '14px 20px' }}>Founder</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Verified Clicks</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((p, idx) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  style={{
                    borderBottom: '1px solid var(--color-border-subtle)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '15px',
                      color: idx < 3 ? 'var(--color-primary)' : 'var(--color-text-muted)'
                    }}>
                      #{idx + 1}
                    </span>
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{p.logo}</span>
                      <div>
                        <strong style={{ color: 'var(--color-text-main)', fontSize: '15px' }}>{p.name}</strong>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{p.tagline}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <span className="badge badge-neutral">{p.category}</span>
                  </td>

                  <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                    {p.founder}
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <strong style={{ fontSize: '15px', color: 'var(--color-text-main)' }}>
                      {p.clicks.toLocaleString()}
                    </strong>
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => onVisitProduct(p, e)}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Visit <ArrowUpRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
