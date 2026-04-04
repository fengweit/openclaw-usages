import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase, isSupabaseReady } from '../lib/supabase';
import './Landing.css';

function Landing() {
  const { user } = useAuth();
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState(''); // '' | 'sending' | 'success' | 'error'
  const [waitlistError, setWaitlistError] = useState('');

  async function handleWaitlist(e) {
    e.preventDefault();
    if (!waitlistEmail) return;

    setWaitlistStatus('sending');
    setWaitlistError('');

    if (isSupabaseReady()) {
      const { error } = await supabase
        .from('waitlist')
        .upsert({ email: waitlistEmail, source: 'landing' }, { onConflict: 'email' });

      if (error) {
        setWaitlistStatus('error');
        setWaitlistError(error.message);
      } else {
        setWaitlistStatus('success');
      }
    } else {
      // Fallback: just show success (no backend)
      setWaitlistStatus('success');
    }
  }

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Know where your<br />
            <span className="gradient-text">AI spend goes</span>
          </h1>
          <p className="hero-subtitle">
            OpenClaw Usage Analyzer shows you exactly what you're spending on AI models,
            which messages cost the most, and how to save 40-80% by switching models smartly.
          </p>

          <div className="hero-cta">
            {user ? (
              <Link to="/dashboard" className="cta-btn primary">Go to Dashboard →</Link>
            ) : (
              <>
                <Link to="/signup" className="cta-btn primary">Get Started Free</Link>
                <Link to="/login" className="cta-btn secondary">Sign In</Link>
              </>
            )}
          </div>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">92%</span>
              <span className="stat-label">avg cache savings</span>
            </div>
            <div className="stat">
              <span className="stat-number">$340→$16</span>
              <span className="stat-label">monthly with hybrid routing</span>
            </div>
            <div className="stat">
              <span className="stat-number">43%</span>
              <span className="stat-label">of cost in top 10 messages</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>What you get</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Usage Breakdown</h3>
            <p>See exactly which models you're using, how many tokens, and what each session costs.</p>
            <span className="feature-tag free">Free</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Cost Comparison</h3>
            <p>Compare your actual usage costs against every major AI provider — Claude, GPT-4, Gemini.</p>
            <span className="feature-tag free">Free</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Spending Trends</h3>
            <p>Daily, weekly, monthly cost trends. Know your burn rate before it surprises you.</p>
            <span className="feature-tag free">Free</span>
          </div>
          <div className="feature-card highlight">
            <div className="feature-icon">🔀</div>
            <h3>Smart Routing</h3>
            <p>Automatically route simple queries to cheap models and complex ones to premium. Save 40-60%.</p>
            <span className="feature-tag coming">Coming Soon</span>
          </div>
          <div className="feature-card highlight">
            <div className="feature-icon">🔍</div>
            <h3>Prompt Optimization</h3>
            <p>Detect verbose prompts, redundant context, and token waste. Fix them automatically.</p>
            <span className="feature-tag coming">Coming Soon</span>
          </div>
          <div className="feature-card highlight">
            <div className="feature-icon">📧</div>
            <h3>Cost Alerts</h3>
            <p>Get notified when you hit spending thresholds. Never get a surprise bill again.</p>
            <span className="feature-tag coming">Coming Soon</span>
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="waitlist-section">
        <div className="waitlist-content">
          <h2>🚀 Smart Routing is coming</h2>
          <p>Save 40-60% automatically. Get notified when it launches.</p>

          {waitlistStatus === 'success' ? (
            <div className="waitlist-success">
              ✅ You're on the list! We'll email you when Smart Routing is live.
            </div>
          ) : (
            <form className="waitlist-form" onSubmit={handleWaitlist}>
              <input
                type="email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <button type="submit" disabled={waitlistStatus === 'sending'}>
                {waitlistStatus === 'sending' ? 'Joining...' : 'Join Waitlist'}
              </button>
            </form>
          )}
          {waitlistError && <p className="waitlist-error">{waitlistError}</p>}
          <p className="waitlist-note">No spam. One email when it's ready.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>
          OpenClaw Usage Analyzer · 
          <a href="https://github.com/fengweit/openclaw-usages" target="_blank" rel="noopener">GitHub</a> · 
          MIT License
        </p>
      </footer>
    </div>
  );
}

export default Landing;
