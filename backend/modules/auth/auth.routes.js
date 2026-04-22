import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.js';
import { getProfile, login } from './auth.controller.js';
import { verifyJwt } from './auth.middleware.js';

const authRoutes = Router();

authRoutes.post('/login', asyncHandler(login));
authRoutes.get('/me', verifyJwt, asyncHandler(getProfile));

export { authRoutes };
