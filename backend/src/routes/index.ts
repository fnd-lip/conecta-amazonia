import { Router } from 'express';
import eventRouter from '../modules/event/event.router';
import authRouter from '../modules/auth/auth.router';
import adminRouter from '../modules/admin/admin.router';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use('/auth', authRouter);
router.use('/events', eventRouter);
router.use('/admin', adminRouter);

export default router;
