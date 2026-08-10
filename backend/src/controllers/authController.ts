import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { usersStore } from '../models/store.js';
import { config } from '../config/index.js';
import { AuditService } from '../services/auditService.js';

export class AuthController {
  public static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ error: 'Account suspended. Contact supervisor support.' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, {
      expiresIn: '7d',
    });

    AuditService.log('USER_LOGIN', `User ${user.name} logged in via REST API`, user.email, req.ip);

    res.json({
      token,
      user,
    });
  }

  public static async signup(req: Request, res: Response): Promise<void> {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      res.status(400).json({ error: 'Name, email, phone, and password are required' });
      return;
    }

    const existing = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'user' as const,
      status: 'active' as const,
      kycTier: 'Tier 1 (Basic)' as const,
      balanceUsd: 0,
      balanceRwf: 0,
      balanceKes: 0,
      virtualCardActive: false,
      avatarColor: '#A51C24',
      totalTransferredUsd: 0,
      joinedAt: new Date().toISOString(),
    };

    usersStore.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    AuditService.log(
      'USER_SIGNUP',
      `New user registered: ${newUser.name} (${newUser.email})`,
      newUser.email,
      req.ip
    );

    res.status(201).json({
      token,
      user: newUser,
    });
  }

  public static async demoLogin(req: Request, res: Response): Promise<void> {
    const { role } = req.body;
    const target = usersStore.find((u) => u.role === (role === 'admin' ? 'admin' : 'user'));
    if (!target) {
      res.status(404).json({ error: 'Demo user not found' });
      return;
    }

    const token = jwt.sign(
      { id: target.id, email: target.email, role: target.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: target,
    });
  }
}
