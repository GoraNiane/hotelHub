import prisma from '../config/db';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../errors/customErrors';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_teranga_palace_2026_agent';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '24h') as any;

export class AuthService {
  static async register(data: any) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestError('Cet email est déjà associé à un compte.');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(data.password, salt);

    const newUser = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        password: passwordHash,
        phone: data.phone || null,
        role: 'CLIENT',
        enabled: true,
      },
    });

    return {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
    };
  }

  static async login(data: any) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError('Identifiants incorrects.');
    }

    if (!user.enabled) {
      throw new UnauthorizedError("Votre compte a été désactivé par l'administrateur.");
    }

    const isMatch = bcrypt.compareSync(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Identifiants incorrects.');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        enabled: user.enabled,
        createdAt: user.createdAt,
      },
    };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        enabled: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Utilisateur non trouvé.');
    }

    return user;
  }

  static async updateProfile(userId: string, data: any) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        enabled: true,
        createdAt: true,
      },
    });

    return user;
  }
}
