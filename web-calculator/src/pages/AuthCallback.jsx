import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Handles OAuth and magic link redirects.
 * Supabase appends #access_token=... to the URL — the client lib picks it up automatically.
 */
function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase client auto-detects the token in the URL hash
    // Just wait a tick then redirect to dashboard
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-icon">⏳</div>
        <h1>Signing you in...</h1>
        <p className="auth-subtitle">Hang tight, redirecting to your dashboard.</p>
      </div>
    </div>
  );
}

export default AuthCallback;
