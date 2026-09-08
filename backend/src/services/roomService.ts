import prisma from '../config/db';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/customErrors';

export class RoomService {
  static async checkAvailability(roomId: string, checkIn: Date, checkOut: Date, excludeResId?: string): Promise<boolean> {
    if (checkOut <= checkIn) {
      throw new BadRequestError("La date de départ doit être supérieure à la date d'arrivée.");
    }

    const overlappingReservations = await prisma.reservation.findMany({
      where: {
        roomId: roomId,
        id: excludeResId ? { not: excludeResId } : undefined,
        status: { notIn: ['CANCELLED', 'CHECKED_OUT'] },
        AND: [
          { checkIn: { lt: checkOut } },
          { checkOut: { gt: checkIn } },
        ],
      },
    });

    return overlappingReservations.length === 0;
  }

  static async getAvailableRooms(checkInStr: string, checkOutStr: string, guests: number, roomType?: string) {
    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new BadRequestError('Dates invalides.');
    }

    // Get all rooms that match the capacity and type
    const rooms = await prisma.room.findMany({
      where: {
        capacity: { gte: guests },
        roomType: roomType ? { name: roomType } : undefined,
        status: { not: 'MAINTENANCE' },
      },
      include: {
        roomType: true,
        images: true,
      },
    });

    // Filter rooms by checking availability
    const availableRooms: any[] = [];
    for (const room of rooms) {
      const isAvailable = await this.checkAvailability(room.id, checkIn, checkOut);
      if (isAvailable) {
        availableRooms.push(room);
      }
    }

    return availableRooms;
  }

  static async getAllRooms(filters: any = {}) {
    const where: any = {};

    if (filters.roomType && filters.roomType !== 'ALL') {
      where.roomType = { name: filters.roomType };
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.capacity) {
      where.capacity = { gte: parseInt(filters.capacity) };
    }
    if (filters.maxPrice) {
      where.pricePerNight = { lte: parseFloat(filters.maxPrice) };
    }
    if (filters.minSize) {
      where.size = { gte: parseInt(filters.minSize) };
    }

    return prisma.room.findMany({
      where,
      include: {
        roomType: true,
        images: true,
      },
      orderBy: {
        roomNumber: 'asc',
      },
    });
  }

  static async getRoomById(roomId: string) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        roomType: true,
        images: true,
      },
    });

    if (!room) {
      throw new NotFoundError('Chambre non trouvée.');
    }

    return room;
  }

  static async createRoom(data: any) {
    // Check if room number is unique
    const existing = await prisma.room.findUnique({
      where: { roomNumber: data.roomNumber },
    });

    if (existing) {
      throw new ConflictError(`Une chambre avec le numéro ${data.roomNumber} existe déjà.`);
    }

    const room = await prisma.room.create({
      data: {
        roomNumber: data.roomNumber,
        name: data.name,
        description: data.description,
        pricePerNight: data.pricePerNight,
        capacity: data.capacity,
        size: data.size,
        status: data.status || 'AVAILABLE',
        roomTypeId: data.roomTypeId,
      },
    });

    if (data.images && data.images.length > 0) {
      const imageData = data.images.map((url: string) => ({
        url,
        roomId: room.id,
      }));
      await prisma.roomImage.createMany({
        data: imageData,
      });
    }

    return this.getRoomById(room.id);
  }

  static async updateRoom(roomId: string, data: any) {
    const existingRoom = await this.getRoomById(roomId);

    if (data.roomNumber && data.roomNumber !== existingRoom.roomNumber) {
      const conflict = await prisma.room.findUnique({
        where: { roomNumber: data.roomNumber },
      });
      if (conflict) {
        throw new ConflictError(`Une chambre avec le numéro ${data.roomNumber} existe déjà.`);
      }
    }

    await prisma.room.update({
      where: { id: roomId },
      data: {
        roomNumber: data.roomNumber,
        name: data.name,
        description: data.description,
        pricePerNight: data.pricePerNight,
        capacity: data.capacity,
        size: data.size,
        status: data.status,
        roomTypeId: data.roomTypeId,
      },
    });

    if (data.images) {
      // Re-create images
      await prisma.roomImage.deleteMany({ where: { roomId } });
      if (data.images.length > 0) {
        const imageData = data.images.map((url: string) => ({
          url,
          roomId,
        }));
        await prisma.roomImage.createMany({
          data: imageData,
        });
      }
    }

    return this.getRoomById(roomId);
  }

  static async deleteRoom(roomId: string) {
    await this.getRoomById(roomId);
    await prisma.roomImage.deleteMany({ where: { roomId } });
    await prisma.room.delete({ where: { id: roomId } });
    return { success: true, message: 'Chambre supprimée avec succès.' };
  }

  static async updateRoomStatus(roomId: string, status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE') {
    await this.getRoomById(roomId);
    return prisma.room.update({
      where: { id: roomId },
      data: { status },
      include: { roomType: true },
    });
  }
}
