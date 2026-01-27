import { Router } from 'express';

import AuthController from './auth.controller';
import AuthService from './auth.service';
import AuthRepository from './auth.repository';
import { MailService } from '../../services/mail.service';

const router = Router();

const mailService = new MailService();
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository, mailService);
const authController = new AuthController(authService);

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints para autenticação de usuários
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Fazer login no sistema
 *     description: Autentica um usuário e retorna um token JWT
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "admin@teste.com"
 *             password: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: "uuid"
 *                 name: "Administrador"
 *                 email: "admin@teste.com"
 *                 type:
 *                   label: "Administrador"
 *       400:
 *         description: Dados de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Email e senha são obrigatórios"
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Email ou senha inválidos"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/verify-email', (req, res) =>
  authController.verifyEmail(req, res)
);
export default router;
