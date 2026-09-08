import React, { createContext, useState, useContext, useEffect } from 'react';
import { Room, Reservation, Payment, Promotion, PaymentMethod } from '../types/types';
import api from '../services/api';
import { mockDb } from '../services/mockDb';
import { useAuth } from './AuthContext';

interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
}

interface BookingContextType {
  step: number;
  setStep: (step: number) => void;
  selectedRoom: Room | null;
  setSelectedRoom: (room: Room | null) => void;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestInfo: GuestInfo;
  setGuestInfo: (info: GuestInfo) => void;
  promotion: Promotion | null;
  promotionError: string | null;
  setBookingDates: (checkIn: string, checkOut: string, adults: number, children: number) => void;
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;
  calculateNights: () => number;
  calculateBasePrice: () => number;
  calculateDiscount: () => number;
  calculateTotalPrice: () => number;
  submitBooking: (paymentMethod: PaymentMethod) => Promise<{ success: boolean; reservation?: Reservation; error?: string }>;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const initialGuestInfo: GuestInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: 'Sénégal',
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children: reactChildren }) => {
  const { currentUser } = useAuth();
  
  const [step, setStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  // Set default dates: checkIn tomorrow, checkOut in 3 days
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  
  const getInThreeDays = () => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(getTomorrow());
  const [checkOut, setCheckOut] = useState(getInThreeDays());
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  
  const [guestInfo, setGuestInfoState] = useState<GuestInfo>(initialGuestInfo);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [promotionError, setPromotionError] = useState<string | null>(null);

  // Sync client profile details to guest info when authenticated
  useEffect(() => {
    if (currentUser && currentUser.role === 'CLIENT') {
      setGuestInfoState({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone || '',
        country: 'Sénégal',
      });
    } else {
      setGuestInfoState(initialGuestInfo);
    }
  }, [currentUser]);

  const setBookingDates = (ci: string, co: string, ad: number, ch: number) => {
    setCheckIn(ci);
    setCheckOut(co);
    setAdults(ad);
    setChildren(ch);
  };

  const setGuestInfo = (info: GuestInfo) => {
    setGuestInfoState(info);
  };

  const applyPromoCode = async (code: string): Promise<boolean> => {
    setPromotionError(null);
    try {
      const response = await api.get(`/api/promotions/validate/${code}`);
      if (response.data && response.data.success) {
        setPromotion(response.data.data);
        return true;
      } else {
        setPromotionError(response.data.message || 'Code promotionnel invalide.');
        setPromotion(null);
        return false;
      }
    } catch (error: any) {
      setPromotionError(error.message || 'Code promotionnel invalide ou expiré.');
      setPromotion(null);
      return false;
    }
  };

  const removePromoCode = () => {
    setPromotion(null);
    setPromotionError(null);
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const calculateBasePrice = () => {
    if (!selectedRoom) return 0;
    return selectedRoom.pricePerNight * calculateNights();
  };

  const calculateDiscount = () => {
    if (!promotion) return 0;
    const base = calculateBasePrice();
    if (promotion.discountType === 'PERCENTAGE') {
      return (base * promotion.discountValue) / 100;
    } else {
      return Math.min(promotion.discountValue, base);
    }
  };

  const calculateTotalPrice = () => {
    return Math.max(0, calculateBasePrice() - calculateDiscount());
  };

  const submitBooking = async (paymentMethod: PaymentMethod) => {
    if (!selectedRoom) return { success: false, error: 'Aucune chambre sélectionnée.' };
    
    try {
      // 1. Submit reservation details to backend
      const reservationResponse = await api.post('/api/reservations', {
        roomId: selectedRoom.id,
        checkInStr: checkIn,
        checkOutStr: checkOut,
        adults,
        children,
        promotionCode: promotion?.code || null,
        
        // Pass guest info to handle staff bookings or client creation
        firstName: guestInfo.firstName,
        lastName: guestInfo.lastName,
        email: guestInfo.email,
        phone: guestInfo.phone,
      });

      if (!reservationResponse.data || !reservationResponse.data.success) {
        return { success: false, error: reservationResponse.data.message || 'Erreur lors de la réservation.' };
      }

      const reservation: Reservation = reservationResponse.data.data;

      // 2. Process simulation payment
      const paymentResponse = await api.post('/api/payments', {
        reservationId: reservation.id,
        amount: calculateTotalPrice(),
        paymentMethod,
      });

      if (!paymentResponse.data || !paymentResponse.data.success) {
        return { 
          success: true, 
          reservation, 
          error: 'Réservation enregistrée mais le paiement a échoué. Veuillez contacter la réception.' 
        };
      }

      // Add payments list to the returned reservation so frontend can show paid status
      const updatedReservation: Reservation = {
        ...reservation,
        status: 'CONFIRMED',
        payments: [paymentResponse.data.data]
      };

      // Refresh database cache with new booking and payment
      await mockDb.init();

      return { success: true, reservation: updatedReservation };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Le serveur a refusé la réservation. Veuillez vérifier vos dates.' 
      };
    }
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedRoom(null);
    setCheckIn(getTomorrow());
    setCheckOut(getInThreeDays());
    setAdults(1);
    setChildren(0);
    setPromotion(null);
    setPromotionError(null);
    if (currentUser && currentUser.role === 'CLIENT') {
      setGuestInfoState({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone || '',
        country: 'Sénégal',
      });
    } else {
      setGuestInfoState(initialGuestInfo);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        step,
        setStep,
        selectedRoom,
        setSelectedRoom,
        checkIn,
        checkOut,
        adults,
        children,
        guestInfo,
        setGuestInfo,
        promotion,
        promotionError,
        setBookingDates,
        applyPromoCode,
        removePromoCode,
        calculateNights,
        calculateBasePrice,
        calculateDiscount,
        calculateTotalPrice,
        submitBooking,
        resetBooking,
      }}
    >
      {reactChildren}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
