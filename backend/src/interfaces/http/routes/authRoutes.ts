import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/authenticateToken';
import { validateRequest } from '../middleware/validateRequest';
import { RegisterUserRequestSchema } from '@/application/use-cases/auth/RegisterUserUseCase';
import { LoginUserRequestSchema } from '@/application/use-cases/auth/LoginUserUseCase';
import { rateLimit } from '../middleware/rateLimit';
import { idempotency } from '../middleware/idempotency';

const router = Router();
const authController = new AuthController();

const rlAuth = rateLimit({ windowSeconds: 60, max: 10, keyPrefix: 'rl:auth' });

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Usuário registrado
 *       400:
 *         description: Erro de validação
 */
// POST /api/auth/register - Register a new user
router.post('/register', rlAuth, idempotency(), (req, res) => authController.register(req, res));

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Autenticar usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Tokens gerados
 *       401:
 *         description: Credenciais inválidas
 */
// POST /api/auth/login - Login user
router.post('/login', rlAuth, (req, res) => authController.login(req, res));

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Novo access token
 *       401:
 *         description: Refresh token inválido
 */
// POST /api/auth/refresh - Refresh access token
router.post('/refresh', rlAuth, idempotency(), (req, res) => authController.refreshToken(req, res));

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Dados do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *       401:
 *         description: Não autenticado
 */
// GET /api/auth/me - Get current user profile
router.get('/me', authenticateToken, (req, res) => authController.me(req, res));

export { router as authRoutes };
