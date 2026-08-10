import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { googleAuthUrl } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

export const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const [tab, setTab] = useState(initialTab);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');


  const [authError, setAuthError] = useState('');

  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const profile = useAuthStore((state) => state.profile);

  // Handle auth-success redirect from Google OAuth
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      const { setAuth } = useAuthStore.getState();
      setAuth(null, null, token);
      // The client interceptor will attach the token; now fetch user info
      navigate('/dashboard');
    }
  }, [searchParams, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (!profile) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, profile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (tab === 'login') {
        await login({ email, password });
        const currentProfile = useAuthStore.getState().profile;
        if (!currentProfile) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        await register({ email, password, firstName, lastName });
        const currentProfile = useAuthStore.getState().profile;
        if (!currentProfile) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || err.message || 'Authentication failed';
      setAuthError(msg);
    }
  };


  const handleGoogleLogin = () => {
    window.location.href = googleAuthUrl();
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-black">
          Nutri<span className="italic text-muted font-normal">Vedic</span>
        </h1>
        <span className="font-mono text-[10px] uppercase text-label tracking-widest block mt-1">
          AI NUTRITION & AYURVEDA LOG
        </span>
      </div>

      {/* Centered White Card 420px */}
      <div className="w-full max-w-[420px] bg-white border border-border rounded-card p-6 md:p-8 shadow-none">
        {authError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-sans">
            {authError}
          </div>
        )}
        <>
            {/* Tab Toggle */}
            <div className="flex border-b border-border mb-6">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`flex-1 pb-3 font-sans font-medium text-sm transition-colors text-center ${
                  tab === 'login'
                    ? 'text-black border-b-2 border-black'
                    : 'text-muted hover:text-black'
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`flex-1 pb-3 font-sans font-medium text-sm transition-colors text-center ${
                  tab === 'signup'
                    ? 'text-black border-b-2 border-black'
                    : 'text-muted hover:text-black'
                }`}
              >
                Sign up
              </button>
            </div>

            {/* Animated Form Fields */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: tab === 'login' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: tab === 'login' ? 10 : -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  {tab === 'signup' && (
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="FIRST NAME"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                      <Input
                        label="LAST NAME"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  )}

                  <Input
                    label="EMAIL ADDRESS"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <Input
                    label="PASSWORD"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </motion.div>
              </AnimatePresence>

              <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="mt-2">
                {isLoading ? 'Processing...' : tab === 'login' ? 'Log in' : 'Create Account'}
              </Button>
            </form>

            <div className="relative my-6 text-center border-t border-border">
              <span className="font-mono text-[10px] uppercase text-label bg-white px-2 absolute -top-2.5 left-1/2 -translate-x-1/2">
                OR CONTINUE WITH
              </span>
            </div>

            {/* Google OAuth Button */}
            <Button
              variant="secondary"
              fullWidth
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google Single Sign-On
            </Button>
          </>
      </div>
    </div>
  );
};
