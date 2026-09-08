import { Request, Response, NextFunction } from 'express';
import { RoomService } from '../services/roomService';

export class RoomController {
  static async getAllRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const rooms = await RoomService.getAllRooms(req.query);
      res.status(200).json({
        success: true,
        data: rooms,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRoomById(req: Request, res: Response, next: NextFunction) {
    try {
      const room = await RoomService.getRoomById(req.params.id);
      res.status(200).json({
        success: true,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const room = await RoomService.createRoom(req.body);
      res.status(201).json({
        success: true,
        message: 'Chambre créée avec succès.',
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const room = await RoomService.updateRoom(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Chambre modifiée avec succès.',
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RoomService.deleteRoom(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateRoomStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const room = await RoomService.updateRoomStatus(req.params.id, req.body.status);
      res.status(200).json({
        success: true,
        message: 'Statut de la chambre mis à jour.',
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAvailableRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const { checkIn, checkOut, guests, roomType } = req.query;
      if (!checkIn || !checkOut || !guests) {
        return res.status(400).json({
          success: false,
          message: 'Les paramètres checkIn, checkOut et guests sont requis.',
        });
      }
      const availableRooms = await RoomService.getAvailableRooms(
        checkIn as string,
        checkOut as string,
        parseInt(guests as string),
        roomType as string
      );
      res.status(200).json({
        success: true,
        data: availableRooms,
      });
    } catch (error) {
      next(error);
    }
  }
}
