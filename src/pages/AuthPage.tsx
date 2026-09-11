import React, { useState } from 'react';
import { TrendingUp, ArrowRight, Mail, Lock, User as UserIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GithubIcon } from '../components/SocialIcons';
import { User } from '../types';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onSuccess: (user: User) => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  mode,
  onSuccess,
  onSwitchMode
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'founder' | 'user' | 'admin'>('founder');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await authService.signUp(email, password, name, role === 'admin' ? 'founder' : role);
        if (res.error) {
          setError(res.error);
        } else if (res.user) {
          onSuccess(res.user);
        } else {
          setInfo('Check your email for confirmation link.');
        }
      } else {
        const res = await authService.signIn(email, password);
        if (res.error) {
          setError(res.error);
        } else if (res.user) {
          onSuccess(res.user);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    setError(null);
    if (!isSupabaseConfigured) {
      // Demo fallback if credentials not yet configured
      const user: User = {
        id: 'usr_' + Date.now(),
        name: `${provider === 'github' ? 'GitHub' : 'Google'} Builder`,
        email: `builder@${provider}.com`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        role: 'founder'
      };
      onSuccess(user);
      return;
    }

    const { error } = await authService.signInWithOAuth(provider);
    if (error) setError(error);
  };

  return (
    <div className="container" style={{ padding: '64px 24px 80px', maxWidth: '440px' }}>
      <div className="web-card" style={{ padding: '36px', boxShadow: 'var(--shadow-md)' }}>
        
        {/* Logo and title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #FF5733 0%, #E04824 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            marginBottom: '16px'
          }}>
            <TrendingUp size={24} />
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>
            {mode === 'login' ? 'Welcome back to VisoRank' : 'Create your Founder Account'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {mode === 'login'
              ? 'Sign in to access your products and analytics'
              : 'Join top indie hackers and SaaS creators'}
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #F87171',
            borderRadius: '8px',
            color: '#DC2626',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #6EE7B7',
            borderRadius: '8px',
            color: '#065F46',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            <CheckCircle2 size={16} />
            <span>{info}</span>
          </div>
        )}

        {/* OAuth Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => handleOAuth('github')}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <GithubIcon size={18} />
            <span>Continue with GitHub</span>
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '24px 0',
          gap: '12px'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Or with email
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--color-text-main)'
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex@startup.io"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-main)'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Password
              </label>
              {mode === 'login' && (
                <a href="#forgot" onClick={e => e.preventDefault()} style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 500 }}>
                  Forgot password?
                </a>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-main)'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Toggle between login and signup */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('signup')}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('login')}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer' }}
              >
                Log in
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
