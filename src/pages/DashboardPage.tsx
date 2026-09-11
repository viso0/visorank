import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Flame,
  Settings,
  PlusCircle,
  ExternalLink,
  TrendingUp,
  MousePointerClick,
  Users,
  Award,
  Sparkles,
  Clock,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  Bookmark,
  RefreshCw
} from 'lucide-react';
import { Product, User, ClickEvent } from '../types';
import { productService } from '../services/productService';
import { isSupabaseConfigured } from '../lib/supabase';

interface DashboardPageProps {
  currentUser: User | null;
  products: Product[];
  onNavigate: (page: string, param?: string) => void;
  onPromote: (product: Product) => void;
  onRefreshProducts?: () => void;
}

const renderLogo = (logo: string | undefined, name: string, size = 22) => {
  if (logo && (logo.startsWith('http') || logo.startsWith('data:') || logo.includes('/'))) {
    return (
      <img
        src={logo}
        alt={name}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'cover',
          borderRadius: '6px',
          display: 'inline-block',
          verticalAlign: 'middle'
        }}
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }
  return <span style={{ fontSize: `${size}px` }}>{logo || '🚀'}</span>;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  products,
  onNavigate,
  onPromote,
  onRefreshProducts
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'analytics' | 'promotions' | 'favorites' | 'admin' | 'settings'>('overview');
  const [analyticsEvents, setAnalyticsEvents] = useState<ClickEvent[]>([]);
  const [selectedAnalyticsProductId, setSelectedAnalyticsProductId] = useState<string | number>('');
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Filter products belonging to this founder
  const myProducts = products.filter(p => 
    (currentUser?.id && p.founderId === currentUser.id) ||
    p.founder === currentUser?.name ||
    (!currentUser && p.id <= 2)
  );

  const totalClicks = myProducts.reduce((acc, p) => acc + p.clicks, 0);
  const bestRank = myProducts.length > 0 ? Math.min(...myProducts.map(p => p.rank)) : 0;

  // Load analytics when tab opens
  useEffect(() => {
    if (activeTab === 'analytics' && myProducts.length > 0) {
      const prodId = selectedAnalyticsProductId || myProducts[0].id;
      setSelectedAnalyticsProductId(prodId);
      productService.getClickAnalytics(prodId).then(events => {
        setAnalyticsEvents(events);
      });
    }
  }, [activeTab, selectedAnalyticsProductId, myProducts.length]);

  // Load favorites when tab opens
  useEffect(() => {
    if (activeTab === 'favorites' && currentUser) {
      productService.getUserFavorites(currentUser.id).then(favs => {
        setFavorites(favs);
      });
    }
  }, [activeTab, currentUser]);

  const handleStatusChange = async (productId: string | number, status: 'approved' | 'rejected') => {
    const ok = await productService.setProductStatus(productId, status);
    if (ok) {
      setActionMessage(`Product status updated to ${status}.`);
      if (onRefreshProducts) onRefreshProducts();
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'My Products', icon: Package },
    { id: 'analytics', label: 'Click Analytics', icon: BarChart3 },
    { id: 'favorites', label: 'Saved Products', icon: Bookmark },
    { id: 'promotions', label: 'Promotions', icon: Flame },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Moderation', icon: ShieldCheck }] : []),
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="container" style={{ padding: '32px 24px 80px' }}>
      
      {/* Dashboard Shell Grid: Desktop Sidebar + Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gap: '32px',
        alignItems: 'flex-start'
      }} className="dashboard-grid">

        {/* Desktop Sidebar */}
        <aside className="web-card" style={{
          padding: '16px 12px',
          position: 'sticky',
          top: '90px'
        }}>
          <div style={{ padding: '8px 12px 16px', borderBottom: '1px solid var(--color-border)', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Console
              </span>
              {isAdmin && (
                <span className="badge badge-coral" style={{ fontSize: '10px', padding: '2px 6px' }}>
                  ADMIN
                </span>
              )}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '4px' }}>
              {currentUser?.name || 'Alex Rivera'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {currentUser?.email || 'founder@startup.io'}
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? 'var(--color-primary-subtle)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
            <button
              onClick={() => onNavigate('submit')}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', gap: '6px' }}
            >
              <PlusCircle size={15} />
              <span>Submit New</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ minWidth: 0 }}>
          
          {actionMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #6EE7B7',
              borderRadius: '8px',
              color: '#065F46',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              <CheckCircle2 size={18} />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              {/* Header */}
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                  Founder Dashboard
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  Monitor your verified traffic, rank telemetry, and product discoverability.
                </p>
              </div>

              {/* Stat Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '28px'
              }}>
                <div className="web-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Total Verified Clicks</span>
                    <MousePointerClick size={18} color="var(--color-primary)" />
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                    {totalClicks.toLocaleString()}
                  </div>
                </div>

                <div className="web-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Active Listings</span>
                    <Package size={18} color="var(--color-primary)" />
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                    {myProducts.length}
                  </div>
                </div>

                <div className="web-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Best Global Rank</span>
                    <Award size={18} color="#EAB308" />
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {bestRank > 0 ? `#${bestRank}` : '—'}
                  </div>
                </div>
              </div>

              {/* Listed Products Quick List */}
              <div className="web-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Your Live Products</h2>
                  <button
                    onClick={() => onNavigate('submit')}
                    className="btn btn-primary btn-sm"
                  >
                    + Add Product
                  </button>
                </div>

                {myProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
                    <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>No products submitted yet</p>
                    <button onClick={() => onNavigate('submit')} className="btn btn-primary btn-sm">
                      Submit your first SaaS tool
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {myProducts.map(p => (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface-muted)',
                          gap: '16px',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {renderLogo(p.logo, p.name, 24)}
                          <div>
                            <strong style={{ fontSize: '14px', color: 'var(--color-text-main)' }}>{p.name}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                              Rank #{p.rank} • {p.category} • <span style={{ color: p.status === 'approved' ? 'var(--color-success)' : '#D97706' }}>{p.status || 'approved'}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>{p.clicks.toLocaleString()} clicks</span>
                          <button
                            onClick={() => onNavigate('product', p.slug)}
                            className="btn btn-secondary btn-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => onNavigate('pricing')}
                            className="btn btn-outline-primary btn-sm"
                          >
                            Boost
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MY PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="web-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>My Products</h2>
                <button onClick={() => onNavigate('submit')} className="btn btn-primary btn-sm">
                  + Add Product
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px' }}>Product</th>
                      <th style={{ padding: '12px 16px' }}>Category</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Rank</th>
                      <th style={{ padding: '12px 16px' }}>Clicks</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProducts.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {renderLogo(p.logo, p.name, 22)}
                            <strong>{p.name}</strong>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className="badge badge-neutral">{p.category}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={`badge ${p.status === 'approved' ? 'badge-success' : 'badge-boost'}`}>
                            {p.status || 'Approved'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--color-primary)' }}>
                          #{p.rank}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                          {p.clicks.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => onNavigate('product', p.slug)}
                            className="btn btn-outline-primary btn-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div>
              <div className="web-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
                  Verified Telemetry & Click Events
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                  Real cryptographic telemetry records from the Supabase <code>click_events</code> table.
                </p>

                {myProducts.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Select Product to Inspect:
                    </label>
                    <select
                      value={selectedAnalyticsProductId}
                      onChange={e => setSelectedAnalyticsProductId(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                    >
                      {myProducts.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.clicks} clicks)</option>
                      ))}
                    </select>
                  </div>
                )}

                {analyticsEvents.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--color-surface-muted)', borderRadius: '12px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                      No individual click events logged for this item yet. When users visit your product link, verified click records appear here in real time.
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '11px' }}>
                          <th style={{ padding: '10px 14px' }}>Timestamp</th>
                          <th style={{ padding: '10px 14px' }}>Referrer</th>
                          <th style={{ padding: '10px 14px' }}>User Agent / Device</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsEvents.map(evt => (
                          <tr key={evt.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                            <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                              {new Date(evt.createdAt).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              {evt.referrer || 'Direct / VisoRank'}
                            </td>
                            <td style={{ padding: '12px 14px', color: 'var(--color-text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {evt.userAgent || 'Modern Browser'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FAVORITES TAB */}
          {activeTab === 'favorites' && (
            <div className="web-card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>
                Saved & Bookmarked Tools
              </h2>
              {favorites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
                  <Bookmark size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p style={{ fontSize: '14px' }}>No saved tools yet. Bookmark products while exploring to view them here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {favorites.map(p => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface-muted)',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {renderLogo(p.logo, p.name, 24)}
                        <div>
                          <strong style={{ fontSize: '14px' }}>{p.name}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{p.tagline}</div>
                        </div>
                      </div>
                      <button onClick={() => onNavigate('product', p.slug)} className="btn btn-secondary btn-sm">
                        View Tool
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADMIN MODERATION TAB */}
          {activeTab === 'admin' && isAdmin && (
            <div className="web-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                    Admin Product Moderation Queue
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    Review, approve, or reject community product submissions.
                  </p>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 14px' }}>Product</th>
                      <th style={{ padding: '12px 14px' }}>Founder</th>
                      <th style={{ padding: '12px 14px' }}>Category</th>
                      <th style={{ padding: '12px 14px' }}>Status</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {renderLogo(p.logo, p.name, 20)}
                            <div>
                              <strong>{p.name}</strong>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{p.websiteUrl}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px' }}>{p.founder}</td>
                        <td style={{ padding: '14px' }}>
                          <span className="badge badge-neutral">{p.category}</span>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span className={`badge ${p.status === 'approved' ? 'badge-success' : p.status === 'rejected' ? 'badge-coral' : 'badge-boost'}`}>
                            {p.status || 'approved'}
                          </span>
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleStatusChange(p.id, 'approved')}
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                            >
                              <CheckCircle2 size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(p.id, 'rejected')}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#DC2626', borderColor: '#DC2626' }}
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROMOTIONS TAB */}
          {activeTab === 'promotions' && (
            <div className="web-card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>
                Active Promotions & Boosts
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                Boosted products gain preferential placement in discovery feeds and a 1.3x - 2.5x score multiplier in the ranking algorithm.
              </p>

              <button
                onClick={() => onNavigate('pricing')}
                className="btn btn-primary"
              >
                Browse Promotion Plans
              </button>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="web-card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>
                Account Settings
              </h2>
              <div style={{ maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.email || 'alex@startup.io'}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-muted)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser?.name || 'Alex Rivera'}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Account Role
                  </label>
                  <span className="badge badge-neutral" style={{ padding: '6px 12px' }}>
                    {currentUser?.role || 'founder'}
                  </span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
