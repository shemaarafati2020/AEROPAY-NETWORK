import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UserRole } from '../types/index.js';
import { usersStore } from '../models/store.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For demo/dev fallback: allow x-user-id header or default to user_shema
    const demoUserId = req.headers['x-user-id'] as string;
    if (demoUserId) {
      const found = usersStore.find((u) => u.id === demoUserId);
      if (found) {
        req.user = { id: found.id, email: found.email, role: found.role };
        return next();
      }
    }
    res.status(401).json({ error: 'Unauthorized. Bearer token or valid x-user-id required.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      email: string;
      role: UserRole;
    };
    req.user = decoded;
    next();
  } catch (_err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden. Level 4 Root Admin authority required.' });
    return;
  }
  next();
};
