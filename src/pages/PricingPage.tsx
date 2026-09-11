import React, { useState } from 'react';
import { Check, Sparkles, Flame, HelpCircle, ArrowRight, Clock, CheckCircle2, X } from 'lucide-react';
import { PROMOTION_PLANS } from '../data/products';
import { productService } from '../services/productService';

interface PricingPageProps {
  onNavigate: (page: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [selectedPlanForWaitlist, setSelectedPlanForWaitlist] = useState<any | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistNotes, setWaitlistNotes] = useState('');
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const handleSelectPlan = (plan: any) => {
    if (plan.id === 'free' || plan.priceUSD === 0) {
      onNavigate('submit');
    } else {
      setSelectedPlanForWaitlist(plan);
      setWaitlistSubmitted(false);
    }
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setIsSubmittingWaitlist(true);
    await productService.submitPromotionInterest({
      email: waitlistEmail,
      planId: selectedPlanForWaitlist?.id || 'unknown',
      notes: waitlistNotes
    });
    setIsSubmittingWaitlist(false);
    setWaitlistSubmitted(true);
    setTimeout(() => {
      setSelectedPlanForWaitlist(null);
      setWaitlistSubmitted(false);
      setWaitlistNotes('');
    }, 2500);
  };

  return (
    <div className="container" style={{ padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 48px' }}>
        <span className="badge badge-coral" style={{ marginBottom: '12px' }}>
          PROMOTION PACKAGES
        </span>
        <h1 style={{ fontSize: '38px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '16px' }}>
          Accelerate Your Product Discovery
        </h1>
        <p style={{ fontSize: '17px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Transparent, high-ROI promotional placements designed to give your launch the velocity it deserves.
        </p>

        {/* Notice about Payment Beta */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 87, 51, 0.08)',
          border: '1px solid rgba(255, 87, 51, 0.25)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-full)',
          fontSize: '13px',
          color: 'var(--color-primary)',
          fontWeight: 600,
          marginTop: '16px'
        }}>
          <Clock size={15} />
          <span>Automated Stripe payment rails are Coming Soon. Join the Early Beta Waitlist below!</span>
        </div>

        {/* Currency Switcher */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'var(--color-surface-muted)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          marginTop: '24px',
          border: '1px solid var(--color-border)'
        }}>
          <button
            onClick={() => setCurrency('USD')}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '13px',
              fontWeight: currency === 'USD' ? 700 : 500,
              backgroundColor: currency === 'USD' ? '#FFFFFF' : 'transparent',
              color: currency === 'USD' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
              boxShadow: currency === 'USD' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer'
            }}
          >
            USD ($)
          </button>
          <button
            onClick={() => setCurrency('INR')}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '13px',
              fontWeight: currency === 'INR' ? 700 : 500,
              backgroundColor: currency === 'INR' ? '#FFFFFF' : 'transparent',
              color: currency === 'INR' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
              boxShadow: currency === 'INR' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer'
            }}
          >
            INR (₹)
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '24px',
        marginBottom: '64px'
      }}>
        {PROMOTION_PLANS.map(plan => {
          const price = currency === 'USD' 
            ? (plan.priceUSD === 0 ? '$0' : `$${plan.priceUSD}`)
            : (plan.priceINR === 0 ? '₹0' : `₹${plan.priceINR}`);

          return (
            <div
              key={plan.id}
              className="web-card"
              style={{
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                border: plan.popular ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                boxShadow: plan.popular ? 'var(--shadow-card-hover)' : 'var(--shadow-sm)'
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  padding: '3px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.5px'
                }}>
                  MOST POPULAR
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                  {plan.name}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', minHeight: '40px', lineHeight: 1.5, marginBottom: '16px' }}>
                  {plan.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                    {price}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    / {plan.duration}
                  </span>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', marginBottom: '24px' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary-subtle)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span style={{ color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={plan.popular ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ width: '100%' }}
              >
                <span>{plan.id === 'free' || plan.priceUSD === 0 ? `Select ${plan.name}` : `Join Waitlist — ${plan.name}`}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Waitlist Modal */}
      {selectedPlanForWaitlist && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="web-card" style={{
            maxWidth: '460px',
            width: '100%',
            padding: '28px',
            position: 'relative',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <button
              onClick={() => setSelectedPlanForWaitlist(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-coral">EARLY BETA ACCESS</span>
              <span className="badge badge-boost">PAYMENTS COMING SOON</span>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--color-text-main)' }}>
              {selectedPlanForWaitlist.name} Waitlist
            </h3>

            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Direct Stripe payment checkout is currently undergoing invite-only testing. Enter your email to receive early access approval when paid boosts open.
            </p>

            {waitlistSubmitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 size={40} color="var(--color-success)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>You're on the list!</h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  We will notify you immediately once self-serve promotion checkouts launch.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Founder Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="founder@yourproduct.com"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Product Name / Target Launch Date (optional)
                  </label>
                  <input
                    type="text"
                    value={waitlistNotes}
                    onChange={(e) => setWaitlistNotes(e.target.value)}
                    placeholder="e.g. MySaaS (Launching next Tuesday)"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForWaitlist(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingWaitlist}
                    className="btn btn-primary btn-sm"
                  >
                    {isSubmittingWaitlist ? 'Registering...' : 'Request Early Access'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FAQ */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '32px', color: 'var(--color-text-main)' }}>
          Frequently Asked Questions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="web-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
              How does the ranking algorithm work with paid promotions?
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Promoted products receive highlighted placement and a controlled velocity coefficient multiplier, but authentic unique user clicks remain the bedrock of the algorithm. We will never sell fixed #1 spots to poor quality tools.
            </p>
          </div>

          <div className="web-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
              When does my 48-Hour Boost or 7-Day Featured placement start?
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Immediately upon approval! You can schedule the exact kickoff hour in your Founder Dashboard if you want to align it with an X or Product Hunt launch day.
            </p>
          </div>

          <div className="web-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
              Can I upgrade my tier later?
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Yes! You can upgrade from Free to 48-Hour Boost or 7-Day Featured at any time directly from your product management dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
