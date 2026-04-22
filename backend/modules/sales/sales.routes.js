import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.js';
import { authorize } from '../../middlewares/authorization.js';
import { verifyApiKeyOrJwt } from '../auth/auth.middleware.js';
import { createSalesRecord, getSales } from './sales.controller.js';

const salesRoutes = Router();
salesRoutes.use(verifyApiKeyOrJwt);
salesRoutes.get('/', authorize('read', 'Sale'), asyncHandler(getSales));
salesRoutes.post('/', authorize('create', 'Sale'), asyncHandler(createSalesRecord));
export { salesRoutes };
