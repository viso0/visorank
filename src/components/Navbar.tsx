import React, { useState } from 'react';
import { Menu, X, PlusCircle, TrendingUp, Sparkles, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, param?: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'explore', label: 'Explore' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'categories', label: 'Categories' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'about', label: 'About' }
  ];

  const handleLinkClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.94)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
      transition: 'all 0.2s ease'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => handleLinkClick('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #FF5733 0%, #E04824 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 10px rgba(255, 87, 51, 0.3)'
          }}>
            <TrendingUp size={22} strokeWidth={2.5} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '20px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: 'var(--color-text-main)'
              }}>
                Viso<span style={{ color: 'var(--color-primary)' }}>Rank</span>
              </span>
              <span className="badge badge-coral" style={{ fontSize: '10px', padding: '1px 6px' }}>
                LIVE
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Launch. Rank. Get Discovered.
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '32px'
        }} className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  padding: '6px 0',
                  position: 'relative',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--color-text-main)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                {link.label}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '2px'
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Items (Desktop) */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '14px'
        }} className="desktop-actions">
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {currentUser.name.charAt(0)}
                </div>
                <span>{currentUser.name}</span>
              </button>

              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '200px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--color-border)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 60
                }}>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('dashboard');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--color-text-main)',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-muted)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LayoutDashboard size={16} />
                    Founder Dashboard
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#EF4444',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleLinkClick('login')}
              className="btn btn-secondary btn-sm"
              style={{ padding: '8px 16px' }}
            >
              Log in
            </button>
          )}

          <button
            onClick={() => handleLinkClick('submit')}
            className="btn btn-primary btn-sm"
            style={{ padding: '8px 18px' }}
          >
            <PlusCircle size={16} />
            <span>Submit Product</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="mobile-toggle">
          <button
            onClick={() => handleLinkClick('submit')}
            className="btn btn-primary btn-sm"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <PlusCircle size={14} />
            <span>Submit</span>
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-main)'
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
          padding: '16px 20px 24px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {navLinks.map((link) => {
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                style={{
                  background: isActive ? 'var(--color-primary-subtle)' : 'none',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                  fontSize: '15px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-main)',
                  cursor: 'pointer'
                }}
              >
                {link.label}
              </button>
            );
          })}

          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />

          {currentUser ? (
            <>
              <button
                onClick={() => handleLinkClick('dashboard')}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <LayoutDashboard size={18} />
                <span>Founder Dashboard</span>
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', color: '#EF4444' }}
              >
                <LogOut size={18} />
                <span>Log Out ({currentUser.name})</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => handleLinkClick('login')}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Log in
            </button>
          )}
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};
