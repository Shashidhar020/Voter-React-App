import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { userRoutes } from '../modules/users/users.routes.js';
import { companyRoutes } from '../modules/company/company.routes.js';
import { salesRoutes } from '../modules/sales/sales.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/company', companyRoutes);
apiRouter.use('/sales', salesRoutes);

export { apiRouter };
