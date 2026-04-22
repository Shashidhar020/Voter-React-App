import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.js';
import { authorize } from '../../middlewares/authorization.js';
import { verifyJwt } from '../auth/auth.middleware.js';
import { getUser, getUsers } from './users.controller.js';

const userRoutes = Router();

userRoutes.use(verifyJwt);
userRoutes.get('/', authorize('read', 'User'), asyncHandler(getUsers));
userRoutes.get('/:id', authorize('read', 'User'), asyncHandler(getUser));

export { userRoutes };
