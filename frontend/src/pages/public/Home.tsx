import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  ArrowRight, 
  Wifi, 
  ShieldCheck, 
  UtensilsCrossed, 
  Coffee, 
  Sparkles, 
  Star, 
  MapPin, 
  Car, 
  Waves, 
  Clock, 
  CheckCircle2, 
  BedDouble,
  X,
  PhoneCall,
  Tv,
  Wind,
  Plane,
  Compass
} from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import { mockDb } from '../../services/mockDb';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { setBookingDates } = useBooking();

  // Search Engine Form State
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [roomType, setRoomType] = useState('ALL');

  // Testimonials Carousel State for Mobile
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  // Lightbox Modal State for Gallery
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Restaurant Menu Modal State
  const [restaurantModalOpen, setRestaurantModalOpen] = useState(false);

  // Staggered Hero entrance animation (synchronized with splash screen)
  const [heroAnimated, setHeroAnimated] = useState(() => {
    return typeof window !== 'undefined' && (
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
      Boolean(sessionStorage.getItem('tp_hero_seen'))
    );
  });

  useEffect(() => {
    if (heroAnimated) return;

    const handleHeroReveal = () => {
      setHeroAnimated(true);
      sessionStorage.setItem('tp_hero_seen', 'true');
    };

    window.addEventListener('teranga-hero-reveal', handleHeroReveal);
    
    // Safety fallback timer so Hero never stays hidden
    const fallbackTimer = setTimeout(() => {
      setHeroAnimated(true);
      sessionStorage.setItem('tp_hero_seen', 'true');
    }, 1700);

    return () => {
      window.removeEventListener('teranga-hero-reveal', handleHeroReveal);
      clearTimeout(fallbackTimer);
    };
  }, [heroAnimated]);

  // Connect search form to booking context & navigate
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingDates(checkIn, checkOut, adults, children);
    navigate(`/rooms?type=${roomType}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`);
  };

  // Rooms Data (Curated high-res imagery matching luxury hotel standards)
  const dbRooms = mockDb.getRooms();
  const standardRoom = dbRooms.find(r => r.roomType === 'STANDARD') || { id: 'room-standard', pricePerNight: 65000, size: 28, capacity: 2 };
  const deluxeRoom = dbRooms.find(r => r.roomType === 'DELUXE') || { id: 'room-deluxe', pricePerNight: 85000, size: 38, capacity: 2 };
  const suiteRoom = dbRooms.find(r => r.roomType === 'SUITE') || { id: 'room-suite', pricePerNight: 120000, size: 65, capacity: 3 };

  const featuredRooms = [
    {
      id: standardRoom.id,
      name: 'CHAMBRE STANDARD',
      categoryBadge: 'Standard',
      price: '65 000 FCFA',
      capacity: '2 personnes',
      size: `${standardRoom.size || 28} m²`,
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      amenities: [
        { label: 'Wi-Fi', icon: Wifi },
        { label: 'Climatisation', icon: Wind },
        { label: 'Petit déjeuner', icon: Coffee },
        { label: 'TV', icon: Tv }
      ]
    },
    {
      id: deluxeRoom.id,
      name: 'CHAMBRE DELUXE',
      categoryBadge: 'Deluxe',
      price: '85 000 FCFA',
      capacity: '2 personnes',
      size: `${deluxeRoom.size || 38} m²`,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      amenities: [
        { label: 'Wi-Fi', icon: Wifi },
        { label: 'Climatisation', icon: Wind },
        { label: 'Petit déjeuner', icon: Coffee },
        { label: 'TV', icon: Tv }
      ]
    },
    {
      id: suiteRoom.id,
      name: 'SUITE PREMIUM',
      categoryBadge: 'Suite',
      price: '120 000 FCFA',
      capacity: '3 personnes',
      size: `${suiteRoom.size || 65} m²`,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      amenities: [
        { label: 'Wi-Fi', icon: Wifi },
        { label: 'Climatisation', icon: Wind },
        { label: 'Petit déjeuner', icon: Coffee },
        { label: 'TV', icon: Tv }
      ]
    }
  ];

  // 6 Services inclus & privilèges
  const servicesList = [
    {
      name: 'Wi-Fi gratuit',
      icon: Wifi,
      desc: 'Connexion haut débit sans fil illimitée dans toutes les chambres et espaces de l\'hôtel.'
    },
    {
      name: 'Piscine chauffée',
      icon: Waves,
      desc: 'Superbe bassin extérieur chauffé entouré de transats et palmiers sous le soleil de Dakar.'
    },
    {
      name: 'Restaurant Teranga',
      icon: UtensilsCrossed,
      desc: 'Haute gastronomie inspirée des saveurs locales sénégalaises et de la cuisine internationale.'
    },
    {
      name: 'Parking sécurisé',
      icon: Car,
      desc: 'Stationnement privé gardé 24h/24 avec service de conciergerie et voiturier dédié.'
    },
    {
      name: 'Service en chambre 24h/24',
      icon: Coffee,
      desc: 'Carte soignée et boissons raffinées servies dans votre suite à toute heure.'
    },
    {
      name: 'Réception 24h/24',
      icon: Clock,
      desc: 'Une équipe attentive et dévouée à votre écoute en permanence pour votre confort absolu.'
    }
  ];

  // Témoignages exacts de référence
  const testimonials = [
    {
      id: 'rev-1',
      name: 'Fatou D.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      comment: "Une expérience exceptionnelle ! Le personnel est aux petits soins et le restaurant est un vrai régal."
    },
    {
      id: 'rev-2',
      name: 'Mamadou S.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      comment: "Chambre très confortable, cadre magnifique et service irréprochable."
    },
    {
      id: 'rev-3',
      name: 'Aïssatou B.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      comment: "Un séjour parfait, du début à la fin. L'emplacement est idéal et la qualité du service est exceptionnelle."
    }
  ];

  // Galerie photo
  const galleryPhotos = [
    {
      url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      title: 'Piscine & Jardin tropical'
    },
    {
      url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      title: 'Suite Présidentielle'
    },
    {
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      title: 'Restaurant Teranga Bistro'
    },
    {
      url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      title: 'Terrasse face à l\'océan'
    }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F7F4EC] text-[#16352F]">
      
      {/* ================================================== */}
      {/* 1. HERO SECTION (80-90vh Desktop)                  */}
      {/* ================================================== */}
      <section className="relative min-h-[85vh] lg:min-h-[88vh] flex items-center justify-start bg-[#022C25] overflow-hidden">
        
        {/* Warm, Luminous Luxury Photograph */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=85" 
            alt="Teranga Palace Hotel Dakar - Piscine & Architecture de Luxe" 
            className={`w-full h-full object-cover object-center scale-100 ${
              heroAnimated ? 'hero-img-enter' : 'opacity-0'
            }`}
          />
          {/* Subtle warm overlay allowing image luminosity while keeping text perfectly readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#022C25]/90 via-[#022C25]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#022C25]/90 via-transparent to-black/20"></div>
        </div>

        {/* Content Aligned Left */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-14 pb-28 lg:pb-36">
          <div className="max-w-2xl text-left space-y-6">
            
            {/* Petit label */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-[#022C25]/75 backdrop-blur-sm border border-[#C9A86A]/60 text-[#DFC58E] text-[11px] font-bold tracking-[0.25em] uppercase ${
              heroAnimated ? 'hero-label-enter' : 'opacity-0'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-[#C9A86A]" />
              <span>HÔTEL DE LUXE À DAKAR</span>
            </div>

            {/* Titre */}
            <h1 className={`font-serif text-4xl sm:text-5xl lg:text-6xl text-white font-bold tracking-tight leading-[1.12] ${
              heroAnimated ? 'hero-title-enter' : 'opacity-0'
            }`}>
              Bienvenue au <br />
              <span className="text-[#DFC58E] font-normal italic">Teranga Palace Hotel</span>
            </h1>

            {/* Sous-titre */}
            <p className={`text-lg sm:text-xl font-serif text-[#EFE8D8] font-medium tracking-wide ${
              heroAnimated ? 'hero-subtitle-enter' : 'opacity-0'
            }`}>
              L'élégance sénégalaise, au cœur de Dakar
            </p>

            {/* Description */}
            <p className={`text-sm sm:text-base text-[#F7F4EC]/90 font-light leading-relaxed max-w-xl ${
              heroAnimated ? 'hero-desc-enter' : 'opacity-0'
            }`}>
              Découvrez une expérience unique où confort, gastronomie et hospitalité Teranga se rencontrent.
            </p>

            {/* Boutons */}
            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3 ${
              heroAnimated ? 'hero-btn-enter' : 'opacity-0'
            }`}>
              {/* Premier bouton doré */}
              <button 
                onClick={() => navigate('/rooms')}
                className="group inline-flex items-center justify-center gap-3 bg-[#C9A86A] hover:bg-[#DFC58E] text-[#022C25] font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-sm shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span>RÉSERVER UNE CHAMBRE</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>

              {/* Deuxième bouton transparent avec bordure claire */}
              <button 
                onClick={() => {
                  const element = document.getElementById('experience');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white border border-[#EFE8D8]/80 hover:border-white font-medium text-xs uppercase tracking-widest px-8 py-4 rounded-sm transition-all duration-300"
              >
                DÉCOUVRIR L'HÔTEL
              </button>
            </div>

          </div>
        </div>

      </section>

      {/* ================================================== */}
      {/* 2. MODULE DE RÉSERVATION (Chevauchement Hero)      */}
      {/* ================================================== */}
      <div className="relative z-30 max-w-6xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-20 lg:-mt-24">
        <div className="bg-white border border-[#EFE8D8] rounded-md shadow-2xl p-6 lg:p-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
            
            {/* ARRIVÉE */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#073F34] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C9A86A]" /> ARRIVÉE
              </label>
              <input 
                type="date" 
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EFE8D8] rounded-sm px-3.5 py-3 text-sm text-[#16352F] font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A86A]"
                required
              />
            </div>

            {/* DÉPART */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#073F34] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C9A86A]" /> DÉPART
              </label>
              <input 
                type="date" 
                value={checkOut}
                min={checkIn || new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EFE8D8] rounded-sm px-3.5 py-3 text-sm text-[#16352F] font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A86A]"
                required
              />
            </div>

            {/* VOYAGEURS */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#073F34] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C9A86A]" /> VOYAGEURS
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8D8] rounded-sm px-2.5 py-3 text-xs text-[#16352F] font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A86A]"
                >
                  <option value={1}>1 Adulte</option>
                  <option value={2}>2 Adultes</option>
                  <option value={3}>3 Adultes</option>
                  <option value={4}>4 Adultes</option>
                </select>
                <select 
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full bg-[#FAF8F5] border border-[#EFE8D8] rounded-sm px-2.5 py-3 text-xs text-[#16352F] font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A86A]"
                >
                  <option value={0}>0 Enfant</option>
                  <option value={1}>1 Enfant</option>
                  <option value={2}>2 Enfants</option>
                  <option value={3}>3 Enfants</option>
                </select>
              </div>
            </div>

            {/* CHAMBRE */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#073F34] flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5 text-[#C9A86A]" /> CHAMBRE
              </label>
              <select 
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EFE8D8] rounded-sm px-3 py-3 text-xs text-[#16352F] font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A86A]"
              >
                <option value="ALL">Toutes les catégories</option>
                <option value="STANDARD">Chambre Standard</option>
                <option value="DELUXE">Chambre Deluxe</option>
                <option value="SUITE">Suite Premium</option>
                <option value="FAMILY">Suite Familiale</option>
              </select>
            </div>

            {/* Bouton : VÉRIFIER LA DISPONIBILITÉ → */}
            <div>
              <button 
                type="submit"
                className="w-full group inline-flex items-center justify-center gap-2 bg-[#C9A86A] hover:bg-[#DFC58E] text-[#022C25] font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-sm transition-all duration-300 shadow-md"
              >
                <span>VÉRIFIER LA DISPONIBILITÉ</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. SECTION "UNE EXPÉRIENCE PENSÉE POUR VOUS"        */}
      {/* ================================================== */}
      <section id="experience" className="py-24 bg-[#F7F4EC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="text-[11px] uppercase font-bold tracking-[0.25em] text-[#C9A86A] block mb-2">
            POUR VOTRE CONFORT
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#022C25] font-semibold mb-4">
            Une expérience pensée pour vous
          </h2>
          <div className="w-16 h-0.5 bg-[#C9A86A] mx-auto mb-16"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* 1. Chambres élégantes */}
            <div className="bg-white p-8 rounded-sm border border-[#EFE8D8] shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#C9A86A]/40 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#C9A86A] transition-colors duration-300">
                <BedDouble className="w-6 h-6 text-[#C9A86A] group-hover:text-[#022C25] transition-colors" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#022C25] mb-3">
                Chambres élégantes
              </h3>
              <p className="text-xs text-[#16352F]/75 font-light leading-relaxed">
                Des espaces raffinés et confortables pour un séjour inoubliable.
              </p>
            </div>

            {/* 2. Gastronomie d'exception */}
            <div className="bg-white p-8 rounded-sm border border-[#EFE8D8] shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#C9A86A]/40 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#C9A86A] transition-colors duration-300">
                <UtensilsCrossed className="w-6 h-6 text-[#C9A86A] group-hover:text-[#022C25] transition-colors" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#022C25] mb-3">
                Gastronomie d'exception
              </h3>
              <p className="text-xs text-[#16352F]/75 font-light leading-relaxed">
                Une cuisine locale et internationale préparée par nos chefs.
              </p>
            </div>

            {/* 3. Sécurité & Excellence */}
            <div className="bg-white p-8 rounded-sm border border-[#EFE8D8] shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#C9A86A]/40 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#C9A86A] transition-colors duration-300">
                <ShieldCheck className="w-6 h-6 text-[#C9A86A] group-hover:text-[#022C25] transition-colors" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#022C25] mb-3">
                Sécurité & Excellence
              </h3>
              <p className="text-xs text-[#16352F]/75 font-light leading-relaxed">
                Un service irréprochable, 24h/24, pour votre tranquillité.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. SECTION CHAMBRES & SUITES                       */}
      {/* ================================================== */}
      <section id="chambres" className="py-24 bg-white border-y border-[#EFE8D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-[11px] uppercase font-bold tracking-[0.25em] text-[#C9A86A] block mb-2">
              NOS CHAMBRES & SUITES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#022C25] font-semibold mb-4">
              Un confort sur mesure
            </h2>
            <div className="w-16 h-0.5 bg-[#C9A86A] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {featuredRooms.map((room) => (
              <div 
                key={room.id}
                className="group flex flex-col bg-[#FAF8F5] rounded-sm overflow-hidden border border-[#EFE8D8] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5"
              >
                {/* Grande Image */}
                <div className="relative h-64 sm:h-72 overflow-hidden">
                  <img 
                    src={room.image} 
                    alt={room.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Badge */}
                  <div className="absolute top-4 left-4 bg-[#022C25]/85 backdrop-blur-sm text-[#DFC58E] border border-[#C9A86A]/40 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-sm">
                    {room.categoryBadge}
                  </div>

                  {/* Prix */}
                  <div className="absolute bottom-4 right-4 bg-[#022C25]/90 backdrop-blur-sm text-white px-3.5 py-1.5 rounded-sm border border-[#C9A86A]/30">
                    <span className="text-[10px] text-white/70 uppercase tracking-wider block">À partir de</span>
                    <span className="font-serif text-sm sm:text-base font-bold text-[#DFC58E]">{room.price}</span>
                    <span className="text-[10px] text-white/60"> / nuit</span>
                  </div>
                </div>

                {/* Nom, Equipements, Bouton */}
                <div className="p-6 sm:p-7 flex-grow flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-[#022C25] mb-2 tracking-wide">
                      {room.name}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-xs text-[#16352F]/70 font-light pb-4 mb-4 border-b border-[#EFE8D8]">
                      <span>{room.capacity}</span>
                      <span>·</span>
                      <span>{room.size}</span>
                    </div>

                    {/* Équipements : Wi-Fi, Climatisation, Petit déjeuner, TV */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      {room.amenities.map((amenity, idx) => {
                        const Icon = amenity.icon;
                        return (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[#16352F]/80">
                            <Icon className="w-3.5 h-3.5 text-[#C9A86A]" />
                            <span>{amenity.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bouton : Voir les détails → */}
                  <div className="pt-2">
                    <button
                      onClick={() => navigate(`/rooms/${room.id}`)}
                      className="w-full group/btn inline-flex items-center justify-center gap-2 bg-transparent hover:bg-[#022C25] text-[#022C25] hover:text-[#DFC58E] border border-[#C9A86A] font-semibold text-xs uppercase tracking-widest py-3 px-4 rounded-sm transition-all duration-300"
                    >
                      <span>Voir les détails</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/rooms')}
              className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-[#073F34] hover:text-[#C9A86A] transition-colors py-2 border-b-2 border-[#C9A86A]"
            >
              <span>Découvrir toutes nos chambres & suites</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 5. SECTION SERVICES INCLUS & PRIVILÈGES            */}
      {/* ================================================== */}
      <section id="services" className="py-24 bg-[#F7F4EC] relative overflow-hidden">
        {/* Discrète décoration botanique d'arrière-plan */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-pattern opacity-30 pointer-events-none"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-[11px] uppercase font-bold tracking-[0.25em] text-[#C9A86A] block mb-2">
              SERVICES INCLUS & PRIVILÈGES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#022C25] font-semibold mb-4">
              L'excellence à chaque instant
            </h2>
            <div className="w-16 h-0.5 bg-[#C9A86A] mx-auto"></div>
          </div>

          {/* Grille élégante des 6 services */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {servicesList.map((service, index) => {
              const Icon = service.icon;
              return (
                <div 
                  key={index}
                  className="bg-white p-7 rounded-sm border border-[#EFE8D8] shadow-sm hover:shadow-lg transition-all duration-300 flex items-start gap-4"
                >
                  <div className="shrink-0 w-12 h-12 rounded-sm bg-[#FAF8F5] border border-[#C9A86A]/30 flex items-center justify-center text-[#C9A86A]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#022C25] mb-1.5">
                      {service.name}
                    </h3>
                    <p className="text-xs text-[#16352F]/70 font-light leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 6. SECTION RESTAURANT (Immersive Split Layout)      */}
      {/* ================================================== */}
      <section id="restaurant" className="py-24 bg-white border-y border-[#EFE8D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* IMAGE À GAUCHE */}
            <div className="relative">
              <div className="relative h-[380px] sm:h-[480px] rounded-sm overflow-hidden shadow-2xl border border-[#EFE8D8]">
                <img 
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80" 
                  alt="Restaurant Teranga Palace Hotel" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white max-w-sm">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#DFC58E] block mb-1">
                    GASTRONOMIE DAKAROISE & MONDIALE
                  </span>
                  <p className="font-serif text-xl font-semibold">Une invitation aux saveurs de l'Océan</p>
                </div>
              </div>
            </div>

            {/* CONTENU À DROITE */}
            <div className="space-y-6">
              <span className="text-[11px] uppercase font-bold tracking-[0.25em] text-[#C9A86A] block">
                RESTAURANT
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#022C25] font-semibold leading-tight">
                Découvrez notre restaurant
              </h2>
              <div className="w-16 h-0.5 bg-[#C9A86A]"></div>

              <p className="text-xs sm:text-sm text-[#16352F]/80 leading-relaxed font-light">
                Une cuisine inspirée des saveurs du Sénégal et d'une gastronomie internationale raffinée, dans un cadre élégant et convivial.
              </p>

              {/* Formules */}
              <div className="space-y-4 pt-2">
                
                <div className="flex justify-between items-center pb-3 border-b border-[#EFE8D8]">
                  <h4 className="font-serif text-sm font-semibold text-[#022C25]">
                    Petit-déjeuner buffet
                  </h4>
                  <span className="text-xs font-bold text-[#C9A86A] shrink-0">
                    À partir de 12 000 FCFA
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-[#EFE8D8]">
                  <h4 className="font-serif text-sm font-semibold text-[#022C25]">
                    Déjeuner Teranga
                  </h4>
                  <span className="text-xs font-bold text-[#C9A86A] shrink-0">
                    À partir de 18 000 FCFA
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-[#EFE8D8]">
                  <h4 className="font-serif text-sm font-semibold text-[#022C25]">
                    Dîner gastronomique
                  </h4>
                  <span className="text-xs font-bold text-[#C9A86A] shrink-0">
                    À partir de 25 000 FCFA
                  </span>
                </div>

              </div>

              {/* Bouton : Découvrir le restaurant → */}
              <div className="pt-4">
                <button
                  onClick={() => setRestaurantModalOpen(true)}
                  className="group inline-flex items-center gap-3 bg-[#022C25] hover:bg-[#073F34] text-[#DFC58E] hover:text-white font-bold text-xs uppercase tracking-widest px-7 py-3.5 rounded-sm shadow-md transition-all duration-300"
                >
                  <span>Découvrir le restaurant</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 7. SECTION TÉMOIGNAGES                             */}
      {/* ================================================== */}
      <section id="temoignages" className="py-24 bg-[#F7F4EC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#022C25] font-semibold mb-4">
              Ce que pensent nos clients
            </h2>
            <div className="w-16 h-0.5 bg-[#C9A86A] mx-auto mb-6"></div>

            {/* Note globale 4.9/5 · 128 avis */}
            <div className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-[#C9A86A]/30 shadow-sm">
              <span className="font-serif text-lg font-bold text-[#022C25]">4.9 / 5</span>
              <div className="flex text-[#C9A86A]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C9A86A]" />
                ))}
              </div>
              <span className="text-xs text-[#16352F]/70 font-light border-l border-gray-200 pl-3">
                128 avis
              </span>
            </div>
          </div>

          {/* 3 Cartes de témoignages desktop */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {testimonials.map((rev) => (
              <div 
                key={rev.id}
                className="bg-white p-8 rounded-sm border border-[#EFE8D8] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-[#C9A86A] mb-4">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C9A86A]" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#16352F]/80 italic font-light leading-relaxed mb-6">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#EFE8D8]">
                  <img 
                    src={rev.avatar} 
                    alt={rev.name} 
                    className="w-10 h-10 rounded-full object-cover border border-[#C9A86A]/40"
                  />
                  <h4 className="font-serif text-sm font-bold text-[#022C25]">{rev.name}</h4>
                </div>
              </div>
            ))}
          </div>

          {/* Carrousel mobile tactile */}
          <div className="md:hidden space-y-4">
            <div className="bg-white p-7 rounded-sm border border-[#EFE8D8] shadow-md">
              <div className="flex text-[#C9A86A] mb-4">
                {[...Array(testimonials[activeReviewIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C9A86A]" />
                ))}
              </div>
              <p className="text-xs text-[#16352F]/80 italic font-light leading-relaxed mb-6">
                "{testimonials[activeReviewIndex].comment}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#EFE8D8]">
                <img 
                  src={testimonials[activeReviewIndex].avatar} 
                  alt={testimonials[activeReviewIndex].name} 
                  className="w-10 h-10 rounded-full object-cover border border-[#C9A86A]/40"
                />
                <h4 className="font-serif text-sm font-bold text-[#022C25]">
                  {testimonials[activeReviewIndex].name}
                </h4>
              </div>
            </div>

            {/* Indicateurs de carrousel */}
            <div className="flex justify-center gap-2 pt-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveReviewIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    activeReviewIndex === idx ? 'bg-[#022C25] w-6' : 'bg-[#C9A86A]/40'
                  }`}
                  aria-label={`Afficher avis ${idx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 8. SECTION LOCALISATION                            */}
      {/* ================================================== */}
      <section id="localisation" className="py-24 bg-white border-y border-[#EFE8D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Texte et Badges */}
            <div className="space-y-6">
              <h2 className="font-serif text-3xl sm:text-4xl text-[#022C25] font-semibold leading-tight">
                Un emplacement idéal à Dakar
              </h2>
              <div className="w-16 h-0.5 bg-[#C9A86A]"></div>

              <p className="text-xs sm:text-sm text-[#16352F]/80 leading-relaxed font-light">
                Situé dans le quartier prestigieux des Almadies à Dakar, l'hôtel bénéficie d'une situation géographique privilégiée, au calme face à l'océan Atlantique tout en restant proche des centres névralgiques de la capitale.
              </p>

              {/* 4 Badges : Dakar, Sénégal · 25 min de l'aéroport · 10 min du centre-ville · Taxi disponible 24h/24 */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-[#FAF8F5] p-4 rounded-sm border border-[#EFE8D8]">
                  <div className="flex items-center gap-2 text-[#C9A86A] mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-wider font-bold">LOCALISATION</span>
                  </div>
                  <span className="font-serif text-base font-bold text-[#022C25]">Dakar, Sénégal</span>
                </div>

                <div className="bg-[#FAF8F5] p-4 rounded-sm border border-[#EFE8D8]">
                  <div className="flex items-center gap-2 text-[#C9A86A] mb-1">
                    <Plane className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-wider font-bold">AÉROPORT DSS</span>
                  </div>
                  <span className="font-serif text-base font-bold text-[#022C25]">25 min de l'aéroport</span>
                </div>

                <div className="bg-[#FAF8F5] p-4 rounded-sm border border-[#EFE8D8]">
                  <div className="flex items-center gap-2 text-[#C9A86A] mb-1">
                    <Compass className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-wider font-bold">PLATEAU / AFFAIRES</span>
                  </div>
                  <span className="font-serif text-base font-bold text-[#022C25]">10 min du centre-ville</span>
                </div>

                <div className="bg-[#FAF8F5] p-4 rounded-sm border border-[#EFE8D8]">
                  <div className="flex items-center gap-2 text-[#C9A86A] mb-1">
                    <Car className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-wider font-bold">TRANSPORT</span>
                  </div>
                  <span className="font-serif text-base font-bold text-[#022C25]">Taxi disponible 24h/24</span>
                </div>
              </div>

              {/* Bouton : Voir sur Google Maps → */}
              <div className="pt-2">
                <a
                  href="https://maps.google.com/?q=Les+Almadies+Dakar+Senegal"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2.5 text-xs uppercase font-bold tracking-widest text-[#022C25] hover:text-[#C9A86A] transition-colors"
                >
                  <span>Voir sur Google Maps</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>

            </div>

            {/* Composant de carte à droite */}
            <div className="bg-[#022C25] text-white rounded-sm p-8 border border-[#C9A86A]/30 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-luxury-pattern opacity-25 pointer-events-none"></div>

              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 rounded-full bg-[#073F34] border border-[#C9A86A]/50 flex items-center justify-center text-[#DFC58E]">
                  <MapPin className="w-6 h-6 animate-pulse" />
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#DFC58E] font-semibold block mb-1">
                    COORDONNÉES GPS
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-white">
                    14.7471° N, 17.5147° W
                  </h3>
                  <p className="text-xs text-white/70 font-light mt-1">
                    Route des Almadies, presqu'île du Cap-Vert, Dakar.
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-3 text-xs text-white/80 font-light">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A86A]" />
                    <span>Plages privées des Almadies à 300 mètres</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A86A]" />
                    <span>Quartier résidentiel calme et hautement sécurisé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A86A]" />
                    <span>Service voiturier et navette aéroport disponibles</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="https://maps.google.com/?q=Les+Almadies+Dakar+Senegal"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center w-full py-3 bg-[#C9A86A] hover:bg-[#DFC58E] text-[#022C25] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors"
                  >
                    Itinéraire Google Maps
                  </a>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 9. SECTION GALERIE PHOTO                           */}
      {/* ================================================== */}
      <section id="galerie" className="py-24 bg-[#F7F4EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-[11px] uppercase font-bold tracking-[0.25em] text-[#C9A86A] block mb-2">
              GALERIE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#022C25] font-semibold mb-4">
              L'art de vivre en images
            </h2>
            <div className="w-16 h-0.5 bg-[#C9A86A] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryPhotos.map((photo, index) => (
              <div 
                key={index}
                onClick={() => setSelectedImage(photo.url)}
                className="group relative h-72 rounded-sm overflow-hidden cursor-pointer border border-[#EFE8D8] shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <img 
                  src={photo.url} 
                  alt={photo.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-[#022C25]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                  <h4 className="font-serif text-sm font-semibold">{photo.title}</h4>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 10. SECTION CTA FINAL (Grande Section Vert Profond) */}
      {/* ================================================== */}
      <section className="py-28 bg-[#022C25] text-white text-center relative overflow-hidden">
        {/* Arrière-plan botanique très discret */}
        <div className="absolute inset-0 bg-luxury-pattern opacity-25 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-white tracking-tight leading-tight">
            Prêt à vivre l'expérience Teranga ?
          </h2>

          <p className="text-sm sm:text-base text-[#F7F4EC]/90 font-light leading-relaxed max-w-xl mx-auto">
            Réservez votre séjour et découvrez une nouvelle définition de l'hospitalité sénégalaise.
          </p>

          <div className="pt-6">
            <button 
              onClick={() => navigate('/rooms')}
              className="group inline-flex items-center gap-3 bg-[#C9A86A] hover:bg-[#DFC58E] text-[#022C25] font-bold text-xs uppercase tracking-widest px-10 py-4 rounded-sm shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span>RÉSERVER MAINTENANT</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* MODAL: Lightbox Photo                              */}
      {/* ================================================== */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white hover:text-[#C9A86A] p-2"
            aria-label="Fermer"
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={selectedImage} 
            alt="Aperçu Teranga Palace" 
            className="max-w-full max-h-[85vh] object-contain rounded-sm shadow-2xl border border-white/20"
          />
        </div>
      )}

      {/* ================================================== */}
      {/* MODAL: Menu Restaurant                             */}
      {/* ================================================== */}
      {restaurantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-sm p-8 relative shadow-2xl border border-[#C9A86A]/40 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setRestaurantModalOpen(false)}
              className="absolute top-4 right-4 text-[#022C25] hover:text-[#C9A86A] p-1"
              aria-label="Fermer la carte"
            >
              <X className="w-6 h-6" />
            </button>

            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A86A] block mb-1">
              CARTE DU RESTAURANT
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#022C25] mb-4">
              Le Teranga Bistro
            </h3>
            <p className="text-xs text-[#16352F]/70 font-light mb-6">
              Nos tables sont ouvertes aux résidents de l'hôtel ainsi qu'aux convives extérieurs sur réservation.
            </p>

            <div className="space-y-4 text-xs">
              <div className="border-b border-[#EFE8D8] pb-3">
                <div className="flex justify-between font-bold text-[#022C25]">
                  <span>Thiéboudienne Penda Mbaye</span>
                  <span className="text-[#C9A86A]">14 500 FCFA</span>
                </div>
                <p className="text-[#16352F]/60 font-light mt-0.5">Riz rouge sénégalais, mérou blanc, légumes du jardin et bissap salé</p>
              </div>

              <div className="border-b border-[#EFE8D8] pb-3">
                <div className="flex justify-between font-bold text-[#022C25]">
                  <span>Filet de Lotte braisé au citron vert</span>
                  <span className="text-[#C9A86A]">16 000 FCFA</span>
                </div>
                <p className="text-[#16352F]/60 font-light mt-0.5">Émulsion d'attiéké et confit d'oignons doux</p>
              </div>

              <div className="border-b border-[#EFE8D8] pb-3">
                <div className="flex justify-between font-bold text-[#022C25]">
                  <span>Yassa de Poulet Fermier</span>
                  <span className="text-[#C9A86A]">12 000 FCFA</span>
                </div>
                <p className="text-[#16352F]/60 font-light mt-0.5">Marinade d'oignons caramélisés et moutarde de Dijon</p>
              </div>

              <div className="border-b border-[#EFE8D8] pb-3">
                <div className="flex justify-between font-bold text-[#022C25]">
                  <span>Pastilles de Thiakry au coulis de mangue</span>
                  <span className="text-[#C9A86A]">6 500 FCFA</span>
                </div>
                <p className="text-[#16352F]/60 font-light mt-0.5">Couscous de mil sucré, yaourt doux et vanille de Madagascar</p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <a 
                href="tel:+221338990000"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#022C25] hover:bg-[#073F34] text-[#DFC58E] font-bold text-xs uppercase py-3 rounded-sm transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Réserver une table (+221 33 899 00 00)</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
