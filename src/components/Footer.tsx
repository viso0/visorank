import React from 'react';
import { TrendingUp, Globe, ShieldCheck, Heart } from 'lucide-react';
import { XIcon, GithubIcon } from './SocialIcons';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer style={{
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid var(--color-border)',
      marginTop: 'auto',
      paddingTop: '64px',
      paddingBottom: '40px'
    }}>
      <div className="container">
        {/* Top Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '56px'
        }}>
          {/* Brand Info */}
          <div style={{ maxWidth: '320px' }}>
            <div 
              onClick={() => onNavigate('home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #FF5733 0%, #E04824 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <TrendingUp size={18} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                Viso<span style={{ color: 'var(--color-primary)' }}>Rank</span>
              </span>
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              The global launchpad and transparent ranking platform for SaaS, AI agents, dev tools, and next-generation startups.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="#" style={{ color: 'var(--color-text-muted)', padding: '6px' }} aria-label="X (Twitter)">
                <XIcon size={18} />
              </a>
              <a href="#" style={{ color: 'var(--color-text-muted)', padding: '6px' }} aria-label="GitHub">
                <GithubIcon size={18} />
              </a>
              <a href="#" style={{ color: 'var(--color-text-muted)', padding: '6px' }} aria-label="Website">
                <Globe size={18} />
              </a>
            </div>
          </div>

          {/* Directory Column */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>
              Discover
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <button onClick={() => onNavigate('explore')} style={linkStyle}>
                  All Products
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('leaderboard')} style={linkStyle}>
                  Live Leaderboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories')} style={linkStyle}>
                  Browse Categories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore')} style={linkStyle}>
                  AI Tools & Agents
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore')} style={linkStyle}>
                  Developer Tools
                </button>
              </li>
            </ul>
          </div>

          {/* Founders Column */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>
              For Founders
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <button onClick={() => onNavigate('submit')} style={linkStyle}>
                  Submit Product
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} style={linkStyle}>
                  Promotions & Pricing
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} style={linkStyle}>
                  Founder Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} style={linkStyle}>
                  Algorithm Transparency
                </button>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>
              Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <button onClick={() => onNavigate('about')} style={linkStyle}>
                  About VisoRank
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} style={linkStyle}>
                  Boost Tiers
                </button>
              </li>
              <li>
                <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                  Terms & Privacy
                </span>
              </li>
              <li>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-success)', fontWeight: 600 }}>
                  <ShieldCheck size={16} />
                  <span>100% Organic Clicks</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '13px',
          color: 'var(--color-text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} VisoRank. Launch. Rank. Get Discovered.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Built with craft for builders worldwide</span>
            <Heart size={14} color="#FF5733" fill="#FF5733" />
          </div>
        </div>
      </div>
    </footer>
  );
};

const linkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'color 0.15s ease'
};
