import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, Calendar, Users, DoorOpen, ArrowRight, Eye, Grid } from 'lucide-react';
import { mockDb, mockServices } from '../../services/mockDb';
import { Room, RoomTypeCategory } from '../../types/types';
import { useBooking } from '../../contexts/BookingContext';

export const Rooms: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setBookingDates, checkIn: globalCheckIn, checkOut: globalCheckOut, adults: globalAdults, children: globalChildren } = useBooking();

  // Load rooms from mockDb
  const allRooms = mockDb.getRooms();

  // Search/Filter State initialised from URL parameters if available
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || globalCheckIn);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || globalCheckOut);
  const [adults, setAdults] = useState(Number(searchParams.get('adults')) || globalAdults);
  const [children, setChildren] = useState(Number(searchParams.get('children')) || globalChildren);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('type') || 'ALL');
  
  // Custom filter states
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [minSize, setMinSize] = useState<number>(20);
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState<boolean>(true);

  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);

  // Unique amenities flat list
  const allAmenities = Array.from(
    new Set(allRooms.flatMap(r => r.amenities))
  );

  // Sync dates with context
  useEffect(() => {
    setBookingDates(checkIn, checkOut, adults, children);
  }, [checkIn, checkOut, adults, children]);

  // Execute filtering logic
  useEffect(() => {
    let result = [...allRooms];

    // 1. Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter(r => r.roomType === selectedCategory);
    }

    // 2. Price filter
    result = result.filter(r => r.pricePerNight <= maxPrice);

    // 3. Size filter
    result = result.filter(r => r.size >= minSize);

    // 4. Capacity filter (adults + children)
    const requiredCapacity = adults + children;
    result = result.filter(r => r.capacity >= requiredCapacity);

    // 5. Amenities filter
    if (filterAmenities.length > 0) {
      result = result.filter(r => 
        filterAmenities.every(amenity => r.amenities.includes(amenity))
      );
    }

    // 6. Availability filter (simulates backend booking overlap check)
    if (showOnlyAvailable && checkIn && checkOut) {
      result = result.filter(r => 
        mockServices.checkAvailability(r.id, checkIn, checkOut) && r.status === 'AVAILABLE'
      );
    }

    setFilteredRooms(result);
  }, [selectedCategory, maxPrice, minSize, adults, children, filterAmenities, showOnlyAvailable, checkIn, checkOut]);

  const handleAmenityChange = (amenity: string) => {
    if (filterAmenities.includes(amenity)) {
      setFilterAmenities(filterAmenities.filter(a => a !== amenity));
    } else {
      setFilterAmenities([...filterAmenities, amenity]);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'STANDARD': return 'Standard';
      case 'DELUXE': return 'Deluxe';
      case 'SUITE': return 'Suite Premium';
      case 'FAMILY': return 'Suite Familiale';
      default: return cat;
    }
  };

  const handleSelectRoom = (room: Room) => {
    navigate(`/rooms/${room.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Title */}
      <div className="text-center mb-12">
        <span className="text-xs uppercase font-bold tracking-widest text-teranga-gold-650 block mb-2">Réservation</span>
        <h1 className="text-3xl md:text-5xl font-serif text-teranga-green-800 font-extrabold">Nos Chambres & Suites disponibles</h1>
        <div className="w-16 h-0.5 bg-teranga-gold-450 mx-auto mt-4"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Panel (Sidebar) */}
        <div className="lg:col-span-1 bg-white border border-teranga-gray-200 rounded-lg p-6 shadow-sm self-start">
          <div className="flex items-center gap-2 border-b border-teranga-gray-150 pb-4 mb-6">
            <Filter className="w-5 h-5 text-teranga-gold-650" />
            <h2 className="font-serif text-lg font-bold text-teranga-green-800">Filtres de recherche</h2>
          </div>

          <div className="space-y-6">
            
            {/* Availability Date Inputs */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-bold tracking-wider text-teranga-gray-650">Dates du séjour</h3>
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-semibold text-teranga-gray-400">Arrivée</label>
                  <input 
                    type="date" 
                    value={checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-teranga-gold-450 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-semibold text-teranga-gray-400">Départ</label>
                  <input 
                    type="date" 
                    value={checkOut}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-teranga-gold-450 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="availOnly"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  className="rounded text-teranga-gold-450 focus:ring-teranga-gold-450 border-teranga-gray-200 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="availOnly" className="text-xs text-teranga-gray-650 cursor-pointer select-none">
                  Chambres disponibles uniquement
                </label>
              </div>
            </div>

            {/* Capacity Filters */}
            <div className="space-y-3 pt-4 border-t border-teranga-gray-100">
              <h3 className="text-xs uppercase font-bold tracking-wider text-teranga-gray-650">Nombre de personnes</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-semibold text-teranga-gray-400">Adultes</label>
                  <select 
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teranga-gold-450"
                  >
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-semibold text-teranga-gray-400">Enfants</label>
                  <select 
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teranga-gold-450"
                  >
                    {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Room category select list */}
            <div className="space-y-3 pt-4 border-t border-teranga-gray-100">
              <h3 className="text-xs uppercase font-bold tracking-wider text-teranga-gray-650">Catégorie de chambre</h3>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-teranga-gray-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
              >
                <option value="ALL">Toutes les chambres</option>
                <option value="STANDARD">Standard</option>
                <option value="DELUXE">Deluxe</option>
                <option value="SUITE">Suite Premium</option>
                <option value="FAMILY">Suite Familiale</option>
              </select>
            </div>

            {/* Max Budget per night slider */}
            <div className="space-y-3 pt-4 border-t border-teranga-gray-100">
              <div className="flex justify-between text-xs uppercase font-bold tracking-wider text-teranga-gray-650">
                <span>Budget Max / nuit</span>
                <span className="text-teranga-gold-650 font-bold font-sans text-xs">{maxPrice.toLocaleString()} F</span>
              </div>
              <input 
                type="range" 
                min={50000} 
                max={200000} 
                step={5000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-teranga-gold-450 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-teranga-gray-400">
                <span>50 000 F</span>
                <span>200 000 F</span>
              </div>
            </div>

            {/* Amenities filters checkboxes */}
            <div className="space-y-3 pt-4 border-t border-teranga-gray-100">
              <h3 className="text-xs uppercase font-bold tracking-wider text-teranga-gray-650">Équipements</h3>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {allAmenities.map((amenity, idx) => (
                  <label key={idx} className="flex items-center gap-2.5 text-xs text-teranga-gray-650 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={filterAmenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="rounded text-teranga-gold-450 focus:ring-teranga-gold-450 border-teranga-gray-200 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Room cards Grid (Right hand content) */}
        <div className="lg:col-span-3">
          
          {/* Top meta-bar */}
          <div className="bg-white border border-teranga-gray-200 rounded-lg px-5 py-4 mb-6 flex justify-between items-center text-xs shadow-sm">
            <span className="text-teranga-gray-500">
              Nous avons trouvé <strong className="text-teranga-green-800 font-bold">{filteredRooms.length}</strong> chambre(s) correspondant à vos critères.
            </span>
            <div className="flex items-center gap-1.5 text-teranga-gray-400">
              <Grid className="w-4 h-4 text-teranga-gold-650" />
              <span>Grille</span>
            </div>
          </div>

          {/* Empty state */}
          {filteredRooms.length === 0 && (
            <div className="bg-white border border-teranga-gray-200 rounded-lg p-16 text-center shadow-sm space-y-4">
              <DoorOpen className="w-16 h-16 text-teranga-gold-300 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-teranga-green-800">Aucune chambre disponible</h3>
              <p className="max-w-md mx-auto text-sm text-teranga-gray-500 font-light leading-relaxed">
                Toutes nos chambres sont réservées pour ces dates ou aucun hébergement ne correspond à vos filtres. Essayez de modifier vos dates ou d'ajuster les filtres.
              </p>
              <button 
                onClick={() => {
                  setSelectedCategory('ALL');
                  setMaxPrice(200000);
                  setMinSize(20);
                  setFilterAmenities([]);
                  setShowOnlyAvailable(false);
                }}
                className="btn-outline-gold text-xs mt-2"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          {/* Room list layout grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRooms.map((room) => (
              <div 
                key={room.id}
                className="bg-white border border-teranga-gray-200 rounded-lg overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* Photo & Badge */}
                <div className="relative h-56 bg-teranga-beige-100 overflow-hidden shrink-0">
                  <img 
                    src={room.images[0]} 
                    alt={room.name} 
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-teranga-green-850/90 text-white font-sans text-xs font-bold px-3 py-1.5 rounded">
                    {room.pricePerNight.toLocaleString()} FCFA / nuit
                  </div>
                  <span className="absolute bottom-4 left-4 bg-white/95 text-teranga-gold-650 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded shadow">
                    {getCategoryLabel(room.roomType)}
                  </span>
                </div>

                {/* Details */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h2 className="font-serif text-lg font-bold text-teranga-green-800 leading-snug group-hover:text-teranga-gold-650 transition-colors">
                        {room.name}
                      </h2>
                    </div>

                    <p className="text-xs text-teranga-gray-500 font-light line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>

                    <div className="flex gap-4 text-[11px] text-teranga-gray-400 font-light border-y border-teranga-gray-100 py-2">
                      <span>Capacité : <strong>{room.capacity} voyageurs</strong></span>
                      <span>Superficie : <strong>{room.size} m²</strong></span>
                      <span>N° : <strong>{room.roomNumber}</strong></span>
                    </div>

                    {/* Amenities list */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {room.amenities.slice(0, 4).map((am, i) => (
                        <span key={i} className="bg-teranga-beige-100 text-[10px] text-teranga-gray-600 px-2 py-0.5 rounded">
                          {am}
                        </span>
                      ))}
                      {room.amenities.length > 4 && (
                        <span className="text-[10px] text-teranga-gold-600 font-bold self-center">+{room.amenities.length - 4} de plus</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-4 border-t border-teranga-gray-100">
                    <button 
                      onClick={() => handleSelectRoom(room)}
                      className="flex-grow btn-green text-center py-2.5 text-xs shadow-none flex justify-center items-center gap-1.5"
                    >
                      <span>Voir les détails</span> <Eye className="w-3.5 h-3.5 text-teranga-gold-450" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
