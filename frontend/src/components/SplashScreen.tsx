import React, { useState, useEffect, useCallback } from 'react';
import { Hotel } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onFinish, 
  duration = 2000 
}) => {
  const [mounted, setMounted] = useState(true);
  const [fading, setFading] = useState(false);

  const dismiss = useCallback(() => {
    // Notify Hero to begin staggered entrance immediately
    window.dispatchEvent(new CustomEvent('teranga-hero-reveal'));
    setFading(true);
    setTimeout(() => {
      setMounted(false);
      document.body.style.overflow = '';
      if (onFinish) onFinish();
    }, 550);
  }, [onFinish]);

  useEffect(() => {
    // Prevent background scrolling while splash is actively displaying
    document.body.style.overflow = 'hidden';

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      const quickTimer = setTimeout(() => {
        dismiss();
      }, 250);
      return () => {
        clearTimeout(quickTimer);
        document.body.style.overflow = '';
      };
    }

    // Trigger hero entrance slightly before fadeout completes (at ~1400ms)
    const heroTriggerTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('teranga-hero-reveal'));
    }, Math.max(duration - 600, 1300));

    // Smooth fade-out of splash screen (at ~1500ms)
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, Math.max(duration - 500, 1450));

    // Unmount completely from DOM
    const removeTimer = setTimeout(() => {
      setMounted(false);
      document.body.style.overflow = '';
      if (onFinish) onFinish();
    }, duration);

    // Escape or Enter key dismisses immediately
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        dismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(heroTriggerTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [duration, dismiss, onFinish]);

  if (!mounted) return null;

  return (
    <div 
      onClick={dismiss}
      role="dialog"
      aria-label="Écran de démarrage Teranga Palace Hotel"
      tabIndex={0}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#022C25] text-white transition-opacity duration-550 ease-out select-none cursor-pointer outline-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-xs sm:max-w-sm md:max-w-md w-auto">
        
        {/* ================================================== */}
        {/* LOGO OFFICIEL TERANGA PALACE HOTEL                 */}
        {/* (Exactement le logo présent dans le projet)        */}
        {/* ================================================== */}
        <div className="animate-splash-logo mb-5 flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#DFC58E] via-[#C9A86A] to-[#B89454] flex items-center justify-center shadow-2xl border border-[#DFC58E]/40">
            <Hotel className="w-8 h-8 sm:w-10 sm:h-10 text-[#022C25]" />
          </div>
        </div>

        {/* ================================================== */}
        {/* NOM DE L'HÔTEL                                     */}
        {/* ================================================== */}
        <div className="animate-splash-text flex flex-col items-center">
          <span className="font-serif text-xl sm:text-2xl md:text-3xl tracking-[0.22em] font-semibold text-[#F7F4EC] uppercase drop-shadow-sm">
            TERANGA PALACE
          </span>
          <span className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#C9A86A] font-medium mt-1">
            HOTEL
          </span>
        </div>

        {/* ================================================== */}
        {/* PETITE LIGNE DÉCORATIVE DORÉE                      */}
        {/* (Animation horizontale de gauche vers la droite)   */}
        {/* ================================================== */}
        <div className="animate-splash-line my-4 w-28 sm:w-36 h-[1.5px] bg-[#C9A86A] max-w-full"></div>

        {/* ================================================== */}
        {/* "DAKAR • SÉNÉGAL" DISCRET                          */}
        {/* ================================================== */}
        <div className="animate-splash-subtext">
          <span className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-[#DFC58E]/85 font-light">
            DAKAR • SÉNÉGAL
          </span>
        </div>

      </div>
    </div>
  );
};
