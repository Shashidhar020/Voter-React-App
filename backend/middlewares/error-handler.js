export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;

  return response.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error'
  });
}
