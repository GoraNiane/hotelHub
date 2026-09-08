import React, { useState, useEffect } from 'react';
import { Download, X, Hotel, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if user already dismissed or installed the PWA
    const isDismissed = localStorage.getItem('tph_pwa_dismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    if (isDismissed || isStandalone) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for native beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Wait 3 seconds so guest has seen the splash screen and hero first
      setTimeout(() => setShowBanner(true), 3500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // On iOS Safari, show after 5 seconds if not standalone
    if (isIosDevice && !isStandalone) {
      const iosTimer = setTimeout(() => setShowBanner(true), 5000);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        clearTimeout(iosTimer);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem('tph_pwa_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div 
      role="banner" 
      aria-label="Installation de l'application Teranga Palace"
      className="fixed bottom-5 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-fade-up"
    >
      <div className="bg-[#022C25] border border-[#C9A86A]/40 rounded-sm shadow-2xl p-4 text-white flex flex-col gap-3 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          
          {/* Logo Badge */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DFC58E] to-[#C9A86A] flex items-center justify-center shrink-0 shadow-md">
            <Hotel className="w-5 h-5 text-[#022C25]" />
          </div>

          {/* Details */}
          <div className="flex-grow">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#DFC58E] uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A86A]" />
              <span>Application Officielle</span>
            </div>
            <h4 className="font-serif text-sm font-semibold text-white tracking-wide mt-0.5">
              Teranga Palace Hotel
            </h4>
            <p className="text-xs text-white/75 font-light leading-snug mt-1">
              {showIOSGuide 
                ? "Sur Safari : touchez l'icône Partager puis 'Sur l'écran d'accueil'."
                : "Installez l'application sur votre appareil pour réserver hors-ligne et un accès privilégié."}
            </p>
          </div>

          {/* Close button */}
          <button 
            onClick={handleDismiss}
            className="text-white/60 hover:text-white p-1 transition-colors focus:outline-none"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button */}
        {!showIOSGuide ? (
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#C9A86A]/20">
            <button
              onClick={handleDismiss}
              className="text-xs text-white/60 hover:text-white px-3 py-1.5 font-medium transition-colors"
            >
              Plus tard
            </button>
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-2 bg-[#C9A86A] hover:bg-[#DFC58E] text-[#022C25] font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-sm shadow-md transition-all duration-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-end pt-1 border-t border-[#C9A86A]/20">
            <button
              onClick={handleDismiss}
              className="text-xs bg-[#073F34] text-[#DFC58E] font-semibold px-3 py-1.5 rounded-sm border border-[#C9A86A]/40"
            >
              J'ai compris
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
