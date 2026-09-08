import React, { useEffect, useState } from 'react';
import { mockDb } from '../../services/mockDb';
import { User, Reservation, Payment } from '../../types/types';
import { Search, Mail, Phone, Calendar, UserCheck } from 'lucide-react';

export const ReceptionistClients: React.FC = () => {
  const [clients, setClients] = useState<User[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setClients(mockDb.getUsers().filter(u => u.role === 'CLIENT'));
    setReservations(mockDb.getReservations());
    setPayments(mockDb.getPayments());
  }, []);

  const getClientStats = (clientId: string) => {
    const resList = reservations.filter(r => r.userId === clientId);
    const completedPayments = payments.filter(p => 
      resList.map(r => r.id).includes(p.reservationId) && p.status === 'PAID'
    );
    const totalSpent = completedPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      bookingCount: resList.length,
      lastStay: resList.length > 0 ? resList.sort((a, b) => b.checkIn.localeCompare(a.checkIn))[0].checkIn : 'N/A',
      totalSpent
    };
  };

  const filteredClients = clients.filter(c => {
    const query = searchQuery.toLowerCase();
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    return fullName.includes(query) || c.email.toLowerCase().includes(query) || c.phone.includes(query);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Search Header */}
      <div className="flex bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-teranga-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un client par nom, email, téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-teranga-gray-200 rounded-md px-3 py-1.5 pl-10 text-xs focus:ring-1 focus:ring-teranga-gold-450 focus:outline-none bg-teranga-beige-50"
          />
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-teranga-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredClients.length === 0 ? (
            <div className="text-center py-16 text-xs text-teranga-gray-400">
              Aucun client enregistré trouvé.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-light text-teranga-gray-650">
              <thead>
                <tr className="border-b border-teranga-gray-200 bg-teranga-gray-50/50 text-[10px] font-bold uppercase text-teranga-gray-400">
                  <th className="p-4">Client</th>
                  <th className="p-4">E-mail / Téléphone</th>
                  <th className="p-4 text-center">Séjours réservés</th>
                  <th className="p-4 text-center">Dernier Séjour</th>
                  <th className="p-4 text-right">Dépenses Cumulées</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teranga-gray-150">
                {filteredClients.map((client) => {
                  const stats = getClientStats(client.id);
                  return (
                    <tr key={client.id} className="hover:bg-teranga-beige-100/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teranga-gold-50 text-teranga-gold-650 flex items-center justify-center font-bold text-xs border border-teranga-gold-200">
                            {client.firstName[0]}{client.lastName[0]}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-teranga-green-800">{client.firstName} {client.lastName}</span>
                            <span className="text-[10px] text-teranga-gray-450">Membre depuis : {client.createdAt}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-[11px]">
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-teranga-gray-400 shrink-0" /> {client.email}</span>
                          <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-teranga-gray-400 shrink-0" /> {client.phone}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-semibold">{stats.bookingCount}</td>
                      <td className="p-4 text-center">{stats.lastStay}</td>
                      <td className="p-4 text-right font-semibold text-teranga-green-850 font-sans">
                        {stats.totalSpent.toLocaleString()} F
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
