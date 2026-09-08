import React, { useEffect, useState } from 'react';
import { mockDb } from '../../services/mockDb';
import { HotelService } from '../../types/types';
import { Plus, Search, Edit2, Trash2, X, Save, Sparkles, Check, ToggleLeft, ToggleRight } from 'lucide-react';

export const AdminServices: React.FC = () => {
  const [services, setServices] = useState<HotelService[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [editingSrv, setEditingSrv] = useState<HotelService | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [icon, setIcon] = useState('Wifi');
  const [active, setActive] = useState(true);

  const fetchServices = () => {
    setServices(mockDb.getServices());
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingSrv(null);
    setName('');
    setDescription('');
    setPrice(0);
    setIcon('Sparkles');
    setActive(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (srv: HotelService) => {
    setEditingSrv(srv);
    setName(srv.name);
    setDescription(srv.description);
    setPrice(srv.price);
    setIcon(srv.icon);
    setActive(srv.active);
    setShowModal(true);
  };

  const handleDeleteService = (srvId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      const allServices = mockDb.getServices();
      const updated = allServices.filter(s => s.id !== srvId);
      mockDb.setServices(updated);
      fetchServices();
    }
  };

  const handleToggleActive = (srvId: string) => {
    const allServices = mockDb.getServices();
    const updated = allServices.map(s => {
      if (s.id === srvId) {
        return { ...s, active: !s.active };
      }
      return s;
    });

    mockDb.setServices(updated);
    fetchServices();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allServices = mockDb.getServices();

    const srvData: HotelService = {
      id: editingSrv ? editingSrv.id : `srv-${Date.now()}`,
      name,
      description,
      price,
      icon,
      active
    };

    if (editingSrv) {
      // Edit
      const updated = allServices.map(s => s.id === editingSrv.id ? srvData : s);
      mockDb.setServices(updated);
    } else {
      // Create
      mockDb.setServices([...allServices, srvData]);
    }

    setShowModal(false);
    fetchServices();
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Action panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-teranga-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom service..."
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
          <span>Créer un Service</span>
        </button>
      </div>

      {/* Grid listing */}
      <div className="bg-white border border-teranga-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredServices.length === 0 ? (
            <div className="text-center py-16 text-xs text-teranga-gray-400">
              Aucun service répertorié.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-light text-teranga-gray-650">
              <thead>
                <tr className="border-b border-teranga-gray-200 bg-teranga-gray-50/50 text-[10px] font-bold uppercase text-teranga-gray-400">
                  <th className="p-4">Service</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Tarif</th>
                  <th className="p-4 text-center">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teranga-gray-150">
                {filteredServices.map((srv) => (
                  <tr key={srv.id} className="hover:bg-teranga-beige-100/10 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5 font-semibold text-teranga-green-800">
                        <Sparkles className="w-4.5 h-4.5 text-teranga-gold-650 shrink-0" />
                        <span>{srv.name}</span>
                      </div>
                    </td>
                    <td className="p-4 max-w-sm">
                      <p className="truncate text-teranga-gray-500 font-light" title={srv.description}>
                        {srv.description}
                      </p>
                    </td>
                    <td className="p-4 text-right font-semibold text-teranga-green-850 font-sans">
                      {srv.price === 0 ? 'Gratuit' : `${srv.price.toLocaleString()} F`}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 border rounded-[4px] text-[9px] font-bold uppercase ${
                        srv.active 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {srv.active ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(srv)}
                          className="text-teranga-gold-650 hover:text-teranga-gold-700 p-1.5 hover:bg-teranga-beige-100 rounded"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(srv.id)}
                          className={`p-1.5 rounded transition-colors ${
                            srv.active ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={srv.active ? 'Désactiver' : 'Activer'}
                        >
                          {srv.active ? <ToggleRight className="w-5 h-5 text-teranga-gold-650" /> : <ToggleLeft className="w-5 h-5 text-teranga-gray-450" />}
                        </button>
                        <button
                          onClick={() => handleDeleteService(srv.id)}
                          className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded"
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

      {/* Modal: Create/Edit Service Form */}
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
              {editingSrv ? `Modifier le Service ${editingSrv.name}` : 'Créer un Service'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-light text-teranga-gray-650">
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Nom du service</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-teranga-beige-50 font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border border-teranga-gray-200 rounded p-2.5 bg-teranga-beige-50 focus:outline-none focus:ring-1 focus:ring-teranga-gold-450 leading-relaxed font-light"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Tarif du service (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-teranga-beige-50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Statut initial</label>
                  <select
                    value={active ? 'TRUE' : 'FALSE'}
                    onChange={(e) => setActive(e.target.value === 'TRUE')}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-white font-semibold text-teranga-green-800"
                  >
                    <option value="TRUE">Actif / Activé</option>
                    <option value="FALSE">Désactivé</option>
                  </select>
                </div>
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
