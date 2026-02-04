import { Router } from 'express';
import eventRouter from '../modules/event/event.router';
import authRouter from '../modules/auth/auth.router';
import adminRouter from '../modules/admin/admin.router';
import assistantRouter from '../modules/assistant/assistant.router';
import eventTypeRouter from '../modules/event-type/event-type.router';
import ticketLotRouter from '../modules/ticket-lot/ticket-lot.router';
import { usersRouter } from '../modules/users/users.router';
import orderRouter from '../modules/order/order.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/events', eventRouter);
router.use('/event-types', eventTypeRouter);
router.use('/event-ticket-lot', ticketLotRouter);
router.use('/orders', orderRouter);
router.use('/admin', adminRouter);
router.use('/assistant', assistantRouter);

export default router;
