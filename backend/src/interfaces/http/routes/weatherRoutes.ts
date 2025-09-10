import { Router } from 'express';
import { WeatherController } from '../controllers/WeatherController';
import { authenticateToken } from '../middleware/authenticateToken';
import { validateRequest } from '../middleware/validateRequest';
import { GetWeatherRequestSchema } from '@/application/use-cases/weather/GetWeatherUseCase';
import { GetSearchHistoryRequestSchema } from '@/application/use-cases/weather/GetSearchHistoryUseCase';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();
const weatherController = new WeatherController();

const rlStrict = rateLimit({ windowSeconds: 60, max: 30, keyPrefix: 'rl:weather' });

/**
 * @openapi
 * /api/weather:
 *   get:
 *     summary: Obter clima atual por cidade ou coordenadas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: country
 *         schema: { type: string }
 *       - in: query
 *         name: latitude
 *         schema: { type: number }
 *       - in: query
 *         name: longitude
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Dados de clima
 *       400:
 *         description: Erro na requisição
 */
// GET /api/weather - Get weather information
router.get('/', authenticateToken, rlStrict, (req, res) => weatherController.getWeather(req, res));

/**
 * @openapi
 * /api/weather/history:
 *   get:
 *     summary: Obter histórico de buscas (máx 5)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, maximum: 5 }
 *     responses:
 *       200:
 *         description: Histórico de buscas
 */
// GET /api/weather/history - Get search history
router.get('/history', authenticateToken, rlStrict, (req, res) => weatherController.getSearchHistory(req, res));

/**
 * @openapi
 * /api/weather/forecast:
 *   get:
 *     summary: Obter previsão do tempo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: country
 *         schema: { type: string }
 *       - in: query
 *         name: latitude
 *         schema: { type: number }
 *       - in: query
 *         name: longitude
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Dados de previsão
 */
// GET /api/weather/forecast - Get forecast information
router.get('/forecast', authenticateToken, rlStrict, (req, res) => weatherController.getForecast(req, res));

export { router as weatherRoutes };
