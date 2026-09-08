import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarRange, CreditCard, Clock, Bell, User, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockDb } from '../../services/mockDb';
import { Reservation, Room, Payment, Notification } from '../../types/types';

export const ClientDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [clientReservations, setClientReservations] = useState<Reservation[]>([]);
  const [nextReservation, setNextReservation] = useState<Reservation | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (currentUser) {
      const resList = mockDb.getReservations().filter(r => r.userId === currentUser.id);
      setClientReservations(resList);
      
      const allRooms = mockDb.getRooms();
      setRooms(allRooms);

      // Find next upcoming reservation (CONFIRMED or PENDING, with checkIn date in the future or today)
      const todayStr = new Date().toISOString().split('T')[0];
      const upcoming = resList
        .filter(r => r.status !== 'CANCELLED' && r.status !== 'CHECKED_OUT' && r.checkIn >= todayStr)
        .sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0];
      
      setNextReservation(upcoming || null);

      // Calculate total expenditures
      const pays = mockDb.getPayments();
      const clientResIds = resList.map(r => r.id);
      const spent = pays
        .filter(p => clientResIds.includes(p.reservationId) && p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0);
      setTotalSpent(spent);

      // Fetch client notifications
      const notifs = mockDb.getNotifications().filter(n => n.userId === currentUser.id);
      setNotifications(notifs);
    }
  }, [currentUser]);

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'Chambre Teranga';
  };

  const getStatusClass = (status: Reservation['status']) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-50 border-green-200 text-green-700';
      case 'PENDING': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'CHECKED_IN': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'CHECKED_OUT': return 'bg-gray-50 border-gray-200 text-gray-700';
      case 'CANCELLED': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  const getStatusLabel = (status: Reservation['status']) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmée';
      case 'PENDING': return 'En Attente';
      case 'CHECKED_IN': return 'En Séjour';
      case 'CHECKED_OUT': return 'Terminée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Dynamic Key Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Spent card */}
        <div className="bg-white border border-teranga-gray-200 p-6 rounded-lg shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teranga-gold-50 border border-teranga-gold-200 rounded-full flex items-center justify-center text-teranga-gold-650 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-teranga-gray-400 uppercase font-semibold">Total Dépensé</span>
            <p className="font-sans text-xl font-bold text-teranga-green-800 mt-0.5">{totalSpent.toLocaleString()} F</p>
          </div>
        </div>

        {/* Bookings count card */}
        <div className="bg-white border border-teranga-gray-200 p-6 rounded-lg shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teranga-gold-50 border border-teranga-gold-200 rounded-full flex items-center justify-center text-teranga-gold-650 shrink-0">
            <CalendarRange className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-teranga-gray-400 uppercase font-semibold">Réservations</span>
            <p className="text-xl font-bold text-teranga-green-800 mt-0.5">{clientReservations.length} séjours</p>
          </div>
        </div>

        {/* Next checkout countdown card */}
        <div className="bg-white border border-teranga-gray-200 p-6 rounded-lg shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teranga-gold-50 border border-teranga-gold-200 rounded-full flex items-center justify-center text-teranga-gold-650 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-teranga-gray-400 uppercase font-semibold">Statut Membre</span>
            <p className="text-xl font-bold text-teranga-green-800 mt-0.5">Membre Silver</p>
          </div>
        </div>

      </div>

      {/* Main Grid: Upcoming reservation & notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Next Upcoming Reservation (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-teranga-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-teranga-green-800 border-b border-teranga-gray-100 pb-3 mb-5">
              Votre prochain séjour
            </h2>

            {nextReservation ? (
              <div className="space-y-6 text-xs text-teranga-gray-650 font-light">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-teranga-gray-100 pb-5">
                  <div className="space-y-1">
                    <h3 className="font-serif text-base font-bold text-teranga-green-800">
                      {getRoomName(nextReservation.roomId)}
                    </h3>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-teranga-gray-400">
                      Réf: {nextReservation.reservationNumber}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 border rounded text-[10px] font-bold uppercase ${getStatusClass(nextReservation.status)}`}>
                    {getStatusLabel(nextReservation.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <span className="text-[10px] text-teranga-gray-400 font-semibold block uppercase">Date d'arrivée</span>
                    <strong className="text-sm font-semibold text-teranga-green-800 block mt-1">{nextReservation.checkIn}</strong>
                    <span className="text-[10px] text-teranga-gray-400 font-light">À partir de 14h00</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-teranga-gray-400 font-semibold block uppercase">Date de départ</span>
                    <strong className="text-sm font-semibold text-teranga-green-800 block mt-1">{nextReservation.checkOut}</strong>
                    <span className="text-[10px] text-teranga-gray-400 font-light">Avant 12h00</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-teranga-gray-400 font-semibold block uppercase">Voyageurs</span>
                    <strong className="text-xs font-semibold block mt-1">
                      {nextReservation.adults} Adulte(s) {nextReservation.children > 0 ? `& ${nextReservation.children} Enfant(s)` : ''}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-teranga-gray-400 font-semibold block uppercase">Prix Total</span>
                    <strong className="text-xs font-semibold block mt-1 text-teranga-green-850 font-sans">
                      {nextReservation.totalPrice.toLocaleString()} FCFA
                    </strong>
                  </div>
                </div>

                <div className="pt-4 border-t border-teranga-gray-100 flex justify-end gap-3">
                  <Link 
                    to="/client/reservations" 
                    className="btn-outline-gold py-2 px-4 text-xs font-semibold shadow-none flex items-center gap-1"
                  >
                    <span>Gérer ma réservation</span> <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-3">
                <CalendarRange className="w-12 h-12 text-teranga-gold-300 mx-auto" />
                <h3 className="font-serif text-sm font-bold text-teranga-green-800">Aucun séjour prévu</h3>
                <p className="text-xs text-teranga-gray-400 font-light max-w-xs mx-auto">
                  Vous n'avez aucune réservation à venir. Réservez votre prochaine escapade au Teranga Palace !
                </p>
                <Link to="/rooms" className="inline-block btn-gold py-2 px-4 text-xs font-semibold mt-2">
                  Réserver maintenant
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Notifications Sidebar (1 col) */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-teranga-gray-200 rounded-lg p-6 shadow-sm h-full flex flex-col">
            <h2 className="font-serif text-lg font-bold text-teranga-green-800 border-b border-teranga-gray-100 pb-3 mb-4 flex items-center gap-2">
              <Bell className="w-4.5 h-4.5 text-teranga-gold-650" />
              <span>Notifications</span>
            </h2>

            <div className="flex-grow space-y-3 overflow-y-auto max-h-[320px] pr-1">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-3 rounded border text-xs font-light leading-relaxed transition-all ${
                      notif.read 
                        ? 'bg-white border-teranga-gray-200 text-teranga-gray-500' 
                        : 'bg-teranga-gold-50/30 border-teranga-gold-300/40 text-teranga-green-800 font-medium'
                    }`}
                  >
                    <p>{notif.message}</p>
                    <span className="text-[9px] text-teranga-gray-400 font-light block mt-1.5">{notif.createdAt}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-teranga-gray-400">
                  Aucune notification pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
