import React from 'react';
import { TrendingUp, ShieldCheck, Heart, Users, Sparkles, Target, Zap } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="container" style={{ padding: '48px 24px 80px', maxWidth: '880px' }}>
      {/* Hero header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div className="badge badge-coral" style={{ marginBottom: '12px' }}>
          OUR MISSION
        </div>
        <h1 style={{ fontSize: '38px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '16px' }}>
          Built to Democratize Product Discovery
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          VisoRank was created by builders, for builders. Our mission is simple: provide an open, meritocratic stage where outstanding tools rise on real merit.
        </p>
      </div>

      {/* Core Values Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '24px',
        marginBottom: '56px'
      }}>
        <div className="web-card" style={{ padding: '28px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-main)' }}>
            Transparent Rankings
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            No backroom deals or pay-to-win placements. Every rank is driven by authenticated interest, velocity, and community engagement.
          </p>
        </div>

        <div className="web-card" style={{ padding: '28px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Zap size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-main)' }}>
            Equal Velocity Playing Field
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Our mathematical time-decay formula ensures that new solo-founder tools compete fairly against enterprise incumbent budgets.
          </p>
        </div>

        <div className="web-card" style={{ padding: '28px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-warning-bg)',
            color: 'var(--color-warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Users size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-main)' }}>
            Global Builder Network
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Connecting founders with high-intent software buyers, early adopters, angel investors, and beta testers across 140+ countries.
          </p>
        </div>
      </div>

      {/* Manifesto */}
      <div className="web-card" style={{ padding: '40px', lineHeight: 1.8 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px', color: 'var(--color-text-main)' }}>
          The VisoRank Manifesto
        </h2>

        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
          Every day, thousands of talented engineers and designers ship groundbreaking applications. Yet most die in obscurity not because the software is flawed, but because existing discovery directories demand thousands of dollars in sponsored fees or rely on algorithmic black boxes.
        </p>

        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
          VisoRank changes the game. We provide real-time telemetry, transparent ranking math, verified organic traffic, and affordable promotion options that start at $2.
        </p>

        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>
          Whether you built an autonomous AI browser agent or a micro-SaaS invoicing widget, VisoRank gives you the visibility you worked so hard to achieve.
        </p>
      </div>
    </div>
  );
};
