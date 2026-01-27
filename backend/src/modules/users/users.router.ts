import { Router } from 'express';
import { usersController } from './users.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const usersRouter = Router();

usersRouter.use(authMiddleware);

usersRouter.get('/me', usersController.me);
usersRouter.put('/', usersController.update);
usersRouter.delete('/', usersController.delete);

export { usersRouter };
