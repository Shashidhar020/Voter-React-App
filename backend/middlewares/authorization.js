import { AppError } from '../shared/app-error.js';

export function authorize(action, subject) {
  return function authorizationMiddleware(request, response, next) {
    if (!request.ability) {
      return next(new AppError('Authorization context is missing', 500));
    }
    if (!request.ability.can(action, subject)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    return next();
  };
}
