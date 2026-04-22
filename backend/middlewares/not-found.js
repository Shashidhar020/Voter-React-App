import { AppError } from '../shared/app-error.js';

export function notFound(request, response, next) {
  next(new AppError(`Route not found: ${request.originalUrl}`, 404));
}
