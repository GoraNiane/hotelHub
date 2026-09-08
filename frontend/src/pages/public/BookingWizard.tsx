import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, Calendar, Users, DoorOpen, ShieldCheck, CreditCard, Sparkles, Phone, Mail, Globe, MapPin, Printer } from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentMethod } from '../../types/types';

export const BookingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const {
    step,
    setStep,
    selectedRoom,
    checkIn,
    checkOut,
    adults,
    children,
    guestInfo,
    setGuestInfo,
    promotion,
    calculateNights,
    calculateBasePrice,
    calculateDiscount,
    calculateTotalPrice,
    submitBooking,
    resetBooking
  } = useBooking();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Payment input simulated states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [mobileMoneyPhone, setMobileMoneyPhone] = useState('');
  
  const [confirmedReservation, setConfirmedReservation] = useState<any>(null);

  // Check if room is selected
  if (!selectedRoom) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <DoorOpen className="w-16 h-16 text-teranga-gold-300 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-teranga-green-800">Aucune chambre sélectionnée</h2>
        <p className="text-sm text-teranga-gray-500 font-light max-w-sm mx-auto">
          Pour effectuer une réservation, veuillez d'abord sélectionner la chambre de votre choix dans notre catalogue.
        </p>
        <Link to="/rooms" className="inline-block btn-gold text-xs">
          Découvrir nos chambres
        </Link>
      </div>
    );
  }

  // Handle client details submission
  const handleClientDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4);
  };

  // Handle final simulated booking payment
  const handleConfirmBooking = async () => {
    setSubmitting(true);
    setErrorMessage(null);

    // Simulate small API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const res = await submitBooking(paymentMethod);
      if (res.success && res.reservation) {
        setConfirmedReservation(res.reservation);
        setStep(6); // Go to confirmation receipt step
      } else {
        setErrorMessage(res.error || 'Une erreur est survenue lors de l\'enregistrement.');
      }
    } catch (err) {
      setErrorMessage('Impossible de joindre le serveur de paiement. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStepClass = (s: number) => {
    if (step === s) return 'border-teranga-gold-450 text-teranga-gold-650 font-bold';
    if (step > s) return 'bg-teranga-gold-450 border-teranga-gold-450 text-white';
    return 'border-teranga-gray-200 text-teranga-gray-400';
  };

  const nights = calculateNights();
  const basePrice = calculateBasePrice();
  const discount = calculateDiscount();
  const total = calculateTotalPrice();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Wizard Steps Header (1 to 5 progress) */}
      {step < 6 && (
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto text-xs md:text-sm font-medium">
            
            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${getStepClass(3)}`}>
                {step > 3 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className={step === 3 ? 'text-teranga-green-800 font-semibold' : 'text-teranga-gray-400'}>Coordonnées</span>
            </div>
            
            <div className={`flex-1 h-0.5 mx-2 bg-teranga-gray-200 ${step > 3 ? 'bg-teranga-gold-450' : ''}`}></div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${getStepClass(4)}`}>
                {step > 4 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className={step === 4 ? 'text-teranga-green-800 font-semibold' : 'text-teranga-gray-400'}>Récapitulatif</span>
            </div>

            <div className={`flex-1 h-0.5 mx-2 bg-teranga-gray-200 ${step > 4 ? 'bg-teranga-gold-450' : ''}`}></div>

            {/* Step 5 */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${getStepClass(5)}`}>
                {step > 5 ? <Check className="w-4 h-4" /> : '3'}
              </div>
              <span className={step === 5 ? 'text-teranga-green-800 font-semibold' : 'text-teranga-gray-400'}>Paiement</span>
            </div>

          </div>
        </div>
      )}

      {/* Main wizard sections grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Step-specific Content panel (Left column) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 3: Client Guest Details Form */}
          {step === 3 && (
            <div className="bg-white border border-teranga-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
              <div className="border-b border-teranga-gray-150 pb-4 mb-6">
                <h2 className="font-serif text-xl font-bold text-teranga-green-800">1. Vos Informations Personnelles</h2>
                <p className="text-xs text-teranga-gray-400 font-light mt-1">
                  Veuillez remplir ces champs pour enregistrer la réservation à votre nom.
                </p>
              </div>

              {!isAuthenticated && (
                <div className="mb-6 p-4 bg-teranga-beige-100 border border-teranga-gold-200 rounded-md text-xs font-light text-teranga-gray-650 flex justify-between items-center">
                  <span>Vous avez déjà un compte ? Connectez-vous pour pré-remplir vos détails.</span>
                  <Link to="/login?redirect=/booking" className="text-teranga-gold-650 font-bold hover:underline">Connexion</Link>
                </div>
              )}

              <form onSubmit={handleClientDetailsSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Prénom</label>
                    <input 
                      type="text" 
                      required
                      value={guestInfo.firstName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                      className="input-field py-2 text-sm" 
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Nom de famille</label>
                    <input 
                      type="text" 
                      required
                      value={guestInfo.lastName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                      className="input-field py-2 text-sm" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Adresse e-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4.5 h-4.5 text-teranga-gray-350" />
                    <input 
                      type="email" 
                      required
                      value={guestInfo.email}
                      onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                      className="input-field py-2.5 pl-10 text-sm" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4.5 h-4.5 text-teranga-gray-350" />
                      <input 
                        type="tel" 
                        placeholder="+221 77..."
                        required
                        value={guestInfo.phone}
                        onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                        className="input-field py-2.5 pl-10 text-sm" 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Pays de résidence</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 w-4.5 h-4.5 text-teranga-gray-350" />
                      <input 
                        type="text" 
                        required
                        value={guestInfo.country}
                        onChange={(e) => setGuestInfo({ ...guestInfo, country: e.target.value })}
                        className="input-field py-2.5 pl-10 text-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-teranga-gray-100 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-teranga-gold-450 hover:bg-teranga-gold-500 text-white font-semibold text-xs tracking-wider uppercase px-6 py-3 rounded shadow transition-all"
                  >
                    Suivant : Récapitulatif
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: Review Summary Details */}
          {step === 4 && (
            <div className="bg-white border border-teranga-gray-200 rounded-lg p-6 md:p-8 shadow-sm space-y-6">
              <div className="border-b border-teranga-gray-150 pb-4">
                <h2 className="font-serif text-xl font-bold text-teranga-green-800">2. Récapitulatif de la Réservation</h2>
                <p className="text-xs text-teranga-gray-400 font-light mt-1">
                  Veuillez relire attentivement les détails avant de procéder au règlement.
                </p>
              </div>

              {/* Review segments */}
              <div className="space-y-4 text-xs font-light text-teranga-gray-650">
                <div className="bg-teranga-beige-100 p-4 rounded-lg border border-teranga-gray-200/50 space-y-3">
                  <h3 className="font-serif text-sm font-bold text-teranga-green-800">Hébergement</h3>
                  <div className="grid grid-cols-2 gap-y-2">
                    <span>Chambre sélectionnée :</span>
                    <strong className="text-teranga-green-800 font-bold">{selectedRoom.name}</strong>
                    <span>Dates de séjour :</span>
                    <strong className="font-semibold text-teranga-green-800">Du {checkIn} au {checkOut}</strong>
                    <span>Nombre de nuits :</span>
                    <strong className="font-semibold">{nights} nuit(s)</strong>
                    <span>Nombre de convives :</span>
                    <strong className="font-semibold">{adults} adulte(s) {children > 0 ? `et ${children} enfant(s)` : ''}</strong>
                  </div>
                </div>

                <div className="bg-teranga-beige-100 p-4 rounded-lg border border-teranga-gray-200/50 space-y-3">
                  <h3 className="font-serif text-sm font-bold text-teranga-green-800">Client titulaire</h3>
                  <div className="grid grid-cols-2 gap-y-2">
                    <span>Nom complet :</span>
                    <strong className="text-teranga-green-800 font-bold">{guestInfo.firstName} {guestInfo.lastName}</strong>
                    <span>Email :</span>
                    <strong className="font-semibold">{guestInfo.email}</strong>
                    <span>Téléphone :</span>
                    <strong className="font-semibold">{guestInfo.phone}</strong>
                    <span>Pays :</span>
                    <strong className="font-semibold">{guestInfo.country}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-teranga-gray-100 flex justify-between">
                <button 
                  onClick={() => setStep(3)}
                  className="btn-outline-gold py-2 px-5 text-xs"
                >
                  Modifier coordonnées
                </button>
                <button 
                  onClick={() => setStep(5)}
                  className="bg-teranga-gold-450 hover:bg-teranga-gold-500 text-white font-semibold text-xs tracking-wider uppercase px-6 py-3 rounded shadow transition-all"
                >
                  Suivant : Choisir le paiement
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Payment Gateway Simulation */}
          {step === 5 && (
            <div className="bg-white border border-teranga-gray-200 rounded-lg p-6 md:p-8 shadow-sm space-y-6">
              <div className="border-b border-teranga-gray-150 pb-4">
                <h2 className="font-serif text-xl font-bold text-teranga-green-800">3. Règlement de votre séjour</h2>
                <p className="text-xs text-teranga-gray-400 font-light mt-1">
                  Simulez votre transaction. Choisissez une méthode de paiement ci-dessous.
                </p>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md text-xs leading-relaxed font-light">
                  {errorMessage}
                </div>
              )}

              {/* Payment Tabs Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'CARD', label: 'Carte Bancaire', icon: CreditCard },
                  { id: 'WAVE', label: 'Wave', icon: Sparkles },
                  { id: 'ORANGE_MONEY', label: 'Orange Money', icon: Sparkles },
                  { id: 'CASH', label: 'Sur place (Cash)', icon: ShieldCheck },
                ].map((m) => {
                  const Icon = m.icon;
                  const selected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border text-xs font-semibold transition-all ${
                        selected
                          ? 'border-teranga-gold-450 bg-teranga-gold-50/50 text-teranga-gold-700 shadow-sm'
                          : 'border-teranga-gray-200 text-teranga-gray-500 hover:bg-teranga-beige-100/50'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-teranga-gold-650" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Payment form fields based on tab */}
              <div className="bg-teranga-beige-100/50 border border-teranga-gray-200 p-5 rounded-lg text-xs font-light text-teranga-gray-650">
                {paymentMethod === 'CARD' && (
                  <div className="space-y-4">
                    <h3 className="font-serif text-xs font-bold text-teranga-green-800">Détails de la Carte de Crédit (Simulés)</h3>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-teranga-gray-500">Numéro de carte</label>
                      <input 
                        type="text" 
                        placeholder="4000 1234 5678 9010"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        className="input-field py-2 bg-white text-sm" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-teranga-gray-500">Date d'expiration</label>
                        <input 
                          type="text" 
                          placeholder="MM/AA"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="input-field py-2 bg-white text-sm" 
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-teranga-gray-500">Code CVC</label>
                        <input 
                          type="password" 
                          placeholder="123"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="input-field py-2 bg-white text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(paymentMethod === 'WAVE' || paymentMethod === 'ORANGE_MONEY') && (
                  <div className="space-y-4">
                    <h3 className="font-serif text-xs font-bold text-teranga-green-800">Paiement Mobile Money (Simulé)</h3>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-teranga-gray-500">Numéro de téléphone mobile</label>
                      <input 
                        type="tel" 
                        placeholder="Ex: 77 123 45 67"
                        value={mobileMoneyPhone}
                        onChange={(e) => setMobileMoneyPhone(e.target.value)}
                        className="input-field py-2 bg-white text-sm" 
                      />
                    </div>
                    <p className="text-[10px] text-teranga-gray-400">
                      Un code PIN fictif vous sera demandé sur votre mobile pour valider la transaction de {total.toLocaleString()} FCFA.
                    </p>
                  </div>
                )}

                {paymentMethod === 'CASH' && (
                  <div className="space-y-2 leading-relaxed">
                    <h3 className="font-serif text-xs font-bold text-teranga-green-800">Règlement à l'arrivée</h3>
                    <p>
                      Vous choisisez de régler directement à l'accueil lors de votre arrivée (Check-in). 
                    </p>
                    <p>
                      Le statut de votre réservation sera enregistré comme <strong>En Attente (PENDING)</strong>. Veuillez noter que l'hôtel se réserve le droit d'annuler la réservation en cas de non-présentation après 18h le jour de l'arrivée sans notification préalable.
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Actions */}
              <div className="pt-6 border-t border-teranga-gray-100 flex justify-between items-center">
                <button 
                  onClick={() => setStep(4)}
                  disabled={submitting}
                  className="btn-outline-gold py-2 px-5 text-xs disabled:opacity-50"
                >
                  Retour
                </button>
                <button 
                  onClick={handleConfirmBooking}
                  disabled={submitting || (paymentMethod === 'CARD' && !cardNumber)}
                  className={`bg-teranga-green-750 hover:bg-teranga-green-800 text-white font-semibold text-xs tracking-wider uppercase px-6 py-3 rounded shadow transition-all flex items-center gap-2 ${
                    submitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Traitement...</span>
                    </>
                  ) : (
                    <span>Confirmer & Payer {total.toLocaleString()} F</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Luxury Receipt Bill Voucher (Reservation Confirmed) */}
          {step === 6 && confirmedReservation && (
            <div className="bg-white border-2 border-dashed border-teranga-gold-450 rounded-lg p-6 md:p-8 shadow-xl space-y-8 animate-fade-in relative">
              <div className="absolute top-6 right-6 no-print">
                <button 
                  onClick={() => window.print()}
                  className="text-teranga-gold-650 hover:text-teranga-gold-700 p-2 hover:bg-teranga-beige-100 rounded-full transition-colors"
                  title="Imprimer le reçu"
                >
                  <Printer className="w-5.5 h-5.5" />
                </button>
              </div>

              {/* Stamp success */}
              <div className="text-center space-y-3 pb-6 border-b border-teranga-gray-150">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-200">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="font-serif text-2xl font-extrabold text-teranga-green-800">Réservation Confirmée !</h2>
                <p className="text-xs text-teranga-gray-400 font-light">
                  Merci pour votre confiance. Votre séjour sous le signe de la Téranga est enregistré.
                </p>
              </div>

              {/* Receipt Body */}
              <div className="space-y-6 text-xs text-teranga-gray-650 font-light">
                
                {/* Reference tag */}
                <div className="flex justify-between items-center bg-teranga-beige-100 px-4 py-3 rounded border border-teranga-gray-200">
                  <span>Numéro de réservation :</span>
                  <strong className="text-sm font-mono tracking-wider text-teranga-green-850 font-bold">
                    {confirmedReservation.reservationNumber}
                  </strong>
                </div>

                {/* Details layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2.5">
                    <h3 className="font-serif text-xs font-bold text-teranga-green-800 border-b border-teranga-gray-100 pb-1">Détails du séjour</h3>
                    <div className="grid grid-cols-2 gap-y-1.5">
                      <span>Chambre :</span>
                      <strong className="font-semibold text-teranga-green-800">{selectedRoom.name}</strong>
                      <span>Dates :</span>
                      <strong className="font-semibold">Du {checkIn} au {checkOut}</strong>
                      <span>Durée :</span>
                      <span>{nights} nuit(s)</span>
                      <span>Hôtes :</span>
                      <span>{adults} adulte(s) {children > 0 ? `& ${children} enfant(s)` : ''}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <h3 className="font-serif text-xs font-bold text-teranga-green-800 border-b border-teranga-gray-100 pb-1">Client Titulaire</h3>
                    <div className="grid grid-cols-2 gap-y-1.5">
                      <span>Nom complet :</span>
                      <strong className="font-semibold text-teranga-green-800">{guestInfo.firstName} {guestInfo.lastName}</strong>
                      <span>Email :</span>
                      <span>{guestInfo.email}</span>
                      <span>Téléphone :</span>
                      <span>{guestInfo.phone}</span>
                      <span>Pays :</span>
                      <span>{guestInfo.country}</span>
                    </div>
                  </div>
                </div>

                {/* Billing Summary table */}
                <div className="border-t border-teranga-gray-150 pt-6">
                  <h3 className="font-serif text-xs font-bold text-teranga-green-800 mb-3">Facturation</h3>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-teranga-gray-200 pb-2 text-[10px] uppercase font-bold text-teranga-gray-400">
                        <th className="py-2">Description</th>
                        <th className="py-2 text-right">Tarif</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-teranga-gray-100">
                      <tr>
                        <td className="py-2.5">Hébergement ({nights} nuits à {selectedRoom.pricePerNight.toLocaleString()} F)</td>
                        <td className="py-2.5 text-right font-sans">{basePrice.toLocaleString()} F</td>
                      </tr>
                      {promotion && (
                        <tr className="text-green-600">
                          <td className="py-2.5">Code promo ({promotion.code})</td>
                          <td className="py-2.5 text-right font-sans">-{discount.toLocaleString()} F</td>
                        </tr>
                      )}
                      <tr className="font-bold text-sm text-teranga-green-800">
                        <td className="py-3">Montant Total Payé ({paymentMethod === 'CASH' ? 'À régler sur place' : 'Réglé'})</td>
                        <td className="py-3 text-right font-sans text-base text-teranga-green-850">
                          {total.toLocaleString()} FCFA
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Pay method descriptor */}
                <div className="flex justify-between text-[11px] text-teranga-gray-400 border-t border-teranga-gray-150 pt-4 font-light">
                  <span>Méthode de règlement : <strong className="text-teranga-gray-650">{paymentMethod}</strong></span>
                  <span>Statut du paiement : <strong className={paymentMethod === 'CASH' ? 'text-orange-500' : 'text-green-600'}>
                    {paymentMethod === 'CASH' ? 'PENDING' : 'PAID'}
                  </strong></span>
                </div>
              </div>

              {/* Print advice and actions */}
              <div className="pt-6 border-t border-teranga-gray-150 flex flex-wrap justify-between items-center gap-4 no-print">
                <button 
                  onClick={() => {
                    resetBooking();
                    navigate('/');
                  }}
                  className="btn-outline-gold text-xs"
                >
                  Retour à l'accueil
                </button>
                <div className="flex gap-2">
                  {isAuthenticated ? (
                    <Link to="/client/reservations" className="btn-green py-2 px-5 text-xs shadow-none">
                      Voir mes réservations
                    </Link>
                  ) : (
                    <Link to="/login" className="btn-green py-2 px-5 text-xs shadow-none">
                      Se connecter & voir mes réservations
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Selected Room Recap widget card (Right column) */}
        {step < 6 && (
          <div className="lg:col-span-1">
            <div className="bg-white border border-teranga-gray-200 rounded-lg p-5 shadow-sm space-y-4">
              <h3 className="font-serif text-sm font-bold text-teranga-green-800 border-b border-teranga-gray-100 pb-2.5">
                Détails du séjour
              </h3>
              
              {/* Image & name */}
              <div className="flex gap-3">
                <div className="w-16 h-12 bg-teranga-beige-100 rounded overflow-hidden shrink-0 border">
                  <img src={selectedRoom.images[0]} alt={selectedRoom.name} className="w-full h-full object-cover" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-serif text-xs font-bold text-teranga-green-800 truncate">{selectedRoom.name}</h4>
                  <span className="text-[10px] text-teranga-gray-400 font-sans">{selectedRoom.pricePerNight.toLocaleString()} F / nuit</span>
                </div>
              </div>

              {/* Date details */}
              <div className="space-y-2 text-xs font-light text-teranga-gray-650 border-y border-teranga-gray-100 py-3">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-teranga-gold-650" /> Séjour</span>
                  <span className="font-semibold text-right">{nights} nuit(s)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-teranga-gold-650" /> Voyageurs</span>
                  <span className="font-semibold text-right">{adults} ad. {children > 0 ? `, ${children} enf.` : ''}</span>
                </div>
                <div className="pt-2 text-[10px] text-teranga-gray-400 text-center">
                  Du {checkIn} au {checkOut}
                </div>
              </div>

              {/* Total Recap */}
              <div className="space-y-1.5 text-xs text-teranga-gray-650 font-light">
                <div className="flex justify-between">
                  <span>Hébergement</span>
                  <span className="font-semibold font-sans">{basePrice.toLocaleString()} F</span>
                </div>
                
                {promotion && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Réduction</span>
                    <span className="font-sans">-{discount.toLocaleString()} F</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center border-t border-teranga-gray-100 pt-2.5 text-sm">
                  <span className="font-bold text-teranga-green-800">Prix total</span>
                  <span className="font-sans font-black text-base text-teranga-green-850">
                    {total.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
