import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  CreditCard, CalendarRange, Users, DoorOpen, 
  ArrowUpRight, ArrowDownRight, Award, Bell 
} from 'lucide-react';
import { mockDb, mockServices } from '../../services/mockDb';
import { DashboardStats } from '../../types/types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch stats via simulated server service
    const calculatedStats = mockServices.getDashboardStats();
    setStats(calculatedStats);

    // Fetch last 5 reservations
    const allRes = mockDb.getReservations();
    const sortedRes = [...allRes]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);
    setRecentReservations(sortedRes);

    setUsers(mockDb.getUsers());
  }, []);

  if (!stats) {
    return <div className="text-center py-20 text-xs">Chargement du tableau de bord...</div>;
  }

  const getClientName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Client Inconnu';
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'CHECKED_IN': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CHECKED_OUT': return 'bg-gray-50 text-gray-500 border-gray-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-400';
    }
  };

  const COLORS = ['#123c32', '#c5a880', '#b39d78', '#4b5563'];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue */}
        <div className="bg-white border border-teranga-gray-200 p-6 rounded-lg shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teranga-gold-50 border border-teranga-gold-200 rounded-full flex items-center justify-center text-teranga-gold-650 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-teranga-gray-400 uppercase font-semibold">Chiffre d'Affaires</span>
            <p className="font-sans text-xl font-bold text-teranga-green-800 mt-0.5">{stats.totalRevenue.toLocaleString()} F</p>
          </div>
        </div>

        {/* Reservations count */}
        <div className="bg-white border border-teranga-gray-200 p-6 rounded-lg shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teranga-gold-50 border border-teranga-gold-200 rounded-full flex items-center justify-center text-teranga-gold-650 shrink-0">
            <CalendarRange className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-teranga-gray-400 uppercase font-semibold">Total Réservations</span>
            <p className="text-xl font-bold text-teranga-green-800 mt-0.5">{stats.totalReservations} dossiers</p>
          </div>
        </div>

        {/* Occupancy rate */}
        <div className="bg-white border border-teranga-gray-200 p-6 rounded-lg shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teranga-gold-50 border border-teranga-gold-200 rounded-full flex items-center justify-center text-teranga-gold-650 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-teranga-gray-400 uppercase font-semibold">Taux d'Occupation</span>
            <p className="text-xl font-bold text-teranga-green-800 mt-0.5">{stats.occupancyRate}%</p>
          </div>
        </div>

        {/* Total clients */}
        <div className="bg-white border border-teranga-gray-200 p-6 rounded-lg shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teranga-gold-50 border border-teranga-gold-200 rounded-full flex items-center justify-center text-teranga-gold-650 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-teranga-gray-400 uppercase font-semibold">Clients Enregistrés</span>
            <p className="text-xl font-bold text-teranga-green-800 mt-0.5">{stats.totalClients} fiches</p>
          </div>
        </div>

      </div>

      {/* Grid Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue by Month AreaChart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-teranga-gray-200 p-6 rounded-lg shadow-sm">
          <h3 className="font-serif text-sm font-bold text-teranga-green-800 mb-6">Évolution mensuelle des revenus (FCFA)</h3>
          <div className="h-72 w-full text-[10px] font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueByMonth}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c5a880" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#c5a880" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} FCFA`, 'Revenus']} />
                <Area type="monotone" dataKey="revenue" stroke="#c5a880" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Booked Room categories PieChart (1 col) */}
        <div className="lg:col-span-1 bg-white border border-teranga-gray-200 p-6 rounded-lg shadow-sm flex flex-col justify-between">
          <h3 className="font-serif text-sm font-bold text-teranga-green-800 mb-6">Répartition par catégorie demandée</h3>
          <div className="h-60 w-full text-[10px] font-sans relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.mostBookedRooms}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="roomName"
                >
                  {stats.mostBookedRooms.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} réservations`, 'Demande']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[9px] text-teranga-gray-500 font-bold uppercase mt-4">
            {stats.mostBookedRooms.map((entry, index) => (
              <span key={index} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span>{entry.roomName}</span>
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Grid: Secondary chart + Recent reservations list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Occupancy rate LineChart (1 col) */}
        <div className="lg:col-span-1 bg-white border border-teranga-gray-200 p-6 rounded-lg shadow-sm">
          <h3 className="font-serif text-sm font-bold text-teranga-green-800 mb-6">Taux d'occupation mensuel (%)</h3>
          <div className="h-64 w-full text-[10px] font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.occupancyRateByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "Taux d'occupation"]} />
                <Line type="monotone" dataKey="rate" stroke="#123c32" strokeWidth={2.5} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Reservations Table (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-teranga-gray-200 p-6 rounded-lg shadow-sm flex flex-col justify-between">
          <h3 className="font-serif text-sm font-bold text-teranga-green-800 border-b border-teranga-gray-100 pb-3 mb-4">
            Réservations récentes
          </h3>

          <div className="flex-grow overflow-x-auto text-[11px] font-light text-teranga-gray-650">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-teranga-gray-200 text-[9px] font-bold uppercase text-teranga-gray-400">
                  <th className="py-2">Client</th>
                  <th className="py-2">Dates</th>
                  <th className="py-2">Montant</th>
                  <th className="py-2 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teranga-gray-100">
                {recentReservations.map((res) => (
                  <tr key={res.id}>
                    <td className="py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-teranga-green-800">{getClientName(res.userId)}</span>
                        <span className="text-[9px] font-mono text-teranga-gray-400">{res.reservationNumber}</span>
                      </div>
                    </td>
                    <td className="py-3">Du {res.checkIn} au {res.checkOut}</td>
                    <td className="py-3 font-semibold font-sans">{res.totalPrice.toLocaleString()} F</td>
                    <td className="py-3 text-right">
                      <span className={`inline-block px-2.5 py-0.5 border rounded text-[9px] font-bold uppercase ${getStatusClass(res.status)}`}>
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
