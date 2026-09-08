import React, { useEffect, useState } from 'react';
import { mockDb } from '../../services/mockDb';
import { Promotion } from '../../types/types';
import { Plus, Search, Edit2, Trash2, X, Save, Ticket, ToggleLeft, ToggleRight } from 'lucide-react';

export const AdminPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxUses, setMaxUses] = useState(100);
  const [active, setActive] = useState(true);

  const fetchPromotions = () => {
    setPromotions(mockDb.getPromotions());
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingPromo(null);
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue(10);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setMaxUses(100);
    setActive(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (promo: Promotion) => {
    setEditingPromo(promo);
    setCode(promo.code);
    setDiscountType(promo.discountType);
    setDiscountValue(promo.discountValue);
    setStartDate(promo.startDate);
    setEndDate(promo.endDate);
    setMaxUses(promo.maxUses);
    setActive(promo.active);
    setShowModal(true);
  };

  const handleDeletePromotion = (promoId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) {
      const allPromotions = mockDb.getPromotions();
      const updated = allPromotions.filter(p => p.id !== promoId);
      mockDb.setPromotions(updated);
      fetchPromotions();
    }
  };

  const handleToggleActive = (promoId: string) => {
    const allPromotions = mockDb.getPromotions();
    const updated = allPromotions.map(p => {
      if (p.id === promoId) {
        return { ...p, active: !p.active };
      }
      return p;
    });

    mockDb.setPromotions(updated);
    fetchPromotions();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allPromotions = mockDb.getPromotions();

    const promoData: Promotion = {
      id: editingPromo ? editingPromo.id : `promo-${Date.now()}`,
      code: code.toUpperCase().trim(),
      discountType,
      discountValue,
      startDate,
      endDate,
      maxUses,
      currentUses: editingPromo ? editingPromo.currentUses : 0,
      active
    };

    if (editingPromo) {
      // Edit
      const updated = allPromotions.map(p => p.id === editingPromo.id ? promoData : p);
      mockDb.setPromotions(updated);
    } else {
      // Create
      // Check if code exists
      if (allPromotions.some(p => p.code.toUpperCase() === code.toUpperCase().trim())) {
        alert('Ce code promotionnel existe déjà.');
        return;
      }
      mockDb.setPromotions([...allPromotions, promoData]);
    }

    setShowModal(false);
    fetchPromotions();
  };

  const filteredPromotions = promotions.filter(p => 
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-teranga-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par code promo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-teranga-gray-200 rounded-md px-3 py-1.5 pl-10 text-xs focus:ring-1 focus:ring-teranga-gold-450 focus:outline-none bg-teranga-beige-50"
          />
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-teranga-gold-450 hover:bg-teranga-gold-500 text-white font-semibold text-xs py-2 px-4 rounded shadow transition-all flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une Promotion</span>
        </button>
      </div>

      {/* Grid listing */}
      <div className="bg-white border border-teranga-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredPromotions.length === 0 ? (
            <div className="text-center py-16 text-xs text-teranga-gray-400">
              Aucun code promotionnel trouvé.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-light text-teranga-gray-650">
              <thead>
                <tr className="border-b border-teranga-gray-200 bg-teranga-gray-50/50 text-[10px] font-bold uppercase text-teranga-gray-400">
                  <th className="p-4">Code</th>
                  <th className="p-4">Réduction</th>
                  <th className="p-4">Validité</th>
                  <th className="p-4 text-center">Utilisations</th>
                  <th className="p-4 text-center">État</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teranga-gray-150">
                {filteredPromotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-teranga-beige-100/10 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5 font-bold font-mono text-sm text-teranga-green-800 uppercase">
                        <Ticket className="w-4.5 h-4.5 text-teranga-gold-650 shrink-0" />
                        <span>{promo.code}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-teranga-green-850">
                      {promo.discountType === 'PERCENTAGE' ? `-${promo.discountValue}%` : `-${promo.discountValue.toLocaleString()} FCFA`}
                    </td>
                    <td className="p-4 text-[11px] text-teranga-gray-550">
                      <span>Du {promo.startDate} au {promo.endDate}</span>
                    </td>
                    <td className="p-4 text-center font-medium">
                      <span>{promo.currentUses} / {promo.maxUses}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 border rounded-[4px] text-[9px] font-bold uppercase ${
                        promo.active 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {promo.active ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(promo)}
                          className="text-teranga-gold-650 hover:text-teranga-gold-700 p-1.5 hover:bg-teranga-beige-100 rounded"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(promo.id)}
                          className={`p-1.5 rounded transition-colors ${
                            promo.active ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={promo.active ? 'Désactiver' : 'Activer'}
                        >
                          {promo.active ? <ToggleRight className="w-5 h-5 text-teranga-gold-650" /> : <ToggleLeft className="w-5 h-5 text-teranga-gray-450" />}
                        </button>
                        <button
                          onClick={() => handleDeletePromotion(promo.id)}
                          className="text-red-500 hover:text-red-750 p-1.5 hover:bg-red-55 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Create/Edit Promotion Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 border border-teranga-gray-200 shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-teranga-gray-400 hover:text-teranga-gray-650"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-teranga-green-800 border-b border-teranga-gray-150 pb-2">
              {editingPromo ? `Modifier la promotion ${editingPromo.code}` : 'Créer une Promotion'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-light text-teranga-gray-650">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Code Promotionnel</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TERANGA10"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-teranga-beige-50 font-bold uppercase font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Type de remise</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="PERCENTAGE">Pourcentage (%)</option>
                    <option value="FIXED">Montant Fixe (FCFA)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Valeur de la remise</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-teranga-beige-50 font-bold text-teranga-green-800"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Nombre max d'utilisations</label>
                  <input
                    type="number"
                    required
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-teranga-beige-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Date de début</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-white text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Date de fin</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-white text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Statut initial</label>
                <select
                  value={active ? 'TRUE' : 'FALSE'}
                  onChange={(e) => setActive(e.target.value === 'TRUE')}
                  className="w-full border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-white font-semibold text-teranga-green-850"
                >
                  <option value="TRUE">Actif / Activé</option>
                  <option value="FALSE">Désactivé</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-teranga-gray-100">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline-gold py-1.5 px-4 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="bg-teranga-green-750 hover:bg-teranga-green-800 text-white font-semibold text-xs px-5 py-1.5 rounded shadow transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-teranga-gold-450" />
                  <span>Enregistrer</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
