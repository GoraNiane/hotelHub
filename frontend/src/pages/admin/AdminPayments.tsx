import React, { useEffect, useState } from 'react';
import { mockDb } from '../../services/mockDb';
import { Payment, PaymentMethod, PaymentStatus } from '../../types/types';
import { Search, CreditCard, RefreshCw, RefreshCcw, DollarSign } from 'lucide-react';

export const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchPayments = () => {
    setPayments(mockDb.getPayments());
    setReservations(mockDb.getReservations());
    setUsers(mockDb.getUsers());
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = (paymentId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir rembourser cette transaction ?')) {
      const allPayments = mockDb.getPayments();
      const updated = allPayments.map(p => {
        if (p.id === paymentId) {
          return { ...p, status: 'REFUNDED' as PaymentStatus };
        }
        return p;
      });

      mockDb.setPayments(updated);
      fetchPayments();
    }
  };

  const getClientName = (reservationId: string) => {
    const res = reservations.find(r => r.id === reservationId);
    if (!res) return 'Client Inconnu';
    const user = users.find(u => u.id === res.userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Client Inconnu';
  };

  const getReservationNumber = (reservationId: string) => {
    const res = reservations.find(r => r.id === reservationId);
    return res ? res.reservationNumber : 'N/A';
  };

  const getStatusClass = (st: PaymentStatus) => {
    switch (st) {
      case 'PAID': return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'FAILED': return 'bg-red-50 text-red-700 border-red-200';
      case 'REFUNDED': return 'bg-gray-50 text-gray-500 border-gray-250';
      default: return 'bg-gray-50 text-gray-400';
    }
  };

  const getMethodLabel = (m: PaymentMethod) => {
    switch (m) {
      case 'CARD': return 'Carte Bancaire';
      case 'WAVE': return 'Wave';
      case 'ORANGE_MONEY': return 'Orange Money';
      case 'CASH': return 'Espèces (Cash)';
      default: return m;
    }
  };

  const filteredPayments = payments.filter(p => {
    const resNum = getReservationNumber(p.reservationId).toLowerCase();
    const clientName = getClientName(p.reservationId).toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = resNum.includes(query) || clientName.includes(query) || p.transactionReference.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-teranga-gray-400" />
            <input
              type="text"
              placeholder="Rechercher transaction, client, réf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-teranga-gray-200 rounded-md px-3 py-1.5 pl-10 text-xs focus:ring-1 focus:ring-teranga-gold-450 focus:outline-none bg-teranga-beige-50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-teranga-gray-200 rounded-md px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teranga-gold-450"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PAID">Réglé (PAID)</option>
            <option value="PENDING">En attente (PENDING)</option>
            <option value="FAILED">Échoué (FAILED)</option>
            <option value="REFUNDED">Remboursé (REFUNDED)</option>
          </select>
        </div>

        <button 
          onClick={fetchPayments}
          className="text-teranga-gold-650 hover:text-teranga-gold-700 flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className="w-4 h-4" /> <span>Actualiser</span>
        </button>
      </div>

      {/* Grid listing */}
      <div className="bg-white border border-teranga-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-16 text-xs text-teranga-gray-400">
              Aucune transaction financière trouvée.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-light text-teranga-gray-650">
              <thead>
                <tr className="border-b border-teranga-gray-200 bg-teranga-gray-50/50 text-[10px] font-bold uppercase text-teranga-gray-400">
                  <th className="p-4">Référence Tx / Date</th>
                  <th className="p-4">Réservation / Client</th>
                  <th className="p-4">Méthode de règlement</th>
                  <th className="p-4 text-right">Montant</th>
                  <th className="p-4 text-center">État</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teranga-gray-150">
                {filteredPayments.map((p) => {
                  const refundAvailable = p.status === 'PAID';
                  return (
                    <tr key={p.id} className="hover:bg-teranga-beige-100/10 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5 font-mono">
                          <span className="font-semibold text-teranga-green-800 text-xs">{p.transactionReference}</span>
                          <span className="text-[9px] text-teranga-gray-400 font-light">{p.createdAt}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-teranga-gray-700">{getClientName(p.reservationId)}</span>
                          <span className="text-[10px] font-mono text-teranga-gray-400">Réf: {getReservationNumber(p.reservationId)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span>{getMethodLabel(p.paymentMethod)}</span>
                      </td>
                      <td className="p-4 text-right font-semibold text-teranga-green-850 font-sans">
                        {p.amount.toLocaleString()} F
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 border rounded-[4px] text-[9px] font-bold uppercase ${getStatusClass(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {refundAvailable && (
                          <button
                            onClick={() => handleRefund(p.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 font-semibold px-2 py-1 rounded text-[9px] flex items-center gap-1.5 ml-auto"
                            title="Rembourser"
                          >
                            <RefreshCcw className="w-3 h-3 text-red-500" />
                            <span>Rembourser</span>
                          </button>
                        )}
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
