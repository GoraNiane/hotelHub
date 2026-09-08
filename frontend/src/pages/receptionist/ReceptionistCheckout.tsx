import React, { useEffect, useState } from 'react';
import { mockDb } from '../../services/mockDb';
import { Reservation, Room, User, PaymentStatus } from '../../types/types';
import { Search, CheckCircle, Info, RefreshCw } from 'lucide-react';

export const ReceptionistCheckout: React.FC = () => {
  const [departures, setDepartures] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDepartures = () => {
    const allRes = mockDb.getReservations();
    const todayStr = new Date().toISOString().split('T')[0];

    // Filter check-outs scheduled for today that are currently checked-in
    const todayDepartures = allRes.filter(r => 
      r.checkOut === todayStr && 
      r.status === 'CHECKED_IN'
    );

    setDepartures(todayDepartures);
    setRooms(mockDb.getRooms());
    setUsers(mockDb.getUsers());
  };

  useEffect(() => {
    fetchDepartures();
  }, []);

  const handleCheckout = (resId: string, roomId: string) => {
    const allRes = mockDb.getReservations();
    const allRooms = mockDb.getRooms();
    const allPayments = mockDb.getPayments();

    // 1. Update reservation status to CHECKED_OUT
    const updatedRes = allRes.map(r => {
      if (r.id === resId) {
        return { 
          ...r, 
          status: 'CHECKED_OUT' as const, 
          updatedAt: new Date().toISOString().split('T')[0] 
        };
      }
      return r;
    });
    mockDb.setReservations(updatedRes);

    // 2. Update room status to CLEANING
    const updatedRooms = allRooms.map(r => {
      if (r.id === roomId) {
        return { ...r, status: 'CLEANING' as const };
      }
      return r;
    });
    mockDb.setRooms(updatedRooms);

    // 3. Mark simulated payments associated to this booking as PAID (in case of cash on site checkout settle)
    const updatedPayments = allPayments.map(p => {
      if (p.reservationId === resId) {
        return { 
          ...p, 
          status: 'PAID' as PaymentStatus, 
          paidAt: new Date().toISOString() 
        };
      }
      return p;
    });
    mockDb.setPayments(updatedPayments);

    // 4. Add client notification
    const res = allRes.find(r => r.id === resId)!;
    const notifs = mockDb.getNotifications();
    notifs.push({
      id: `notif-${Date.now()}`,
      userId: res.userId,
      message: `Votre départ (Check-out) a été validé. Merci pour votre séjour au Teranga Palace !`,
      read: false,
      type: 'INFO',
      createdAt: new Date().toISOString(),
    });
    mockDb.setNotifications(notifs);

    setSuccessMsg(`Check-out validé avec succès pour le client ${getClientName(res.userId)}. La chambre ${getRoomNum(roomId)} est passée en ménage.`);
    fetchDepartures();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const getClientName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Client Inconnu';
  };

  const getRoomNum = (roomId: string) => {
    const r = rooms.find(room => room.id === roomId);
    return r ? r.roomNumber : 'N/A';
  };

  const getRoomType = (roomId: string) => {
    const r = rooms.find(room => room.id === roomId);
    return r ? r.roomType : 'N/A';
  };

  const filteredDepartures = departures.filter(res => {
    const clientName = getClientName(res.userId).toLowerCase();
    const roomNum = getRoomNum(res.roomId);
    const query = searchQuery.toLowerCase();
    return clientName.includes(query) || roomNum.includes(query) || res.reservationNumber.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Search Bar */}
      <div className="flex bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-teranga-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom client, chambre, référence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-teranga-gray-200 rounded-md px-3 py-1.5 pl-10 text-xs focus:ring-1 focus:ring-teranga-gold-450 focus:outline-none bg-teranga-beige-50"
          />
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-250 text-green-700 p-4 rounded-md text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDepartures.length === 0 ? (
          <div className="md:col-span-2 bg-white border border-teranga-gray-200 rounded-lg p-16 text-center shadow-sm">
            <Info className="w-12 h-12 text-teranga-gold-300 mx-auto mb-3" />
            <h3 className="font-serif text-sm font-bold text-teranga-green-800">Aucun check-out en attente</h3>
            <p className="text-xs text-teranga-gray-400 font-light mt-1">
              Tous les départs d'aujourd'hui ont été enregistrés ou aucun départ n'est planifié à cette date.
            </p>
          </div>
        ) : (
          filteredDepartures.map((res) => (
            <div 
              key={res.id} 
              className="bg-white border border-teranga-gray-200 rounded-lg p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start border-b border-teranga-gray-100 pb-2">
                  <div>
                    <span className="text-[9px] font-mono tracking-wider text-teranga-gray-400 uppercase">Réf: {res.reservationNumber}</span>
                    <h3 className="font-serif text-sm font-bold text-teranga-green-800 mt-0.5">{getClientName(res.userId)}</h3>
                  </div>
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 text-[8px] font-bold uppercase rounded">
                    En séjour (Checked-in)
                  </span>
                </div>

                {/* Details list */}
                <div className="grid grid-cols-2 gap-y-2 text-[10px] text-teranga-gray-500 font-light pt-1">
                  <span>Chambre occupée :</span>
                  <strong className="text-teranga-gray-750 font-bold">Chambre {getRoomNum(res.roomId)} ({getRoomType(res.roomId)})</strong>
                  <span>Séjour (Nuits) :</span>
                  <span>Du {res.checkIn} au {res.checkOut} ({res.numberOfNights} nuits)</span>
                  <span>Total facturation :</span>
                  <strong className="font-sans text-teranga-green-850 font-bold">{res.totalPrice.toLocaleString()} F</strong>
                  <span>Solder compte :</span>
                  <span className="text-green-600 font-semibold">
                    Payé / À solder ({res.totalPrice.toLocaleString()} F)
                  </span>
                </div>
              </div>

              {/* Confirm checkout action */}
              <div className="pt-4 border-t border-teranga-gray-100 flex justify-end">
                <button
                  onClick={() => handleCheckout(res.id, res.roomId)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs py-2 px-5 rounded shadow transition-all"
                >
                  Valider le check-out
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
