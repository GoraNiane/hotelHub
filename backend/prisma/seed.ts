import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const getDateDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const getDateDaysAhead = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

async function main() {
  console.log('Starting seeding database...');

  // 1. Clear database
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.roomImage.deleteMany();
  await prisma.room.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.hotel.deleteMany();

  // 2. Create Hotel
  const hotel = await prisma.hotel.create({
    data: {
      name: 'TERANGA PALACE HOTEL',
      description: 'Découvrez une expérience unique au cœur de Dakar, entre confort, élégance et hospitalité sénégalaise. Notre hôtel 4 étoiles vous accueille dans un cadre luxueux aux Almadies.',
      address: 'Route des Almadies, Dakar, Sénégal',
      phone: '+221 33 869 00 00',
      email: 'contact@terangapalace.com',
      stars: 4,
    },
  });
  console.log(`Created hotel: ${hotel.name}`);

  // 3. Create Users
  const salt = bcrypt.genSaltSync(10);
  const adminPassword = bcrypt.hashSync('admin', salt);
  const receptionPassword = bcrypt.hashSync('reception', salt);
  const clientPassword = bcrypt.hashSync('client', salt);

  const admin = await prisma.user.create({
    data: {
      firstName: 'Goran',
      lastName: 'Diop',
      email: 'admin@terangapalace.com',
      password: adminPassword,
      phone: '+221 77 123 45 67',
      role: 'ADMIN',
      enabled: true,
    },
  });

  const receptionist = await prisma.user.create({
    data: {
      firstName: 'Fatou',
      lastName: 'Sow',
      email: 'reception@terangapalace.com',
      password: receptionPassword,
      phone: '+221 77 765 43 21',
      role: 'RECEPTIONIST',
      enabled: true,
    },
  });

  const client = await prisma.user.create({
    data: {
      firstName: 'Amadou',
      lastName: 'Diallo',
      email: 'client@gmail.com',
      password: clientPassword,
      phone: '+221 76 543 21 09',
      role: 'CLIENT',
      enabled: true,
    },
  });

  console.log('Created admin, receptionist and client accounts.');

  // 4. Create Room Types
  const standardType = await prisma.roomType.create({
    data: {
      name: 'STANDARD',
      description: "Une chambre élégante et confortable, idéale pour les voyageurs d'affaires ou les couples. Équipée d'un lit queen size, d'un bureau de travail et d'un balcon donnant sur le jardin.",
      price: 55000,
      capacity: 2,
      size: 28,
    },
  });

  const deluxeType = await prisma.roomType.create({
    data: {
      name: 'DELUXE',
      description: "Plus spacieuse, la chambre Deluxe offre un cadre raffiné avec un lit king size, un coin salon et une salle de bain en marbre. Vue panoramique sur la ville de Dakar.",
      price: 85000,
      capacity: 2,
      size: 38,
    },
  });

  const suiteType = await prisma.roomType.create({
    data: {
      name: 'SUITE',
      description: "Le summum du luxe. Suite comprenant un salon séparé, une chambre parentale somptueuse, un jacuzzi privé et une terrasse avec vue imprenable sur l'Océan Atlantique.",
      price: 150000,
      capacity: 3,
      size: 65,
    },
  });

  const familyType = await prisma.roomType.create({
    data: {
      name: 'FAMILY',
      description: "Parfaite pour les séjours en famille. Composée de deux chambres communicantes, d'un espace de vie convivial et de toutes les commodités pour les enfants.",
      price: 120000,
      capacity: 4,
      size: 55,
    },
  });

  console.log('Created RoomTypes.');

  // 5. Create 20 Rooms (5 per type)
  const roomTypesData = [
    { type: standardType, prefix: '10', images: ['https://images.unsplash.com/photo-1611891405222-463624afb559?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'] },
    { type: deluxeType, prefix: '20', images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'] },
    { type: suiteType, prefix: '30', images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80'] },
    { type: familyType, prefix: '40', images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'] },
  ];

  const rooms: any[] = [];

  for (const { type, prefix, images } of roomTypesData) {
    for (let r = 1; r <= 5; r++) {
      const roomNum = `${prefix}${r}`;
      let status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' = 'AVAILABLE';
      if (r === 2 && prefix === '10') status = 'OCCUPIED';
      if (r === 4 && prefix === '20') status = 'CLEANING';
      if (r === 5 && prefix === '30') status = 'MAINTENANCE';

      const room = await prisma.room.create({
        data: {
          roomNumber: roomNum,
          name: `Chambre ${type.name.charAt(0) + type.name.slice(1).toLowerCase()} ${roomNum}`,
          description: type.description,
          pricePerNight: type.price,
          capacity: type.capacity,
          size: type.size + (r % 3),
          status: status,
          roomTypeId: type.id,
        },
      });

      // Create Room Images
      for (const url of images) {
        await prisma.roomImage.create({
          data: {
            url: url,
            roomId: room.id,
          },
        });
      }

      rooms.push(room);
    }
  }

  console.log('Created 20 rooms and images.');

  // 6. Create Services
  const services = [
    { name: 'Wi-Fi haut débit', description: "Accès internet sans fil illimité dans tout l'établissement.", price: 0, icon: 'Wifi' },
    { name: 'Piscine chauffée', description: 'Accès libre à notre piscine extérieure chauffée avec transats.', price: 0, icon: 'Droplet' },
    { name: 'Parking sécurisé', description: 'Parking souterrain surveillé 24h/24 et service de voiturier.', price: 0, icon: 'ParkingCircle' },
    { name: 'Restaurant Teranga', description: 'Petit-déjeuner buffet, spécialités sénégalaises et internationales.', price: 12000, icon: 'Utensils' },
    { name: 'Navette Aéroport', description: "Service de transfert depuis et vers l'aéroport Blaise Diagne (DSS).", price: 25000, icon: 'Car' },
    { name: 'Spa & Centre de Bien-être', description: 'Massages relaxants, hammam et soins du corps.', price: 35000, icon: 'Compass' },
    { name: 'Service de blanchisserie', description: 'Lavage et repassage de vos vêtements dans la journée.', price: 8000, icon: 'Shirt' },
    { name: 'Salle de réunion', description: 'Espace équipé pour vos séminaires et événements professionnels.', price: 100000, icon: 'Briefcase' },
  ];

  for (const s of services) {
    await prisma.service.create({ data: s });
  }
  console.log('Created services.');

  // 7. Create Promotions
  const promo1 = await prisma.promotion.create({
    data: {
      code: 'TERANGA10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      startDate: getDateDaysAgo(5),
      endDate: getDateDaysAhead(60),
      maxUses: 100,
      currentUses: 15,
      active: true,
    },
  });

  const promo2 = await prisma.promotion.create({
    data: {
      code: 'INAUGUR20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      startDate: getDateDaysAgo(2),
      endDate: getDateDaysAhead(15),
      maxUses: 50,
      currentUses: 8,
      active: true,
    },
  });

  await prisma.promotion.create({
    data: {
      code: 'DAKARFREE',
      discountType: 'FIXED',
      discountValue: 15000,
      startDate: getDateDaysAgo(10),
      endDate: getDateDaysAhead(45),
      maxUses: 200,
      currentUses: 45,
      active: true,
    },
  });
  console.log('Created promotions.');

  // 8. Create Reservations and Payments
  // Reservation 1: Checked In (Current stay)
  const res1 = await prisma.reservation.create({
    data: {
      reservationNumber: 'TPH-78392-DAK',
      userId: client.id,
      roomId: rooms.find((r) => r.roomNumber === '201').id,
      checkIn: getDateDaysAgo(3),
      checkOut: getDateDaysAhead(2),
      adults: 2,
      children: 0,
      numberOfNights: 5,
      totalPrice: 425000,
      status: 'CHECKED_IN',
      createdAt: getDateDaysAgo(10),
    },
  });

  await prisma.payment.create({
    data: {
      reservationId: res1.id,
      amount: 425000,
      paymentMethod: 'CARD',
      status: 'PAID',
      transactionReference: 'TX-83921049',
      paidAt: getDateDaysAgo(10),
    },
  });

  // Reservation 2: Checked Out (Past stay)
  const res2 = await prisma.reservation.create({
    data: {
      reservationNumber: 'TPH-10492-DAK',
      userId: client.id,
      roomId: rooms.find((r) => r.roomNumber === '301').id,
      checkIn: getDateDaysAgo(12),
      checkOut: getDateDaysAgo(8),
      adults: 2,
      children: 1,
      numberOfNights: 4,
      totalPrice: 600000,
      status: 'CHECKED_OUT',
      createdAt: getDateDaysAgo(20),
    },
  });

  await prisma.payment.create({
    data: {
      reservationId: res2.id,
      amount: 600000,
      paymentMethod: 'ORANGE_MONEY',
      status: 'PAID',
      transactionReference: 'TX-90192837',
      paidAt: getDateDaysAgo(20),
    },
  });

  // Reservation 3: Confirmed (Future stay)
  const res3 = await prisma.reservation.create({
    data: {
      reservationNumber: 'TPH-90182-DAK',
      userId: client.id,
      roomId: rooms.find((r) => r.roomNumber === '101').id,
      checkIn: getDateDaysAhead(10),
      checkOut: getDateDaysAhead(14),
      adults: 1,
      children: 0,
      numberOfNights: 4,
      totalPrice: 220000,
      status: 'CONFIRMED',
      createdAt: getDateDaysAgo(2),
    },
  });

  await prisma.payment.create({
    data: {
      reservationId: res3.id,
      amount: 220000,
      paymentMethod: 'WAVE',
      status: 'PAID',
      transactionReference: 'TX-29381029',
      paidAt: getDateDaysAgo(2),
    },
  });

  // Reservation 4: Past stay
  const res4 = await prisma.reservation.create({
    data: {
      reservationNumber: 'TPH-30219-DAK',
      userId: client.id,
      roomId: rooms.find((r) => r.roomNumber === '401').id,
      checkIn: getDateDaysAgo(18),
      checkOut: getDateDaysAgo(15),
      adults: 2,
      children: 2,
      numberOfNights: 3,
      totalPrice: 360000,
      status: 'CHECKED_OUT',
      createdAt: getDateDaysAgo(25),
    },
  });

  await prisma.payment.create({
    data: {
      reservationId: res4.id,
      amount: 360000,
      paymentMethod: 'CASH',
      status: 'PAID',
      transactionReference: 'TX-CASH-39201',
      paidAt: getDateDaysAgo(15),
    },
  });

  console.log('Created reservations and payments.');

  // 9. Create Reviews
  await prisma.review.create({
    data: {
      userId: client.id,
      roomName: 'Chambre Deluxe 201',
      rating: 5,
      comment: "Un séjour exceptionnel ! Le personnel est d'une gentillesse incroyable. La Téranga sénégalaise est palpable à chaque instant. La vue sur mer depuis la chambre Deluxe est magnifique.",
      approved: true,
      createdAt: getDateDaysAgo(5),
    },
  });

  await prisma.review.create({
    data: {
      userId: client.id,
      roomName: 'Suite Premium 301',
      rating: 5,
      comment: "La Suite Premium vaut vraiment le détour. Le jacuzzi privé sur la terrasse avec vue sur Dakar au coucher du soleil est inoubliable. Service impeccable et petit-déjeuner très copieux.",
      approved: true,
      createdAt: getDateDaysAgo(12),
    },
  });

  console.log('Created reviews.');

  // 10. Create Notifications
  await prisma.notification.create({
    data: {
      userId: client.id,
      message: 'Votre réservation TPH-90182-DAK a été confirmée avec succès.',
      read: false,
      type: 'SUCCESS',
      createdAt: getDateDaysAgo(2),
    },
  });

  await prisma.notification.create({
    data: {
      userId: client.id,
      message: 'Bienvenue au Teranga Palace Hotel. Votre enregistrement a été effectué (Chambre Deluxe 201).',
      read: true,
      type: 'INFO',
      createdAt: getDateDaysAgo(3),
    },
  });

  console.log('Created notifications.');
  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
