import { useEffect } from 'react';
import { useUIStore } from '../store/uiStore';

export const usePWA = () => {
  const pwaInstallPrompt = useUIStore((state) => state.pwaInstallPrompt);
  const setPwaInstallPrompt = useUIStore((state) => state.setPwaInstallPrompt);
  const pwaDismissed = useUIStore((state) => state.pwaDismissed);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setPwaInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [setPwaInstallPrompt]);

  const install = async () => {
    if (!pwaInstallPrompt) return;
    pwaInstallPrompt.prompt();
    const { outcome } = await pwaInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setPwaInstallPrompt(null);
    }
  };

  return {
    canInstall: Boolean(pwaInstallPrompt) && !pwaDismissed,
    install
  };
};
