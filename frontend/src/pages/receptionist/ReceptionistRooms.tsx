import React, { useEffect, useState } from 'react';
import { mockDb } from '../../services/mockDb';
import { Room, RoomStatus } from '../../types/types';
import { Check, Edit2, AlertCircle, RefreshCw } from 'lucide-react';

export const ReceptionistRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);

  const fetchRooms = () => {
    setRooms(mockDb.getRooms());
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleStatusChange = (roomId: string, newStatus: RoomStatus) => {
    const allRooms = mockDb.getRooms();
    const updated = allRooms.map(r => {
      if (r.id === roomId) {
        return { ...r, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] };
      }
      return r;
    });

    mockDb.setRooms(updated);
    fetchRooms();
  };

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-700 border-green-200';
      case 'OCCUPIED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CLEANING': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MAINTENANCE': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const getStatusLabel = (status: RoomStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'Disponible (Libre)';
      case 'OCCUPIED': return 'Occupée';
      case 'CLEANING': return 'En Ménage';
      case 'MAINTENANCE': return 'Maintenance';
      default: return status;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'STANDARD': return 'Standard';
      case 'DELUXE': return 'Deluxe';
      case 'SUITE': return 'Suite Premium';
      case 'FAMILY': return 'Suite Familiale';
      default: return cat;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title Header metadata */}
      <div className="bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm flex justify-between items-center text-xs">
        <span className="text-teranga-gray-500">
          Suivi en temps réel de l'état des <strong className="text-teranga-green-800 font-bold">{rooms.length}</strong> chambres.
        </span>
        <button 
          onClick={fetchRooms}
          className="text-teranga-gold-650 hover:text-teranga-gold-700 flex items-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" /> <span>Actualiser</span>
        </button>
      </div>

      {/* Grid Rooms list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div 
            key={room.id} 
            className="bg-white border border-teranga-gray-200 rounded-lg p-5 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start border-b border-teranga-gray-100 pb-2.5">
                <div>
                  <h3 className="font-serif text-sm font-bold text-teranga-green-800">
                    Chambre {room.roomNumber}
                  </h3>
                  <span className="text-[10px] text-teranga-gold-650 font-bold tracking-wider uppercase font-sans">
                    {getCategoryLabel(room.roomType)}
                  </span>
                </div>
                <span className={`px-2 py-0.5 border rounded-[4px] text-[9px] font-bold uppercase shrink-0 ${getStatusColor(room.status)}`}>
                  {getStatusLabel(room.status)}
                </span>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-y-2 text-[10px] text-teranga-gray-500 font-light pt-3">
                <span>Capacité maximale :</span>
                <strong className="text-teranga-gray-700 font-bold">{room.capacity} pers.</strong>
                <span>Superficie :</span>
                <strong className="text-teranga-gray-700 font-bold">{room.size} m²</strong>
                <span>Tarif par nuit :</span>
                <strong className="text-teranga-gray-750 font-bold font-sans">{room.pricePerNight.toLocaleString()} F</strong>
              </div>
            </div>

            {/* Quick Status toggle dropdown */}
            <div className="pt-4 border-t border-teranga-gray-100 space-y-1.5 text-xs">
              <label className="text-[9px] uppercase font-bold text-teranga-gray-400 block">Changer le statut :</label>
              <select
                value={room.status}
                onChange={(e) => handleStatusChange(room.id, e.target.value as RoomStatus)}
                className="w-full border border-teranga-gray-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teranga-gold-450 font-semibold text-teranga-green-850"
              >
                <option value="AVAILABLE">Disponible</option>
                <option value="OCCUPIED">Occupée</option>
                <option value="CLEANING">En Ménage</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
