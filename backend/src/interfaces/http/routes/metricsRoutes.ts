import { Router } from 'express';
import { register } from '../../../infrastructure/monitoring/MetricsService';

const router = Router();

// Prometheus metrics endpoint (mounted at /api/metrics)
router.get('/', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end('Error generating metrics');
  }
});

export { router as metricsRoutes };
