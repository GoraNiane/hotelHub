import React, { useEffect, useState } from 'react';
import { mockDb } from '../../services/mockDb';
import { Review } from '../../types/types';
import { Search, Star, Check, EyeOff, Trash2, RefreshCw } from 'lucide-react';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReviews = () => {
    setReviews(mockDb.getReviews());
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = (reviewId: string) => {
    const allReviews = mockDb.getReviews();
    const updated = allReviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, approved: true };
      }
      return r;
    });

    mockDb.setReviews(updated);
    fetchReviews();
  };

  const handleHide = (reviewId: string) => {
    const allReviews = mockDb.getReviews();
    const updated = allReviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, approved: false };
      }
      return r;
    });

    mockDb.setReviews(updated);
    fetchReviews();
  };

  const handleDelete = (reviewId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avis client ?')) {
      const allReviews = mockDb.getReviews();
      const updated = allReviews.filter(r => r.id !== reviewId);
      mockDb.setReviews(updated);
      fetchReviews();
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.comment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-teranga-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par client, commentaire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-teranga-gray-200 rounded-md px-3 py-1.5 pl-10 text-xs focus:ring-1 focus:ring-teranga-gold-450 focus:outline-none bg-teranga-beige-50"
          />
        </div>

        <button 
          onClick={fetchReviews}
          className="text-teranga-gold-650 hover:text-teranga-gold-700 flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className="w-4 h-4" /> <span>Actualiser</span>
        </button>
      </div>

      {/* Grid review cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.length === 0 ? (
          <div className="md:col-span-2 bg-white border border-teranga-gray-200 rounded-lg p-16 text-center shadow-sm">
            Aucun avis client correspondant.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div 
              key={rev.id} 
              className="bg-white border border-teranga-gray-200 rounded-lg p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start border-b border-teranga-gray-100 pb-2.5">
                  <div className="space-y-0.5">
                    <h3 className="font-serif text-sm font-bold text-teranga-green-800">{rev.userName}</h3>
                    <span className="text-[10px] text-teranga-gray-400 font-light">{rev.createdAt} &bull; {rev.roomName || 'Hôtel'}</span>
                  </div>
                  <span className={`px-2 py-0.5 border rounded-[4px] text-[8px] font-bold uppercase ${
                    rev.approved 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {rev.approved ? 'En ligne' : 'Masqué'}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex gap-0.5 text-teranga-gold-450">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Comment text */}
                <p className="text-xs text-teranga-gray-650 leading-relaxed font-light italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-teranga-gray-100 flex justify-end gap-2.5">
                {rev.approved ? (
                  <button
                    onClick={() => handleHide(rev.id)}
                    className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-semibold px-3 py-1.5 rounded text-[10px] flex items-center gap-1"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Masquer</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleApprove(rev.id)}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-semibold px-3 py-1.5 rounded text-[10px] flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approuver</span>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 font-semibold px-3 py-1.5 rounded text-[10px] flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Supprimer</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
