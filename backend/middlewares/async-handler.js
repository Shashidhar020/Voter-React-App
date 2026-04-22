export function asyncHandler(controller) {
  return async function wrappedController(request, response, next) {
    try {
      await controller(request, response, next);
    } catch (error) {
      next(error);
    }
  };
}
