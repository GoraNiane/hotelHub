import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User as UserIcon, Hotel, Phone, MapPin, Mail, ArrowRight, Globe, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SplashScreen } from '../components/SplashScreen';

export const PublicLayout: React.FC = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentLang, setCurrentLang] = useState<'FR' | 'EN'>('FR');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Dynamic Scroll Listener for Adaptive Sticky Header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (!isHome) {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSuccess(false), 4000);
    }
  };

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'RECEPTIONIST': return '/reception/dashboard';
      default: return '/client/dashboard';
    }
  };

  // Header appearance state: transparent on hero at the top of homepage, deep green when scrolled or on inner pages
  const headerBgClass = (!isHome || isScrolled)
    ? 'bg-[#022C25]/95 backdrop-blur-md border-b border-[#C9A86A]/25 shadow-xl py-3.5'
    : 'bg-[#022C25]/20 backdrop-blur-sm border-b border-white/10 py-5';

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F4EC] text-[#16352F] font-sans">
      
      {/* Écran de démarrage avec logo animé */}
      <SplashScreen duration={2000} />

      {/* Sticky Adaptive Navbar */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ease-in-out text-white ${headerBgClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group focus:outline-none">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DFC58E] to-[#C9A86A] flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105 border border-[#C9A86A]/50">
                <Hotel className="w-5 h-5 text-[#022C25]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg md:text-xl tracking-wider font-semibold text-white drop-shadow-sm group-hover:text-[#DFC58E] transition-colors">
                  TERANGA PALACE
                </span>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#C9A86A] font-medium">
                  Hotel Dakar ★★★★★
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7" aria-label="Navigation principale">
              <Link
                to="/"
                className={`text-xs uppercase tracking-widest transition-colors duration-200 py-1 border-b-2 font-medium ${
                  isHome
                    ? 'border-[#C9A86A] text-[#DFC58E]'
                    : 'border-transparent text-white/90 hover:text-[#DFC58E] hover:border-[#C9A86A]/40'
                }`}
              >
                Accueil
              </Link>
              
              <Link
                to="/rooms"
                className={`text-xs uppercase tracking-widest transition-colors duration-200 py-1 border-b-2 font-medium ${
                  location.pathname === '/rooms'
                    ? 'border-[#C9A86A] text-[#DFC58E]'
                    : 'border-transparent text-white/90 hover:text-[#DFC58E] hover:border-[#C9A86A]/40'
                }`}
              >
                Nos chambres
              </Link>

              <button
                onClick={() => scrollToSection('restaurant')}
                className="text-xs uppercase tracking-widest text-white/90 hover:text-[#DFC58E] py-1 border-b-2 border-transparent hover:border-[#C9A86A]/40 font-medium transition-colors"
              >
                Restaurant
              </button>

              <button
                onClick={() => scrollToSection('services')}
                className="text-xs uppercase tracking-widest text-white/90 hover:text-[#DFC58E] py-1 border-b-2 border-transparent hover:border-[#C9A86A]/40 font-medium transition-colors"
              >
                Services
              </button>

              <button
                onClick={() => scrollToSection('galerie')}
                className="text-xs uppercase tracking-widest text-white/90 hover:text-[#DFC58E] py-1 border-b-2 border-transparent hover:border-[#C9A86A]/40 font-medium transition-colors"
              >
                Galerie
              </button>

              <button
                onClick={() => scrollToSection('localisation')}
                className="text-xs uppercase tracking-widest text-white/90 hover:text-[#DFC58E] py-1 border-b-2 border-transparent hover:border-[#C9A86A]/40 font-medium transition-colors"
              >
                Contact
              </button>
            </nav>

            {/* Desktop Action Zone */}
            <div className="hidden md:flex items-center gap-4">
              
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 text-xs text-white/90 hover:text-[#DFC58E] px-2.5 py-1.5 rounded border border-white/20 hover:border-[#C9A86A]/60 transition-colors"
                  aria-label="Sélectionner la langue"
                >
                  <Globe className="w-3.5 h-3.5 text-[#C9A86A]" />
                  <span className="font-semibold tracking-wider">{currentLang}</span>
                  <ChevronDown className="w-3 h-3 text-[#C9A86A]" />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-28 bg-[#022C25] border border-[#C9A86A]/30 rounded shadow-2xl py-1 z-50 text-xs">
                    <button
                      onClick={() => { setCurrentLang('FR'); setLangDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between text-white hover:bg-[#073F34] hover:text-[#DFC58E]"
                    >
                      <span>Français</span>
                      {currentLang === 'FR' && <Check className="w-3 h-3 text-[#C9A86A]" />}
                    </button>
                    <button
                      onClick={() => { setCurrentLang('EN'); setLangDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between text-white hover:bg-[#073F34] hover:text-[#DFC58E]"
                    >
                      <span>English</span>
                      {currentLang === 'EN' && <Check className="w-3 h-3 text-[#C9A86A]" />}
                    </button>
                  </div>
                )}
              </div>

              {/* User Account / Session */}
              {isAuthenticated && currentUser ? (
                <div className="flex items-center gap-2">
                  <Link
                    to={getDashboardPath(currentUser.role)}
                    className="flex items-center gap-2 text-xs font-medium text-[#DFC58E] hover:text-white px-3 py-2 rounded border border-[#C9A86A]/40 hover:bg-[#073F34] transition-all"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Mon Espace ({currentUser.firstName})</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Déconnexion"
                    className="text-white/70 hover:text-red-400 p-2 transition-colors"
                    aria-label="Déconnexion"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-xs uppercase tracking-wider text-white/90 hover:text-[#DFC58E] font-medium px-2 py-1.5 transition-colors"
                >
                  Connexion
                </Link>
              )}

              {/* Primary Luxury CTA: RÉSERVER */}
              <Link
                to="/rooms"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#DFC58E] via-[#C9A86A] to-[#B89454] hover:from-[#E8D4A8] hover:to-[#C9A86A] text-[#022C25] font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span>Réserver</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

            </div>

            {/* Mobile Actions (Language + Booking CTA + Hamburger) */}
            <div className="lg:hidden flex items-center gap-2.5">
              <Link
                to="/rooms"
                className="bg-[#C9A86A] text-[#022C25] font-bold text-[11px] uppercase tracking-wider px-3.5 py-2 rounded-sm"
              >
                Réserver
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-[#DFC58E] p-2 focus:outline-none"
                aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Slide-down Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#022C25] border-t border-[#C9A86A]/20 px-6 py-8 space-y-4 shadow-2xl animate-fade-in">
            <nav className="flex flex-col space-y-3 pb-4 border-b border-white/10">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 text-sm uppercase tracking-wider font-medium ${
                  isHome ? 'text-[#DFC58E]' : 'text-white hover:text-[#DFC58E]'
                }`}
              >
                Accueil
              </Link>
              <Link
                to="/rooms"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm uppercase tracking-wider font-medium text-white hover:text-[#DFC58E]"
              >
                Nos chambres
              </Link>
              <button
                onClick={() => scrollToSection('restaurant')}
                className="text-left py-2 text-sm uppercase tracking-wider font-medium text-white hover:text-[#DFC58E]"
              >
                Restaurant
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="text-left py-2 text-sm uppercase tracking-wider font-medium text-white hover:text-[#DFC58E]"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection('galerie')}
                className="text-left py-2 text-sm uppercase tracking-wider font-medium text-white hover:text-[#DFC58E]"
              >
                Galerie
              </button>
              <button
                onClick={() => scrollToSection('localisation')}
                className="text-left py-2 text-sm uppercase tracking-wider font-medium text-white hover:text-[#DFC58E]"
              >
                Contact
              </button>
            </nav>

            <div className="pt-2 space-y-3">
              {/* Language Selector in Mobile Menu */}
              <div className="flex items-center justify-between py-2 text-xs text-white/80">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#C9A86A]" /> Langue
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentLang('FR')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      currentLang === 'FR' ? 'bg-[#C9A86A] text-[#022C25]' : 'bg-[#073F34] text-white'
                    }`}
                  >
                    FR
                  </button>
                  <button
                    onClick={() => setCurrentLang('EN')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      currentLang === 'EN' ? 'bg-[#C9A86A] text-[#022C25]' : 'bg-[#073F34] text-white'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {isAuthenticated && currentUser ? (
                <>
                  <Link
                    to={getDashboardPath(currentUser.role)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#073F34] text-[#DFC58E] font-medium text-sm rounded border border-[#C9A86A]/40"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Mon Espace ({currentUser.firstName})</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-red-400 hover:text-red-300 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 border border-[#C9A86A]/60 text-[#DFC58E] font-medium text-xs uppercase tracking-wider rounded"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 bg-[#073F34] text-white font-medium text-xs uppercase tracking-wider rounded"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}

              <Link
                to="/rooms"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-3.5 bg-gradient-to-r from-[#DFC58E] to-[#C9A86A] text-[#022C25] font-bold text-xs uppercase tracking-widest rounded shadow-lg mt-3"
              >
                Réserver une chambre
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Ultra-Premium 4-Column Footer */}
      <footer className="bg-[#022C25] text-[#F7F4EC] border-t border-[#073F34] relative overflow-hidden">
        {/* Subtle Luxury Pattern */}
        <div className="absolute inset-0 bg-luxury-pattern opacity-30 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            
            {/* Column 1: Brand details */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DFC58E] to-[#C9A86A] flex items-center justify-center shadow-md border border-[#C9A86A]/40">
                  <Hotel className="w-5 h-5 text-[#022C25]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg tracking-wider font-semibold text-[#DFC58E]">TERANGA PALACE</h3>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-white/60">Hôtel de Luxe · Dakar</p>
                </div>
              </div>
              <p className="text-xs text-white/75 leading-relaxed font-light">
                Une invitation au raffinement contemporain et à la mythique hospitalité sénégalaise, niché au bord de l'océan dans le quartier prestigieux des Almadies.
              </p>
              <div className="pt-2 text-[11px] text-[#C9A86A] flex items-center gap-1.5 font-medium tracking-wide">
                <span>★★★★★ Établissement 5 étoiles certifié</span>
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div>
              <h4 className="font-serif text-sm font-semibold tracking-widest uppercase text-[#DFC58E] mb-5 border-b border-[#C9A86A]/20 pb-2">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-xs text-white/80 font-light">
                <li>
                  <Link to="/" className="hover:text-[#DFC58E] transition-colors flex items-center gap-1.5">
                    <span className="text-[#C9A86A]">›</span> Accueil
                  </Link>
                </li>
                <li>
                  <Link to="/rooms" className="hover:text-[#DFC58E] transition-colors flex items-center gap-1.5">
                    <span className="text-[#C9A86A]">›</span> Nos chambres & suites
                  </Link>
                </li>
                <li>
                  <button onClick={() => scrollToSection('restaurant')} className="hover:text-[#DFC58E] transition-colors flex items-center gap-1.5 text-left">
                    <span className="text-[#C9A86A]">›</span> Restaurant gastronomique
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('services')} className="hover:text-[#DFC58E] transition-colors flex items-center gap-1.5 text-left">
                    <span className="text-[#C9A86A]">›</span> Services & Privilèges
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('galerie')} className="hover:text-[#DFC58E] transition-colors flex items-center gap-1.5 text-left">
                    <span className="text-[#C9A86A]">›</span> Galerie photographique
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('localisation')} className="hover:text-[#DFC58E] transition-colors flex items-center gap-1.5 text-left">
                    <span className="text-[#C9A86A]">›</span> Localisation & Accès
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact details */}
            <div>
              <h4 className="font-serif text-sm font-semibold tracking-widest uppercase text-[#DFC58E] mb-5 border-b border-[#C9A86A]/20 pb-2">
                Contact & Accès
              </h4>
              <ul className="space-y-3.5 text-xs text-white/80 font-light">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C9A86A] shrink-0 mt-0.5" />
                  <span>Route des Almadies, BP 29000, Dakar, Sénégal</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#C9A86A] shrink-0" />
                  <a href="tel:+221338990000" className="hover:text-[#DFC58E] transition-colors font-medium">
                    +221 33 899 00 00
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#C9A86A] shrink-0" />
                  <a href="mailto:contact@terangapalace.com" className="hover:text-[#DFC58E] transition-colors">
                    contact@terangapalace.com
                  </a>
                </li>
                <li className="pt-2 text-[11px] text-white/60">
                  Conciergerie & Réception disponibles 24h/24, 7j/7.
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter & Social */}
            <div className="space-y-5">
              <h4 className="font-serif text-sm font-semibold tracking-widest uppercase text-[#DFC58E] mb-5 border-b border-[#C9A86A]/20 pb-2">
                Newsletter
              </h4>
              <p className="text-xs text-white/75 leading-relaxed font-light">
                Recevez en avant-première nos offres exclusives et actualités culturelles de Dakar.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Votre adresse email"
                    required
                    className="flex-grow bg-[#073F34] border border-[#C9A86A]/40 text-white placeholder-white/40 text-xs px-3.5 py-2.5 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#C9A86A]"
                  />
                  <button
                    type="submit"
                    className="bg-[#C9A86A] hover:bg-[#DFC58E] text-[#022C25] font-bold text-xs uppercase px-4 py-2.5 rounded-sm transition-colors shrink-0"
                  >
                    S'inscrire
                  </button>
                </div>
                {newsletterSuccess && (
                  <p className="text-[11px] text-[#DFC58E] animate-fade-in">
                    ✓ Merci pour votre inscription au Teranga Palace.
                  </p>
                )}
              </form>

              <div className="pt-2">
                <span className="text-[11px] text-white/60 uppercase tracking-wider block mb-2.5">
                  Suivez notre art de vivre
                </span>
                <div className="flex gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded bg-[#073F34] hover:bg-[#C9A86A] text-white hover:text-[#022C25] flex items-center justify-center text-xs transition-colors border border-[#C9A86A]/30"
                    aria-label="Instagram"
                  >
                    IG
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded bg-[#073F34] hover:bg-[#C9A86A] text-white hover:text-[#022C25] flex items-center justify-center text-xs transition-colors border border-[#C9A86A]/30"
                    aria-label="Facebook"
                  >
                    FB
                  </a>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded bg-[#073F34] hover:bg-[#C9A86A] text-white hover:text-[#022C25] flex items-center justify-center text-xs transition-colors border border-[#C9A86A]/30"
                    aria-label="TikTok"
                  >
                    TK
                  </a>
                  <a
                    href="https://whatsapp.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded bg-[#073F34] hover:bg-[#C9A86A] text-white hover:text-[#022C25] flex items-center justify-center text-xs transition-colors border border-[#C9A86A]/30"
                    aria-label="WhatsApp"
                  >
                    WA
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright & Legal Line */}
          <div className="border-t border-[#073F34] pt-8 mt-16 flex flex-col sm:flex-row justify-between items-center text-xs text-white/60 font-light gap-4">
            <div>
              &copy; 2026 Teranga Palace Hotel. Tous droits réservés.
            </div>
            <div className="flex gap-6">
              <span className="hover:text-[#DFC58E] cursor-pointer transition-colors">Mentions Légales</span>
              <span className="hover:text-[#DFC58E] cursor-pointer transition-colors">Politique de Confidentialité</span>
              <span className="hover:text-[#DFC58E] cursor-pointer transition-colors">CGV</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

