import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Users, Square, Check, ArrowLeft, Ticket, AlertCircle } from 'lucide-react';
import { mockDb, mockServices } from '../../services/mockDb';
import { useBooking } from '../../contexts/BookingContext';
import { Room } from '../../types/types';

export const RoomDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    checkIn, 
    checkOut, 
    adults, 
    children, 
    setBookingDates, 
    setSelectedRoom, 
    setStep,
    promotion,
    promotionError,
    applyPromoCode,
    removePromoCode,
    calculateNights,
    calculateBasePrice,
    calculateDiscount,
    calculateTotalPrice
  } = useBooking();

  const [room, setRoom] = useState<Room | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  
  // Date selector local states (to sync with context)
  const [localCheckIn, setLocalCheckIn] = useState(checkIn);
  const [localCheckOut, setLocalCheckOut] = useState(checkOut);
  const [localAdults, setLocalAdults] = useState(adults);
  const [localChildren, setLocalChildren] = useState(children);

  const [promoCode, setPromoCode] = useState('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      const rooms = mockDb.getRooms();
      const foundRoom = rooms.find(r => r.id === id);
      if (foundRoom) {
        setRoom(foundRoom);
        setActiveImage(foundRoom.images[0]);
        setSelectedRoom(foundRoom);
      }
    }
  }, [id, setSelectedRoom]);

  // Sync date changes to local state
  useEffect(() => {
    // Check if dates are valid
    if (localCheckIn && localCheckOut) {
      const start = new Date(localCheckIn);
      const end = new Date(localCheckOut);
      if (end <= start) {
        setDateError('La date de départ doit être après la date d\'arrivée.');
        setIsAvailable(false);
      } else {
        setDateError(null);
        setBookingDates(localCheckIn, localCheckOut, localAdults, localChildren);
        
        // Check availability
        if (room) {
          const avail = mockServices.checkAvailability(room.id, localCheckIn, localCheckOut);
          setIsAvailable(avail);
        }
      }
    }
  }, [localCheckIn, localCheckOut, localAdults, localChildren, room]);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    const ok = await applyPromoCode(promoCode.trim());
    if (ok) {
      setPromoSuccessMsg('Code promo appliqué avec succès !');
    } else {
      setPromoSuccessMsg(null);
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setPromoCode('');
    setPromoSuccessMsg(null);
  };

  const handleBookNow = () => {
    if (!isAvailable || dateError || !room) return;
    
    // We already selected room (Step 1) and dates (Step 2) in this detail page
    // So we proceed to step 3 (Client details) in the booking wizard
    setStep(3);
    navigate('/booking');
  };

  if (!room) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-teranga-green-800">Chambre introuvable</h2>
        <p className="text-sm text-teranga-gray-500 font-light">
          La chambre que vous recherchez n'existe pas ou a été retirée du catalogue.
        </p>
        <Link to="/rooms" className="inline-block btn-gold text-xs">
          Retour aux chambres
        </Link>
      </div>
    );
  }

  const nights = calculateNights();
  const basePrice = calculateBasePrice();
  const discount = calculateDiscount();
  const total = calculateTotalPrice();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Back button */}
      <Link to="/rooms" className="inline-flex items-center gap-2 text-xs font-semibold text-teranga-gold-600 hover:text-teranga-gold-700 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Retour à la liste des chambres</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Gallery, details and amenities */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Gallery Widget */}
          <div className="space-y-3">
            <div className="h-96 md:h-[480px] bg-teranga-beige-100 rounded-lg overflow-hidden border border-teranga-gray-200 shadow-sm relative">
              <img src={activeImage} alt={room.name} className="w-full h-full object-cover" />
              {!isAvailable && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-serif font-semibold">
                  Chambre réservée ou indisponible pour ces dates
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {room.images.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-24 h-16 rounded border overflow-hidden shrink-0 transition-all ${
                    activeImage === img ? 'border-teranga-gold-450 ring-2 ring-teranga-gold-300' : 'border-teranga-gray-200'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Room Description details */}
          <div className="bg-white border border-teranga-gray-200 rounded-lg p-6 md:p-8 shadow-sm space-y-6">
            <div className="border-b border-teranga-gray-100 pb-4">
              <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-teranga-green-800 mb-2">{room.name}</h1>
              <p className="text-xs text-teranga-gold-650 font-bold tracking-wider uppercase font-sans">
                Chambre n°{room.roomNumber} &bull; {room.size} m²
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-lg font-bold text-teranga-green-800">Description</h2>
              <p className="text-sm text-teranga-gray-650 font-light leading-relaxed">
                {room.description}
              </p>
            </div>

            {/* Room Features Metrics */}
            <div className="grid grid-cols-3 gap-4 border-y border-teranga-gray-150 py-4 font-light text-xs">
              <div className="flex flex-col items-center text-center gap-1">
                <Users className="w-5 h-5 text-teranga-gold-650" />
                <span className="text-[10px] text-teranga-gray-400 uppercase font-semibold">Capacité</span>
                <span className="font-bold text-teranga-green-800">{room.capacity} Voyageurs</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 border-x border-teranga-gray-150">
                <Square className="w-5 h-5 text-teranga-gold-650" />
                <span className="text-[10px] text-teranga-gray-400 uppercase font-semibold">Superficie</span>
                <span className="font-bold text-teranga-green-800">{room.size} m²</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <Calendar className="w-5 h-5 text-teranga-gold-650" />
                <span className="text-[10px] text-teranga-gray-400 uppercase font-semibold">Statut</span>
                <span className={`font-bold capitalize ${room.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-500'}`}>
                  {room.status === 'AVAILABLE' ? 'Libre' : room.status === 'OCCUPIED' ? 'Occupée' : room.status === 'CLEANING' ? 'En ménage' : 'Maintenance'}
                </span>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-4">
              <h2 className="font-serif text-lg font-bold text-teranga-green-800">Équipements inclus</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {room.amenities.map((am, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-teranga-gray-650 font-light">
                    <div className="w-4 h-4 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-200">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span>{am}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Dynamic Price calculation & Reservation Form Widget */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-teranga-gray-200 rounded-lg p-6 shadow-md sticky top-24 space-y-6">
            <div className="border-b border-teranga-gray-100 pb-4 text-center">
              <span className="text-xs text-teranga-gray-400">Tarif par nuit</span>
              <p className="font-serif text-2xl font-black text-teranga-green-800 mt-1">
                {room.pricePerNight.toLocaleString()} FCFA
              </p>
            </div>

            {/* Check availability inputs */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-teranga-gray-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teranga-gold-650" /> Date d'arrivée
                </label>
                <input 
                  type="date" 
                  value={localCheckIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setLocalCheckIn(e.target.value)}
                  className="border border-teranga-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teranga-gold-450 bg-teranga-beige-50"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-teranga-gray-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teranga-gold-650" /> Date de départ
                </label>
                <input 
                  type="date" 
                  value={localCheckOut}
                  min={localCheckIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setLocalCheckOut(e.target.value)}
                  className="border border-teranga-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teranga-gold-450 bg-teranga-beige-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-teranga-gray-500">Adultes</label>
                  <select 
                    value={localAdults}
                    onChange={(e) => setLocalAdults(Number(e.target.value))}
                    className="border border-teranga-gray-200 rounded-md px-2.5 py-2 text-xs bg-teranga-beige-50 focus:outline-none focus:ring-1 focus:ring-teranga-gold-450"
                  >
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-teranga-gray-500">Enfants</label>
                  <select 
                    value={localChildren}
                    onChange={(e) => setLocalChildren(Number(e.target.value))}
                    className="border border-teranga-gray-200 rounded-md px-2.5 py-2 text-xs bg-teranga-beige-50 focus:outline-none focus:ring-1 focus:ring-teranga-gold-450"
                  >
                    {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              {dateError && (
                <div className="flex items-start gap-2 bg-red-50 text-red-600 p-3 rounded-md text-xs font-light">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{dateError}</span>
                </div>
              )}
            </div>

            {/* Promotion form */}
            <div className="border-t border-teranga-gray-150 pt-4">
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-teranga-gray-500 flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-teranga-gold-650" /> Code Promo
                </label>
                {promotion ? (
                  <div className="flex justify-between items-center bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-xs">
                    <span>{promotion.code} appliqué ({promotion.discountType === 'PERCENTAGE' ? `-${promotion.discountValue}%` : `-${promotion.discountValue} F`})</span>
                    <button 
                      type="button" 
                      onClick={handleRemovePromo}
                      className="text-xs text-red-500 font-semibold hover:text-red-700"
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ex: TERANGA10"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-grow border border-teranga-gray-200 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teranga-gold-450"
                    />
                    <button 
                      type="submit"
                      className="bg-teranga-gold-450 hover:bg-teranga-gold-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-md transition-colors"
                    >
                      Appliquer
                    </button>
                  </div>
                )}
                {promotionError && (
                  <p className="text-[10px] text-red-500 font-light">{promotionError}</p>
                )}
                {promoSuccessMsg && (
                  <p className="text-[10px] text-green-600 font-semibold">{promoSuccessMsg}</p>
                )}
              </form>
            </div>

            {/* Price Calculations */}
            <div className="border-t border-teranga-gray-150 pt-4 space-y-2 text-xs font-light text-teranga-gray-650">
              <div className="flex justify-between">
                <span>{room.pricePerNight.toLocaleString()} F &times; {nights} nuit(s)</span>
                <span className="font-semibold font-sans">{basePrice.toLocaleString()} FCFA</span>
              </div>
              
              {promotion && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction</span>
                  <span className="font-semibold font-sans">-{discount.toLocaleString()} FCFA</span>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-teranga-gray-100 pt-3 text-sm">
                <span className="font-semibold text-teranga-green-800">Prix total</span>
                <span className="font-sans font-black text-lg text-teranga-green-850">
                  {total.toLocaleString()} FCFA
                </span>
              </div>
            </div>

            {/* Action button */}
            <button 
              onClick={handleBookNow}
              disabled={!isAvailable || !!dateError}
              className={`w-full text-center font-semibold text-xs tracking-wider uppercase py-3.5 rounded-md shadow-md transition-all ${
                isAvailable && !dateError
                  ? 'bg-teranga-gold-450 hover:bg-teranga-gold-500 text-white hover:shadow-lg'
                  : 'bg-teranga-gray-250 text-teranga-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              {!isAvailable ? 'Non disponible à ces dates' : 'Réserver maintenant'}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};
