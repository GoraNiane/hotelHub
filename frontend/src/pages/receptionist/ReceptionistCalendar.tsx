import React, { useEffect, useState } from 'react';
import { mockDb } from '../../services/mockDb';
import { Reservation, Room, User } from '../../types/types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info, X } from 'lucide-react';

export const ReceptionistCalendar: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Calendar Focus Date State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Selected Booking Details Dialog
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  useEffect(() => {
    setReservations(mockDb.getReservations());
    setRooms(mockDb.getRooms());
    setUsers(mockDb.getUsers());
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getDaysArray = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const days = [];
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getClientName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Client Inconnu';
  };

  // Find booking for a specific room and date
  const getBookingForDate = (roomId: string, date: Date): Reservation | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    
    return reservations.find(res => {
      if (res.roomId !== roomId) return false;
      if (res.status === 'CANCELLED') return false;
      
      const checkInStr = res.checkIn;
      const checkOutStr = res.checkOut;
      
      return (dateStr >= checkInStr && dateStr < checkOutStr); // End date day is not occupied in the checkout morning usually
    });
  };

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'CHECKED_IN': return 'bg-blue-500 border-blue-600 text-white';
      case 'CONFIRMED': return 'bg-green-500 border-green-600 text-white';
      case 'PENDING': return 'bg-orange-500 border-orange-650 text-white';
      case 'CHECKED_OUT': return 'bg-gray-400 border-gray-500 text-white';
      default: return 'bg-gray-300';
    }
  };

  const days = getDaysArray();
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Calendar Header Nav bar */}
      <div className="flex justify-between items-center bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-teranga-gold-650" />
          <h2 className="font-serif text-lg font-bold text-teranga-green-800">
            Planning d'Occupation &bull; {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 border border-teranga-gray-200 rounded hover:bg-teranga-beige-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-teranga-gray-600" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-xs border border-teranga-gray-200 px-3 py-1 rounded hover:bg-teranga-beige-100 transition-colors"
          >
            Aujourd'hui
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 border border-teranga-gray-200 rounded hover:bg-teranga-beige-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-teranga-gray-600" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[10px] uppercase font-bold text-teranga-gray-500 bg-white border border-teranga-gray-200 px-5 py-3 rounded-lg shadow-sm">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-500 rounded"></span> Confirmée</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-500 rounded"></span> En Séjour (Checked-in)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-orange-500 rounded"></span> En Attente</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-400 rounded"></span> Terminée</span>
      </div>

      {/* Grid Calendar Table */}
      <div className="bg-white border border-teranga-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh]">
          <table className="w-full text-center border-collapse text-[10px] font-sans">
            <thead>
              <tr className="border-b border-teranga-gray-200 bg-teranga-gray-50 uppercase font-bold sticky top-0 z-20">
                <th className="p-3 text-left w-32 border-r border-teranga-gray-200 bg-teranga-gray-50">Chambres</th>
                {days.map((day) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const dayStr = day.toISOString().split('T')[0];
                  const isToday = todayStr === dayStr;
                  return (
                    <th 
                      key={dayStr} 
                      className={`p-2 border-r border-teranga-gray-150 w-10 shrink-0 ${
                        isToday ? 'bg-teranga-gold-50 text-teranga-gold-700 font-black' : ''
                      }`}
                    >
                      <div>{day.getDate()}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-teranga-gray-150">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-teranga-beige-100/10">
                  <td className="p-3 font-semibold text-left border-r border-teranga-gray-200 text-teranga-green-800 bg-white sticky left-0 z-10 shadow-r">
                    {room.roomNumber} ({room.roomType.slice(0, 3)})
                  </td>
                  {days.map((day) => {
                    const booking = getBookingForDate(room.id, day);
                    const dayStr = day.toISOString().split('T')[0];
                    const isCheckInDay = booking && booking.checkIn === dayStr;
                    
                    return (
                      <td 
                        key={dayStr} 
                        className={`p-1 border-r border-teranga-gray-100 h-10 w-10 relative shrink-0`}
                      >
                        {booking ? (
                          <div 
                            onClick={() => setSelectedRes(booking)}
                            className={`absolute inset-0.5 rounded border text-[8px] flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-all truncate p-0.5 font-semibold ${getStatusColor(booking.status)}`}
                            title={`${getClientName(booking.userId)} - Du ${booking.checkIn} au ${booking.checkOut}`}
                          >
                            {isCheckInDay ? getClientName(booking.userId).split(' ')[1]?.slice(0, 5) || 'Book' : '•'}
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Details popup of Selected Booking */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4 border border-teranga-gray-200 shadow-2xl relative animate-fade-in">
            <button 
              onClick={() => setSelectedRes(null)}
              className="absolute top-4 right-4 text-teranga-gray-400 hover:text-teranga-gray-650"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-base font-bold text-teranga-green-800 border-b border-teranga-gray-150 pb-2">
              Détails de l'occupation
            </h3>

            <div className="text-xs font-light text-teranga-gray-650 space-y-2.5">
              <div className="grid grid-cols-2 gap-y-1.5">
                <span className="text-teranga-gray-400 uppercase font-semibold text-[9px]">Client :</span>
                <strong className="text-teranga-green-800 font-bold">{getClientName(selectedRes.userId)}</strong>
                <span className="text-teranga-gray-400 uppercase font-semibold text-[9px]">Chambre :</span>
                <strong>N° {rooms.find(r => r.id === selectedRes.roomId)?.roomNumber || 'N/A'}</strong>
                <span className="text-teranga-gray-400 uppercase font-semibold text-[9px]">Référence :</span>
                <span className="font-mono text-teranga-green-850 font-bold">{selectedRes.reservationNumber}</span>
                <span className="text-teranga-gray-400 uppercase font-semibold text-[9px]">Dates :</span>
                <span>Du {selectedRes.checkIn} au {selectedRes.checkOut}</span>
                <span className="text-teranga-gray-400 uppercase font-semibold text-[9px]">Nuits / Hôtes :</span>
                <span>{selectedRes.numberOfNights} nuit(s) &bull; {selectedRes.adults} Ad. {selectedRes.children > 0 ? `/ ${selectedRes.children} Enf.` : ''}</span>
                <span className="text-teranga-gray-400 uppercase font-semibold text-[9px]">Total Facturé :</span>
                <strong className="text-teranga-green-850 font-sans">{selectedRes.totalPrice.toLocaleString()} F</strong>
                <span className="text-teranga-gray-400 uppercase font-semibold text-[9px]">Statut :</span>
                <span className="font-bold text-teranga-gold-650 uppercase">{selectedRes.status}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-teranga-gray-100">
              <button
                onClick={() => setSelectedRes(null)}
                className="btn-outline-gold py-1.5 px-4 text-xs font-semibold"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
