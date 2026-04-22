import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { findUserByEmailAndCompany, findUserByIdAndCompany } from '../../models/user.model.js';
import { AppError } from '../../shared/app-error.js';

export async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function generateAuthToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company_id: user.company_id
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export async function loginUser({ email, password, companyId }) {
  const user = await findUserByEmailAndCompany(email, companyId);

  if (!user) {
    throw new AppError('Invalid email, password, or company ID', 401);
  }

  const isPasswordValid = await verifyPassword(password, user.password_hash);

  if (!isPasswordValid) {
    throw new AppError('Invalid email, password, or company ID', 401);
  }

  const token = generateAuthToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company_id: user.company_id
    }
  };
}

export async function getCurrentUser(userId, companyId) {
  const user = await findUserByIdAndCompany(userId, companyId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}
