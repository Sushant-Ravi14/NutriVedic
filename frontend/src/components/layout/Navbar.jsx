import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

export const Navbar = ({ isLanding = false }) => {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-border h-[64px]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
        {/* Brand wordmark */}
        <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-black flex items-center">
          Nutri<span className="italic text-muted font-normal">Vedic</span>
        </Link>

        {/* Desktop Links */}
        {isLanding && (
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="font-sans text-sm text-muted hover:text-black transition-colors">
              Features
            </a>
            <a href="#ayurveda" className="font-sans text-sm text-muted hover:text-black transition-colors">
              Ayurvedic AI
            </a>
            <a href="#pricing" className="font-sans text-sm text-muted hover:text-black transition-colors">
              Pricing
            </a>
          </nav>
        )}

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="secondary" size="sm" onClick={() => { clearAuth(); navigate('/'); }}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                Log in
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/auth?tab=signup')}>
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile navigation menu"
          className="md:hidden p-2 text-black font-sans text-xl"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-border p-4 flex flex-col gap-3">
          {isLanding && (
            <>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans text-sm text-black py-2 border-b border-border"
              >
                Features
              </a>
              <a
                href="#ayurveda"
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans text-sm text-black py-2 border-b border-border"
              >
                Ayurvedic AI
              </a>
            </>
          )}
          {isAuthenticated ? (
            <Button variant="primary" fullWidth onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}>
              Go to Dashboard
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Button variant="secondary" fullWidth onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}>
                Log in
              </Button>
              <Button variant="primary" fullWidth onClick={() => { setMobileMenuOpen(false); navigate('/auth?tab=signup'); }}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
