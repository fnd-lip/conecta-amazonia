import { Router } from 'express';
import { AssistantController } from './assistant.controller';

const router = Router();

router.post('/ask', AssistantController.ask);
router.post('/stream', AssistantController.stream);

export default router;
