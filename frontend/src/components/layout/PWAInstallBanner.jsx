import React from 'react';
import { usePWA } from '../../hooks/usePWA';
import { useUIStore } from '../../store/uiStore';
import { Button } from '../ui/Button';

export const PWAInstallBanner = () => {
  const { canInstall, install } = usePWA();
  const dismissPwaInstall = useUIStore((state) => state.dismissPwaInstall);

  if (!canInstall) return null;

  return (
    <div className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-base">📲</span>
        <span className="font-sans text-xs md:text-sm text-black font-medium">
          Add NutriVedic to your home screen for quick offline access
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="primary" size="sm" onClick={install}>
          Install
        </Button>
        <button
          type="button"
          onClick={dismissPwaInstall}
          aria-label="Dismiss install banner"
          className="text-muted hover:text-black font-sans text-xs p-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
