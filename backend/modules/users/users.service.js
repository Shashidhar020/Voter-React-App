import { findUserByIdAndCompany, findUsersByCompany } from '../../models/user.model.js';
import { AppError } from '../../shared/app-error.js';

export async function getUsersByCompany(companyId) {
  return findUsersByCompany(companyId);
}

export async function getUserById(userId, companyId) {
  const user = await findUserByIdAndCompany(userId, companyId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}
