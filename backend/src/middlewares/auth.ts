import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../errors/customErrors';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_teranga_palace_2026_agent';

export interface UserPayload {
  id: string;
  email: string;
  role: 'CLIENT' | 'RECEPTIONIST' | 'ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError("Veuillez vous connecter pour accéder à cette ressource."));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return next(new UnauthorizedError('Session expirée ou invalide. Veuillez vous reconnecter.'));
  }
};

export const authorize = (...roles: Array<'CLIENT' | 'RECEPTIONIST' | 'ADMIN'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Non authentifié.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Accès refusé. Vous ne disposez pas des autorisations nécessaires.'));
    }

    next();
  };
};
