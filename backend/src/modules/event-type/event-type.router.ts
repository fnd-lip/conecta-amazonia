import { Router } from 'express';
import { EventTypeController } from './event-type.controller';

const router = Router();

router.get('/', EventTypeController.list);

export default router;
