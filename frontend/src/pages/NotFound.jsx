import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-center p-4">
      <span className="font-mono text-[12px] uppercase tracking-[2px] text-label mb-2">404 ERROR</span>
      <h1 className="font-serif text-[48px] font-bold text-black mb-4">Page Not Found</h1>
      <p className="font-sans text-sm text-muted max-w-sm mb-8">
        The requested URL was not found in the NutriVedic application.
      </p>
      <Button variant="primary" onClick={() => navigate('/')}>
        Return to Home
      </Button>
    </div>
  );
};
