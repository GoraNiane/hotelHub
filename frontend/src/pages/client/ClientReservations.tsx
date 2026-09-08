import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockDb } from '../../services/mockDb';
import { Reservation, Room, Review } from '../../types/types';
import { Calendar, Trash2, MessageSquare, Star, X, Info } from 'lucide-react';

export const ClientReservations: React.FC = () => {
  const { currentUser } = useAuth();
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  
  // Cancellation States
  const [cancelRes, setCancelRes] = useState<Reservation | null>(null);
  
  // Review Modal States
  const [reviewRes, setReviewRes] = useState<Reservation | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const fetchClientData = () => {
    if (currentUser) {
      const allRes = mockDb.getReservations().filter(r => r.userId === currentUser.id);
      setReservations(allRes);
      setRooms(mockDb.getRooms());
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [currentUser]);

  const getRoom = (roomId: string): Room | undefined => {
    return rooms.find(r => r.id === roomId);
  };

  // Helper to determine if cancellation is allowed (at least 2 days before check-in)
  const isCancellationAllowed = (res: Reservation) => {
    if (res.status !== 'CONFIRMED' && res.status !== 'PENDING') return false;
    
    const today = new Date();
    const checkInDate = new Date(res.checkIn);
    const diffTime = checkInDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 2;
  };

  const handleCancelClick = (res: Reservation) => {
    setCancelRes(res);
  };

  const handleConfirmCancel = () => {
    if (!cancelRes) return;

    const allRes = mockDb.getReservations();
    const updated = allRes.map(r => {
      if (r.id === cancelRes.id) {
        return { 
          ...r, 
          status: 'CANCELLED' as const, 
          updatedAt: new Date().toISOString().split('T')[0] 
        };
      }
      return r;
    });

    mockDb.setReservations(updated);
    
    // Add notification
    const notifs = mockDb.getNotifications();
    notifs.push({
      id: `notif-${Date.now()}`,
      userId: currentUser!.id,
      message: `Votre réservation ${cancelRes.reservationNumber} a été annulée.`,
      read: false,
      type: 'WARNING',
      createdAt: new Date().toISOString(),
    });
    mockDb.setNotifications(notifs);

    setCancelRes(null);
    fetchClientData();
  };

  const handleReviewClick = (res: Reservation) => {
    setReviewRes(res);
    setRating(5);
    setComment('');
    setReviewError(null);
    setReviewSuccess(null);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);

    if (!comment.trim()) {
      setReviewError('Veuillez écrire un commentaire.');
      return;
    }

    if (!reviewRes || !currentUser) return;

    const room = getRoom(reviewRes.roomId);
    
    // Save review in mockDb
    const reviews = mockDb.getReviews();
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      roomId: reviewRes.roomId,
      roomName: room ? room.name : 'Chambre Teranga',
      rating,
      comment,
      approved: true, // Auto-approved for demo ease, editable in admin panel
      createdAt: new Date().toISOString().split('T')[0]
    };

    mockDb.setReviews([newReview, ...reviews]);
    setReviewSuccess('Votre avis a été publié avec succès. Merci !');
    
    setTimeout(() => {
      setReviewRes(null);
      fetchClientData();
    }, 1500);
  };

  const getStatusClass = (status: Reservation['status']) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'CHECKED_IN': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CHECKED_OUT': return 'bg-gray-50 text-gray-500 border-gray-250';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-400';
    }
  };

  const getStatusLabel = (status: Reservation['status']) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmée';
      case 'PENDING': return 'En Attente';
      case 'CHECKED_IN': return 'En Séjour';
      case 'CHECKED_OUT': return 'Terminée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  
  const upcomingRes = reservations.filter(r => r.status !== 'CANCELLED' && r.status !== 'CHECKED_OUT' && r.checkIn >= todayStr);
  const pastRes = reservations.filter(r => r.status === 'CANCELLED' || r.status === 'CHECKED_OUT' || r.checkIn < todayStr);

  const activeReservations = activeTab === 'UPCOMING' ? upcomingRes : pastRes;

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Tabs */}
      <div className="flex border-b border-teranga-gray-200">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`px-5 py-3 text-xs uppercase font-bold tracking-wider border-b-2 transition-all ${
            activeTab === 'UPCOMING' 
              ? 'border-teranga-gold-450 text-teranga-gold-700 font-bold' 
              : 'border-transparent text-teranga-gray-400 hover:text-teranga-gray-650'
          }`}
        >
          Séjours à venir ({upcomingRes.length})
        </button>
        <button
          onClick={() => setActiveTab('PAST')}
          className={`px-5 py-3 text-xs uppercase font-bold tracking-wider border-b-2 transition-all ${
            activeTab === 'PAST' 
              ? 'border-teranga-gold-450 text-teranga-gold-700 font-bold' 
              : 'border-transparent text-teranga-gray-400 hover:text-teranga-gray-650'
          }`}
        >
          Historique des séjours ({pastRes.length})
        </button>
      </div>

      {/* Grid listing */}
      {activeReservations.length === 0 ? (
        <div className="bg-white border border-teranga-gray-200 rounded-lg p-16 text-center shadow-sm">
          <Calendar className="w-12 h-12 text-teranga-gold-300 mx-auto mb-3" />
          <h3 className="font-serif text-sm font-bold text-teranga-green-800">Aucune réservation trouvée</h3>
          <p className="text-xs text-teranga-gray-400 font-light mt-1">
            {activeTab === 'UPCOMING' 
              ? "Vous n'avez pas de réservation programmée pour le moment." 
              : "Vous n'avez aucun séjour enregistré dans votre historique."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeReservations.map((res) => {
            const room = getRoom(res.roomId);
            const cancelable = isCancellationAllowed(res);
            const reviewable = res.status === 'CHECKED_OUT';

            return (
              <div 
                key={res.id} 
                className="bg-white border border-teranga-gray-200 rounded-lg overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow p-6 space-y-4"
              >
                
                {/* Header card metadata */}
                <div className="flex justify-between items-start gap-2 border-b border-teranga-gray-100 pb-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-wider text-teranga-gray-400 uppercase">
                      Réf: {res.reservationNumber}
                    </span>
                    <h3 className="font-serif text-sm font-bold text-teranga-green-800">
                      {room ? room.name : 'Chambre Teranga'}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase shrink-0 ${getStatusClass(res.status)}`}>
                    {getStatusLabel(res.status)}
                  </span>
                </div>

                {/* Grid details body */}
                <div className="grid grid-cols-2 gap-y-3.5 text-[11px] font-light text-teranga-gray-650">
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-teranga-gray-400 block">Date d'arrivée</span>
                    <strong className="text-xs font-semibold text-teranga-green-850 block mt-0.5">{res.checkIn}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-teranga-gray-400 block">Date de départ</span>
                    <strong className="text-xs font-semibold text-teranga-green-850 block mt-0.5">{res.checkOut}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-teranga-gray-400 block">Hôtes</span>
                    <span>{res.adults} adulte(s) {res.children > 0 ? `, ${res.children} enf.` : ''}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-teranga-gray-400 block">Prix payé</span>
                    <strong className="font-sans text-xs text-teranga-green-800 font-bold">
                      {res.totalPrice.toLocaleString()} F
                    </strong>
                  </div>
                </div>

                {/* Cancel or Review actions bar */}
                {(cancelable || reviewable) && (
                  <div className="pt-4 border-t border-teranga-gray-100 flex justify-end gap-2.5">
                    {cancelable && (
                      <button
                        onClick={() => handleCancelClick(res)}
                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-650 font-semibold text-[10px] px-3.5 py-1.5 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Annuler séjour</span>
                      </button>
                    )}
                    {reviewable && (
                      <button
                        onClick={() => handleReviewClick(res)}
                        className="flex items-center gap-1.5 bg-teranga-gold-50/50 hover:bg-teranga-gold-50 border border-teranga-gold-300 text-teranga-gold-700 font-semibold text-[10px] px-3.5 py-1.5 rounded transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-teranga-gold-650" />
                        <span>Laisser un avis</span>
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Confirm Cancel Reservation */}
      {cancelRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4 border border-teranga-gray-200 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-teranga-green-800">Confirmer l'annulation ?</h3>
            <p className="text-xs text-teranga-gray-500 font-light leading-relaxed">
              Êtes-vous sûr de vouloir annuler votre réservation <strong>{cancelRes.reservationNumber}</strong> pour le séjour du {cancelRes.checkIn} au {cancelRes.checkOut} ?
            </p>
            <div className="flex items-start gap-2 bg-amber-50 text-amber-700 p-3 rounded-md text-[10px] leading-relaxed">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Cette opération est irréversible. Les remboursements éventuels seront traités sous 7 jours.</span>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setCancelRes(null)}
                className="btn-outline-gold py-1.5 px-4 text-xs font-semibold"
              >
                Retour
              </button>
              <button 
                onClick={handleConfirmCancel}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-1.5 rounded transition-colors"
              >
                Confirmer l'annulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Write stay Review */}
      {reviewRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 border border-teranga-gray-200 shadow-2xl relative">
            <button 
              onClick={() => setReviewRes(null)}
              className="absolute top-4 right-4 text-teranga-gray-400 hover:text-teranga-gray-650"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-serif text-lg font-bold text-teranga-green-800">Donner votre avis</h3>
            <p className="text-xs text-teranga-gray-400 font-light">
              Partagez votre expérience sur votre séjour dans la chambre <strong>{getRoom(reviewRes.roomId)?.name}</strong>.
            </p>

            {reviewError && (
              <div className="bg-red-50 border border-red-200 text-red-650 p-2.5 rounded text-xs text-center font-light">
                {reviewError}
              </div>
            )}

            {reviewSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-2.5 rounded text-xs text-center font-semibold">
                {reviewSuccess}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              
              {/* Star selector */}
              <div className="flex flex-col gap-1.5 items-center">
                <span className="text-[10px] uppercase font-bold text-teranga-gray-500">Note de séjour</span>
                <div className="flex gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`w-7 h-7 cursor-pointer ${
                          star <= rating 
                            ? 'text-teranga-gold-450 fill-current' 
                            : 'text-teranga-gray-200'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Votre Commentaire</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Qu'avez-vous pensé de l'accueil, de la chambre, du restaurant ?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-teranga-gray-200 rounded-md p-3 text-xs focus:ring-1 focus:ring-teranga-gold-450 focus:outline-none bg-teranga-beige-50 font-light leading-relaxed"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 border-t border-teranga-gray-100 pt-4">
                <button 
                  type="button"
                  onClick={() => setReviewRes(null)}
                  className="btn-outline-gold py-1.5 px-4 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="bg-teranga-green-750 hover:bg-teranga-green-800 text-white font-semibold text-xs px-5 py-1.5 rounded shadow transition-colors"
                >
                  Publier l'avis
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
