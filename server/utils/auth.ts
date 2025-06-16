import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../database';
import type { JwtPayload, TokenValidationResult, User } from '~/types/auth';
import { createAuthenticationError, createAuthorizationError } from './errorHandler';
import Logger from './logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export async function validateToken(token: string): Promise<TokenValidationResult> {
  try {
    const payload = verifyToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return {
        valid: false,
        error: 'User not found',
      };
    }

    return {
      valid: true,
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    Logger.error('Token validation failed', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid token',
    };
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

export async function requireAuth(event: any): Promise<User> {
  const authHeader = getHeader(event, 'authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    throw createAuthenticationError('Authorization token required');
  }

  const validation = await validateToken(token);
  
  if (!validation.valid || !validation.user) {
    throw createAuthenticationError('Invalid or expired token');
  }

  return validation.user;
}

export async function optionalAuth(event: any): Promise<User | null> {
  try {
    return await requireAuth(event);
  } catch {
    return null;
  }
}

export function getTokenExpiration(): number {
  const expiresIn = JWT_EXPIRES_IN;
  
  if (typeof expiresIn === 'string') {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        return 24 * 60 * 60; // Default to 24 hours
    }
  }
  
  return typeof expiresIn === 'number' ? expiresIn : 24 * 60 * 60;
}