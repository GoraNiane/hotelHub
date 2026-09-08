import React, { useEffect, useState } from 'react';
import { mockDb, mockServices } from '../../services/mockDb';
import { Reservation, Room, User, PaymentMethod, PaymentStatus, ReservationStatus } from '../../types/types';
import { Search, Plus, Calendar, User as UserIcon, Check, X, ShieldAlert, CreditCard } from 'lucide-react';

export const ReceptionistReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Search/Filters states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Direct Booking Modal States
  const [showDirectBookingModal, setShowDirectBookingModal] = useState(false);
  const [dbCheckIn, setDbCheckIn] = useState('');
  const [dbCheckOut, setDbCheckOut] = useState('');
  const [dbRoomId, setDbRoomId] = useState('');
  const [dbFirstName, setDbFirstName] = useState('');
  const [dbLastName, setDbLastName] = useState('');
  const [dbEmail, setDbEmail] = useState('');
  const [dbPhone, setDbPhone] = useState('');
  const [dbAdults, setDbAdults] = useState(1);
  const [dbChildren, setDbChildren] = useState(0);
  const [dbPayMethod, setDbPayMethod] = useState<PaymentMethod>('CASH');
  
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const fetchData = () => {
    setReservations(mockDb.getReservations());
    setRooms(mockDb.getRooms());
    setUsers(mockDb.getUsers());
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update available rooms when direct booking dates change
  useEffect(() => {
    if (dbCheckIn && dbCheckOut) {
      const start = new Date(dbCheckIn);
      const end = new Date(dbCheckOut);
      if (start < end) {
        const avail = rooms.filter(r => 
          mockServices.checkAvailability(r.id, dbCheckIn, dbCheckOut) && r.status === 'AVAILABLE'
        );
        setAvailableRooms(avail);
      } else {
        setAvailableRooms([]);
      }
    }
  }, [dbCheckIn, dbCheckOut, rooms]);

  const handleAction = (resId: string, action: 'CONFIRM' | 'CANCEL' | 'CHECK_IN' | 'CHECK_OUT') => {
    const allRes = mockDb.getReservations();
    const allRooms = mockDb.getRooms();
    let status: ReservationStatus = 'CONFIRMED';
    let roomStatusUpdate: any = null;
    let targetRoomId = '';

    const res = allRes.find(r => r.id === resId);
    if (!res) return;
    targetRoomId = res.roomId;

    if (action === 'CONFIRM') {
      status = 'CONFIRMED';
    } else if (action === 'CANCEL') {
      status = 'CANCELLED';
      roomStatusUpdate = 'AVAILABLE'; // Free the room
    } else if (action === 'CHECK_IN') {
      status = 'CHECKED_IN';
      roomStatusUpdate = 'OCCUPIED';
    } else if (action === 'CHECK_OUT') {
      status = 'CHECKED_OUT';
      roomStatusUpdate = 'CLEANING'; // Set to cleaning post checkout
    }

    // Update reservation
    const updatedRes = allRes.map(r => {
      if (r.id === resId) {
        return { ...r, status, updatedAt: new Date().toISOString().split('T')[0] };
      }
      return r;
    });
    mockDb.setReservations(updatedRes);

    // Update room if needed
    if (roomStatusUpdate && targetRoomId) {
      const updatedRooms = allRooms.map(r => {
        if (r.id === targetRoomId) {
          return { ...r, status: roomStatusUpdate };
        }
        return r;
      });
      mockDb.setRooms(updatedRooms);
    }

    // If check-out, update payment to PAID if it was cash/pending
    if (action === 'CHECK_OUT') {
      const payments = mockDb.getPayments();
      const updatedPayments = payments.map(p => {
        if (p.reservationId === resId) {
          return { ...p, status: 'PAID' as PaymentStatus, paidAt: new Date().toISOString() };
        }
        return p;
      });
      mockDb.setPayments(updatedPayments);
    }

    fetchData();
  };

  // Submit walk-in reservation
  const handleDirectBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!dbRoomId) {
      setBookingError('Veuillez sélectionner une chambre.');
      return;
    }

    const selectedRoom = rooms.find(r => r.id === dbRoomId)!;
    
    // Calculate nights
    const start = new Date(dbCheckIn);
    const end = new Date(dbCheckOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const total = selectedRoom.pricePerNight * nights;

    // Create client profile
    const usersList = mockDb.getUsers();
    const existing = usersList.find(u => u.email.toLowerCase() === dbEmail.toLowerCase());
    let clientId = existing ? existing.id : `user-client-${Date.now()}`;

    if (!existing) {
      const newClient: User = {
        id: clientId,
        firstName: dbFirstName,
        lastName: dbLastName,
        email: dbEmail,
        phone: dbPhone,
        role: 'CLIENT',
        enabled: true,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      mockDb.setUsers([...usersList, newClient]);
    }

    // Save reservation
    const resId = `res-${Date.now()}`;
    const resNum = `TPH-${Math.floor(10000 + Math.random() * 90000)}-DAK`;
    
    const newReservation: Reservation = {
      id: resId,
      reservationNumber: resNum,
      userId: clientId,
      roomId: dbRoomId,
      checkIn: dbCheckIn,
      checkOut: dbCheckOut,
      adults: dbAdults,
      children: dbChildren,
      numberOfNights: nights,
      totalPrice: total,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const reservationsList = mockDb.getReservations();
    mockDb.setReservations([...reservationsList, newReservation]);

    // Save payment
    const newPayment = {
      id: `pay-${Date.now()}`,
      reservationId: resId,
      amount: total,
      paymentMethod: dbPayMethod,
      status: dbPayMethod === 'CASH' ? 'PENDING' : 'PAID' as PaymentStatus,
      transactionReference: `TX-WALKIN-${Date.now()}`,
      paidAt: dbPayMethod === 'CASH' ? undefined : new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const paymentsList = mockDb.getPayments();
    mockDb.setPayments([...paymentsList, newPayment]);

    // Update Room status to occupied if check-in is today
    const todayStr = new Date().toISOString().split('T')[0];
    if (dbCheckIn === todayStr) {
      const roomsList = mockDb.getRooms();
      const updated = roomsList.map(r => {
        if (r.id === dbRoomId) return { ...r, status: 'OCCUPIED' as const };
        return r;
      });
      mockDb.setRooms(updated);
    }

    // Reset fields & close
    setShowDirectBookingModal(false);
    setDbCheckIn('');
    setDbCheckOut('');
    setDbRoomId('');
    setDbFirstName('');
    setDbLastName('');
    setDbEmail('');
    setDbPhone('');
    fetchData();
  };

  const getClientName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Client Inconnu';
  };

  const getRoomNum = (roomId: string) => {
    const r = rooms.find(room => room.id === roomId);
    return r ? r.roomNumber : 'N/A';
  };

  const getStatusClass = (status: Reservation['status']) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'CHECKED_IN': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CHECKED_OUT': return 'bg-gray-50 text-gray-500 border-gray-250';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-400';
    }
  };

  // Filtering list
  const filteredReservations = reservations.filter(res => {
    const clientName = getClientName(res.userId).toLowerCase();
    const roomNum = getRoomNum(res.roomId);
    const resNum = res.reservationNumber.toLowerCase();
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = clientName.includes(query) || roomNum.includes(query) || resNum.includes(query);

    const matchesStatus = statusFilter === 'ALL' || res.status === statusFilter;
    const matchesDate = !dateFilter || res.checkIn === dateFilter || res.checkOut === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Top Actions Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm">
        
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-teranga-gray-400" />
            <input
              type="text"
              placeholder="Rechercher client, chambre, réf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-teranga-gray-200 rounded-md px-3 py-1.5 pl-10 text-xs focus:ring-1 focus:ring-teranga-gold-450 focus:outline-none w-60 bg-teranga-beige-50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-teranga-gray-200 rounded-md px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teranga-gold-450"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PENDING">En Attente</option>
            <option value="CONFIRMED">Confirmée</option>
            <option value="CHECKED_IN">En Séjour</option>
            <option value="CHECKED_OUT">Terminée</option>
            <option value="CANCELLED">Annulée</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-teranga-gray-200 rounded-md px-3 py-1.5 text-xs bg-white focus:outline-none"
          />
        </div>

        {/* Walk-in reservation button */}
        <button
          onClick={() => setShowDirectBookingModal(true)}
          className="bg-teranga-gold-450 hover:bg-teranga-gold-500 text-white font-semibold text-xs py-2 px-4 rounded shadow transition-all flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Réservation Directe</span>
        </button>

      </div>

      {/* Grid listing */}
      <div className="bg-white border border-teranga-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredReservations.length === 0 ? (
            <div className="text-center py-16 text-xs text-teranga-gray-400">
              Aucune réservation trouvée.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-light text-teranga-gray-650">
              <thead>
                <tr className="border-b border-teranga-gray-200 bg-teranga-gray-50/50 text-[10px] font-bold uppercase text-teranga-gray-400">
                  <th className="p-4">Réf / Client</th>
                  <th className="p-4">Chambre</th>
                  <th className="p-4">Dates de séjour</th>
                  <th className="p-4">Montant</th>
                  <th className="p-4 text-center">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teranga-gray-150">
                {filteredReservations.map((res) => {
                  const cancelable = res.status === 'CONFIRMED' || res.status === 'PENDING';
                  const checkinable = res.status === 'CONFIRMED' || res.status === 'PENDING';
                  const checkoutable = res.status === 'CHECKED_IN';
                  const confirmable = res.status === 'PENDING';

                  return (
                    <tr key={res.id} className="hover:bg-teranga-beige-100/10 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-teranga-green-800">{getClientName(res.userId)}</span>
                          <span className="text-[10px] font-mono text-teranga-gray-400">{res.reservationNumber}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold">Chambre {getRoomNum(res.roomId)}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <span>Du {res.checkIn} au {res.checkOut}</span>
                          <span className="text-[10px] text-teranga-gray-400">{res.numberOfNights} nuit(s) &bull; {res.adults} Ad. {res.children > 0 ? `/ ${res.children} Enf.` : ''}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-teranga-green-850 font-sans">{res.totalPrice.toLocaleString()} F</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 border rounded-[4px] text-[9px] font-bold uppercase ${getStatusClass(res.status)}`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {confirmable && (
                            <button
                              onClick={() => handleAction(res.id, 'CONFIRM')}
                              className="bg-green-100 hover:bg-green-200 text-green-700 font-semibold px-2 py-1 rounded text-[9px]"
                              title="Confirmer"
                            >
                              Confirmer
                            </button>
                          )}
                          {checkinable && (
                            <button
                              onClick={() => handleAction(res.id, 'CHECK_IN')}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-2 py-1 rounded text-[9px]"
                              title="Check-in"
                            >
                              Check-in
                            </button>
                          )}
                          {checkoutable && (
                            <button
                              onClick={() => handleAction(res.id, 'CHECK_OUT')}
                              className="bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold px-2 py-1 rounded text-[9px]"
                              title="Check-out"
                            >
                              Check-out
                            </button>
                          )}
                          {cancelable && (
                            <button
                              onClick={() => handleAction(res.id, 'CANCEL')}
                              className="bg-red-50 hover:bg-red-100 text-red-650 font-semibold px-2 py-1 rounded text-[9px]"
                              title="Annuler"
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Record Direct Walk-in Booking */}
      {showDirectBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 space-y-4 border border-teranga-gray-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDirectBookingModal(false)}
              className="absolute top-4 right-4 text-teranga-gray-400 hover:text-teranga-gray-650"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-teranga-green-800 border-b border-teranga-gray-100 pb-2">
              Nouvelle Réservation Directe (Walk-in)
            </h3>

            {bookingError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-2.5 rounded text-xs text-center font-light">
                {bookingError}
              </div>
            )}

            <form onSubmit={handleDirectBookingSubmit} className="space-y-4 text-xs font-light text-teranga-gray-650">
              
              {/* Dates & Room Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-teranga-gray-100 pb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Date d'arrivée</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={dbCheckIn}
                    onChange={(e) => setDbCheckIn(e.target.value)}
                    className="border border-teranga-gray-200 rounded px-2 py-1.5 bg-teranga-beige-50 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Date de départ</label>
                  <input
                    type="date"
                    required
                    min={dbCheckIn || new Date().toISOString().split('T')[0]}
                    value={dbCheckOut}
                    onChange={(e) => setDbCheckOut(e.target.value)}
                    className="border border-teranga-gray-200 rounded px-2 py-1.5 bg-teranga-beige-50 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Chambre disponible</label>
                  <select
                    required
                    disabled={!dbCheckIn || !dbCheckOut}
                    value={dbRoomId}
                    onChange={(e) => setDbRoomId(e.target.value)}
                    className="border border-teranga-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none disabled:bg-teranga-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Sélectionner...</option>
                    {availableRooms.map(room => (
                      <option key={room.id} value={room.id}>
                        Chambre {room.roomNumber} ({room.roomType} &bull; {room.pricePerNight.toLocaleString()} F)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guest Profile details */}
              <div className="space-y-4 border-b border-teranga-gray-100 pb-4">
                <h4 className="font-serif font-bold text-teranga-green-800 text-xs">Informations Client</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Prénom</label>
                    <input
                      type="text"
                      required
                      value={dbFirstName}
                      onChange={(e) => setDbFirstName(e.target.value)}
                      className="border border-teranga-gray-200 rounded px-2 py-1.5 bg-teranga-beige-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Nom</label>
                    <input
                      type="text"
                      required
                      value={dbLastName}
                      onChange={(e) => setDbLastName(e.target.value)}
                      className="border border-teranga-gray-200 rounded px-2 py-1.5 bg-teranga-beige-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-teranga-gray-500">E-mail</label>
                    <input
                      type="email"
                      required
                      placeholder="nom@exemple.com"
                      value={dbEmail}
                      onChange={(e) => setDbEmail(e.target.value)}
                      className="border border-teranga-gray-200 rounded px-2 py-1.5 bg-teranga-beige-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Téléphone</label>
                    <input
                      type="tel"
                      required
                      placeholder="+221 77..."
                      value={dbPhone}
                      onChange={(e) => setDbPhone(e.target.value)}
                      className="border border-teranga-gray-200 rounded px-2 py-1.5 bg-teranga-beige-50"
                    />
                  </div>
                </div>
              </div>

              {/* Guests Count & Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Adultes</label>
                  <select
                    value={dbAdults}
                    onChange={(e) => setDbAdults(Number(e.target.value))}
                    className="border border-teranga-gray-200 rounded px-2 py-1.5 bg-white"
                  >
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Enfants</label>
                  <select
                    value={dbChildren}
                    onChange={(e) => setDbChildren(Number(e.target.value))}
                    className="border border-teranga-gray-200 rounded px-2 py-1.5 bg-white"
                  >
                    {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Règlement</label>
                  <select
                    value={dbPayMethod}
                    onChange={(e) => setDbPayMethod(e.target.value as PaymentMethod)}
                    className="border border-teranga-gray-200 rounded px-2 py-1.5 bg-white font-semibold text-teranga-green-800"
                  >
                    <option value="CASH">Espèces (Cash)</option>
                    <option value="CARD">Carte Bancaire</option>
                    <option value="WAVE">Wave</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-teranga-gray-100">
                <button
                  type="button"
                  onClick={() => setShowDirectBookingModal(false)}
                  className="btn-outline-gold py-1.5 px-4 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-teranga-green-750 hover:bg-teranga-green-800 text-white font-semibold text-xs px-5 py-1.5 rounded shadow transition-all"
                >
                  Enregistrer la réservation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
