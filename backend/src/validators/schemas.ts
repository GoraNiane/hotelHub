import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Format de messagerie électronique invalide'),
  password: z.string().min(5, 'Le mot de passe doit contenir au moins 5 caractères'),
  phone: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email('Format de messagerie électronique invalide'),
  password: z.string().min(1, 'Le mot de passe est obligatoire'),
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().optional().nullable(),
});

export const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Le numéro de chambre est requis'),
  name: z.string().min(2, 'Le nom de la chambre est requis'),
  description: z.string().min(10, 'La description doit faire au moins 10 caractères'),
  pricePerNight: z.number().positive('Le prix par nuit doit être positif'),
  capacity: z.number().int().positive('La capacité doit être un entier positif'),
  size: z.number().int().positive('La superficie doit être un entier positif'),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE']).default('AVAILABLE'),
  roomTypeId: z.string().min(1, 'Le type de chambre est requis'),
  images: z.array(z.string().url()).optional(),
});

export const reservationSchema = z.object({
  roomId: z.string().uuid('Identifiant de chambre invalide'),
  checkIn: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Date d'arrivée invalide" }),
  checkOut: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Date de départ invalide' }),
  adults: z.number().int().positive('Le nombre d\'adultes doit être au moins de 1'),
  children: z.number().int().nonnegative('Le nombre d\'enfants doit être positif ou nul').default(0),
  promotionCode: z.string().optional().nullable(),
});

export const paymentSchema = z.object({
  reservationId: z.string().uuid('Identifiant de réservation invalide'),
  amount: z.number().positive('Le montant doit être positif'),
  paymentMethod: z.enum(['CASH', 'WAVE', 'ORANGE_MONEY', 'CARD']),
  transactionReference: z.string().optional().nullable(),
});

export const reviewSchema = z.object({
  roomName: z.string().min(1, 'Le nom de la chambre est requis'),
  rating: z.number().int().min(1).max(5, 'La note doit être comprise entre 1 et 5'),
  comment: z.string().min(5, 'Le commentaire doit contenir au moins 5 caractères'),
});

export const promotionSchema = z.object({
  code: z.string().min(3, 'Le code doit contenir au moins 3 caractères'),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive('La valeur de réduction doit être positive'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Date de début invalide' }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Date de fin invalide' }),
  maxUses: z.number().int().positive('Le nombre d\'utilisations max doit être un entier positif').default(100),
  active: z.boolean().default(true),
});

export const serviceSchema = z.object({
  name: z.string().min(2, 'Le nom de service doit contenir au moins 2 caractères'),
  description: z.string().min(5, 'La description doit contenir au moins 5 caractères'),
  price: z.number().nonnegative('Le prix doit être positif ou nul'),
  icon: z.string().min(1, "L'icône est requise"),
  active: z.boolean().default(true),
});
