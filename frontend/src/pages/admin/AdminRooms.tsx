import React, { useEffect, useState } from 'react';
import { mockDb } from '../../services/mockDb';
import { Room, RoomTypeCategory, RoomStatus } from '../../types/types';
import { Plus, Search, Edit2, Trash2, X, Check, Save } from 'lucide-react';

export const AdminRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form Fields
  const [roomNumber, setRoomNumber] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerNight, setPricePerNight] = useState(55000);
  const [capacity, setCapacity] = useState(2);
  const [size, setSize] = useState(28);
  const [status, setStatus] = useState<RoomStatus>('AVAILABLE');
  const [roomType, setRoomType] = useState<RoomTypeCategory>('STANDARD');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState('');

  const AMENITY_OPTIONS = [
    'Wi-Fi gratuit', 'Wi-Fi haut débit', 'Climatisation', 'Télévision HD', 
    'Télévision 4K', 'Cafetière Nespresso', 'Minibar', 'Minibar garni', 
    'Coffre-fort', 'Balcon jardin', 'Terrasse vue mer', 'Jacuzzi privé', 
    'Salon séparé', 'Service de chambre 24h/24', 'Majordome', 'Blanchisserie'
  ];

  const fetchRooms = () => {
    setRooms(mockDb.getRooms());
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setName('');
    setDescription('');
    setPricePerNight(55000);
    setCapacity(2);
    setSize(28);
    setStatus('AVAILABLE');
    setRoomType('STANDARD');
    setSelectedAmenities(['Wi-Fi gratuit', 'Climatisation', 'Télévision HD']);
    setPhotoUrl('https://images.unsplash.com/photo-1611891405222-463624afb559?auto=format&fit=crop&w=800&q=80');
    setShowModal(true);
  };

  const handleOpenEditModal = (room: Room) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setName(room.name);
    setDescription(room.description);
    setPricePerNight(room.pricePerNight);
    setCapacity(room.capacity);
    setSize(room.size);
    setStatus(room.status);
    setRoomType(room.roomType);
    setSelectedAmenities(room.amenities);
    setPhotoUrl(room.images[0] || '');
    setShowModal(true);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) {
      const allRooms = mockDb.getRooms();
      const updated = allRooms.filter(r => r.id !== roomId);
      mockDb.setRooms(updated);
      fetchRooms();
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allRooms = mockDb.getRooms();

    const roomData: Room = {
      id: editingRoom ? editingRoom.id : `room-${Date.now()}`,
      roomNumber,
      name,
      description,
      pricePerNight,
      capacity,
      size,
      status,
      roomType,
      amenities: selectedAmenities,
      images: [photoUrl],
    };

    if (editingRoom) {
      // Edit
      const updated = allRooms.map(r => r.id === editingRoom.id ? { ...roomData, updatedAt: new Date().toISOString() } : r);
      mockDb.setRooms(updated);
    } else {
      // Create
      // Check if room number already exists
      if (allRooms.some(r => r.roomNumber === roomNumber)) {
        alert('Le numéro de chambre existe déjà.');
        return;
      }
      mockDb.setRooms([...allRooms, { ...roomData, createdAt: new Date().toISOString() }]);
    }

    setShowModal(false);
    fetchRooms();
  };

  const getStatusColor = (st: RoomStatus) => {
    switch (st) {
      case 'AVAILABLE': return 'bg-green-100 text-green-700 border-green-200';
      case 'OCCUPIED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CLEANING': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MAINTENANCE': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const filteredRooms = rooms.filter(r => 
    r.roomNumber.includes(searchQuery) || 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.roomType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-teranga-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par numéro, catégorie..."
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
          <span>Ajouter une Chambre</span>
        </button>
      </div>

      {/* Grid listing */}
      <div className="bg-white border border-teranga-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-16 text-xs text-teranga-gray-400">
              Aucune chambre répertoriée dans le système.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-light text-teranga-gray-650">
              <thead>
                <tr className="border-b border-teranga-gray-200 bg-teranga-gray-50/50 text-[10px] font-bold uppercase text-teranga-gray-400">
                  <th className="p-4">N° / Type</th>
                  <th className="p-4">Description de l'hébergement</th>
                  <th className="p-4 text-center">Voyageurs / Taille</th>
                  <th className="p-4 text-right">Tarif / nuit</th>
                  <th className="p-4 text-center">État</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teranga-gray-150">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-teranga-beige-100/10 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-teranga-green-800 text-sm">Chambre {room.roomNumber}</span>
                        <span className="text-[10px] text-teranga-gold-650 font-bold uppercase tracking-wide">{room.roomType}</span>
                      </div>
                    </td>
                    <td className="p-4 max-w-sm">
                      <p className="truncate text-teranga-gray-500 font-light" title={room.description}>
                        {room.description}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <span>{room.capacity} voyageurs &bull; {room.size} m²</span>
                    </td>
                    <td className="p-4 text-right font-semibold text-teranga-green-850 font-sans">
                      {room.pricePerNight.toLocaleString()} F
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 border rounded-[4px] text-[9px] font-bold uppercase ${getStatusColor(room.status)}`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(room)}
                          className="text-teranga-gold-650 hover:text-teranga-gold-700 p-1.5 hover:bg-teranga-beige-100 rounded"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
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

      {/* Modal: Create/Edit Room Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 space-y-4 border border-teranga-gray-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-teranga-gray-400 hover:text-teranga-gray-650"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-teranga-green-800 border-b border-teranga-gray-150 pb-2">
              {editingRoom ? `Modifier la Chambre ${editingRoom.roomNumber}` : 'Ajouter une Chambre'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-light text-teranga-gray-650">
              
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Numéro de chambre</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingRoom}
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-teranga-beige-50 disabled:bg-teranga-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Catégorie</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as RoomTypeCategory)}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="DELUXE">Deluxe</option>
                    <option value="SUITE">Suite Premium</option>
                    <option value="FAMILY">Suite Familiale</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">État initial</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RoomStatus)}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="AVAILABLE">Disponible</option>
                    <option value="OCCUPIED">Occupée</option>
                    <option value="CLEANING">En Ménage</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Tarif par nuit (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(Number(e.target.value))}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-teranga-beige-50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Capacité Voyageurs</label>
                  <input
                    type="number"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-teranga-beige-50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Superficie (m²)</label>
                  <input
                    type="number"
                    required
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-teranga-beige-50"
                  />
                </div>
              </div>

              {/* Row 3 Description */}
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

              {/* Photo URL */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-teranga-gray-500">URL de la photo de couverture</label>
                <input
                  type="url"
                  required
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-teranga-beige-50"
                />
              </div>

              {/* Amenities checkboxes */}
              <div className="space-y-2 border-t border-teranga-gray-100 pt-4">
                <label className="text-[10px] uppercase font-bold text-teranga-gray-400 block">Sélectionner Équipements :</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-40 overflow-y-auto pr-1">
                  {AMENITY_OPTIONS.map((am, i) => (
                    <label key={i} className="flex items-center gap-2 text-xs text-teranga-gray-650 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(am)}
                        onChange={() => handleAmenityToggle(am)}
                        className="rounded text-teranga-gold-450 border-teranga-gray-200 w-3.5 h-3.5"
                      />
                      <span>{am}</span>
                    </label>
                  ))}
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
                  <span>Sauvegarder</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
