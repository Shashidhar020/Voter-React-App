import { loginUser, getCurrentUser } from './auth.service.js';
import { AppError } from '../../shared/app-error.js';

export async function login(request, response) {
  const { email, password, company_id: companyId } = request.body;

  if (!email || !password || !companyId) {
    throw new AppError('Email, password, and company_id are required', 400);
  }

  const data = await loginUser({ email, password, companyId });
  return response.status(200).json({
    success: true,
    message: 'Login successful',
    data
  });
}


export async function getProfile(request, response) {
  const user = await getCurrentUser(request.user.id, request.user.company_id);

  return response.status(200).json({
    success: true,
    data: user
  });
}
