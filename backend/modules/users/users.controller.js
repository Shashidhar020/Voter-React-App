import { getUserById, getUsersByCompany } from './users.service.js';

export async function getUsers(request, response) {
  const users = await getUsersByCompany(request.user.company_id);

  return response.status(200).json({
    success: true,
    data: users
  });
}

export async function getUser(request, response) {
  const user = await getUserById(request.params.id, request.user.company_id);

  return response.status(200).json({
    success: true,
    data: user
  });
}
