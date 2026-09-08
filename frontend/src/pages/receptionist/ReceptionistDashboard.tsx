import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Users, ArrowUpRight, ArrowDownRight, DoorOpen, Brush, AlertTriangle, ArrowRight } from 'lucide-react';
import { mockDb, mockServices } from '../../services/mockDb';
import { Room, Reservation, Payment } from '../../types/types';

export const ReceptionistDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>({
    arrivalsTodayCount: 0,
    departuresTodayCount: 0,
    availableRoomsCount: 0,
    occupiedRoomsCount: 0,
    cleaningRoomsCount: 0,
    maintenanceRoomsCount: 0,
    revenueToday: 0
  });

  const [arrivalsToday, setArrivalsToday] = useState<Reservation[]>([]);
  const [departuresToday, setDeparturesToday] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const allRes = mockDb.getReservations();
    const allRooms = mockDb.getRooms();
    const allUsers = mockDb.getUsers();
    const allPayments = mockDb.getPayments();

    const todayStr = new Date().toISOString().split('T')[0];

    // Filter arrivals/departures today
    const arrivals = allRes.filter(r => r.checkIn === todayStr && (r.status === 'CONFIRMED' || r.status === 'PENDING'));
    const departures = allRes.filter(r => r.checkOut === todayStr && r.status === 'CHECKED_IN');

    setArrivalsToday(arrivals);
    setDeparturesToday(departures);
    setRooms(allRooms);
    setUsers(allUsers);

    // Calculate room statuses counts
    const avail = allRooms.filter(r => r.status === 'AVAILABLE').length;
    const occup = allRooms.filter(r => r.status === 'OCCUPIED').length;
    const clean = allRooms.filter(r => r.status === 'CLEANING').length;
    const maint = allRooms.filter(r => r.status === 'MAINTENANCE').length;

    // Calculate revenue today
    const rev = allPayments
      .filter(p => p.paidAt && p.paidAt.split('T')[0] === todayStr && p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    setStats({
      arrivalsTodayCount: arrivals.length,
      departuresTodayCount: departures.length,
      availableRoomsCount: avail,
      occupiedRoomsCount: occup,
      cleaningRoomsCount: clean,
      maintenanceRoomsCount: maint,
      revenueToday: rev
    });
  }, []);

  const getClientName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Client Inconnu';
  };

  const getRoomNum = (roomId: string) => {
    const r = rooms.find(room => room.id === roomId);
    return r ? `Chambre ${r.roomNumber}` : 'N/A';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
        
        {/* Arrivals count */}
        <div className="bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-teranga-gray-400 uppercase font-semibold">Arrivées Prévues</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-teranga-green-800">{stats.arrivalsTodayCount}</span>
            <ArrowUpRight className="w-5 h-5 text-green-600" />
          </div>
        </div>

        {/* Departures count */}
        <div className="bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-teranga-gray-400 uppercase font-semibold">Départs Prévus</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-teranga-green-800">{stats.departuresTodayCount}</span>
            <ArrowDownRight className="w-5 h-5 text-orange-500" />
          </div>
        </div>

        {/* Available rooms */}
        <div className="bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-teranga-gray-400 uppercase font-semibold">Chambres Libres</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-green-600">{stats.availableRoomsCount}</span>
            <DoorOpen className="w-5 h-5 text-green-600" />
          </div>
        </div>

        {/* Occupied rooms */}
        <div className="bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-teranga-gray-400 uppercase font-semibold">Chambres Occupées</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-teranga-green-800">{stats.occupiedRoomsCount}</span>
            <DoorOpen className="w-5 h-5 text-teranga-green-700" />
          </div>
        </div>

        {/* Cleaning rooms */}
        <div className="bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-teranga-gray-400 uppercase font-semibold">En Nettoyage</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-orange-500">{stats.cleaningRoomsCount}</span>
            <Brush className="w-5 h-5 text-orange-500" />
          </div>
        </div>

        {/* Revenue today */}
        <div className="bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-teranga-gray-400 uppercase font-semibold">Revenus du Jour</span>
          <div className="flex flex-col mt-1 font-sans">
            <span className="text-base font-bold text-teranga-green-850 truncate">{stats.revenueToday.toLocaleString()} F</span>
            <span className="text-[9px] text-teranga-gray-400 font-light">encaissés ce jour</span>
          </div>
        </div>

      </div>

      {/* Grid: Expected checkins and checkouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Expected Arrivals table */}
        <div className="bg-white border border-teranga-gray-200 rounded-lg p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center border-b border-teranga-gray-100 pb-3 mb-4">
            <h2 className="font-serif text-base font-bold text-teranga-green-800">
              Arrivées attendues aujourd'hui ({arrivalsToday.length})
            </h2>
            <Link to="/reception/checkin" className="text-xs text-teranga-gold-650 hover:underline flex items-center gap-0.5">
              <span>Voir tout</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-grow overflow-x-auto">
            {arrivalsToday.length === 0 ? (
              <div className="text-center py-10 text-xs text-teranga-gray-400 font-light">
                Aucune arrivée attendue aujourd'hui.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs font-light text-teranga-gray-650">
                <thead>
                  <tr className="border-b border-teranga-gray-200 text-[10px] font-bold uppercase text-teranga-gray-400">
                    <th className="py-2">Client</th>
                    <th className="py-2">Hébergement</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teranga-gray-100">
                  {arrivalsToday.map((res) => (
                    <tr key={res.id}>
                      <td className="py-3 font-semibold text-teranga-green-800">{getClientName(res.userId)}</td>
                      <td className="py-3">{getRoomNum(res.roomId)}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate('/reception/checkin')}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold text-[10px] px-3 py-1 rounded"
                        >
                          Check-in
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Expected Departures table */}
        <div className="bg-white border border-teranga-gray-200 rounded-lg p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center border-b border-teranga-gray-100 pb-3 mb-4">
            <h2 className="font-serif text-base font-bold text-teranga-green-800">
              Départs attendus aujourd'hui ({departuresToday.length})
            </h2>
            <Link to="/reception/checkout" className="text-xs text-teranga-gold-650 hover:underline flex items-center gap-0.5">
              <span>Voir tout</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-grow overflow-x-auto">
            {departuresToday.length === 0 ? (
              <div className="text-center py-10 text-xs text-teranga-gray-400 font-light">
                Aucun départ attendu aujourd'hui.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs font-light text-teranga-gray-650">
                <thead>
                  <tr className="border-b border-teranga-gray-200 text-[10px] font-bold uppercase text-teranga-gray-400">
                    <th className="py-2">Client</th>
                    <th className="py-2">Hébergement</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teranga-gray-100">
                  {departuresToday.map((res) => (
                    <tr key={res.id}>
                      <td className="py-3 font-semibold text-teranga-green-800">{getClientName(res.userId)}</td>
                      <td className="py-3">{getRoomNum(res.roomId)}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate('/reception/checkout')}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-[10px] px-3 py-1 rounded"
                        >
                          Check-out
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
