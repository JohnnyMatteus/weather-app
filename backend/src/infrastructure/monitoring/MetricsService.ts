import client from 'prom-client';

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'weather-app-backend',
  version: '1.0.0',
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

export const weatherApiRequests = new client.Counter({
  name: 'weather_api_requests_total',
  help: 'Total number of weather API requests',
  labelNames: ['provider', 'status'],
});

export const weatherApiDuration = new client.Histogram({
  name: 'weather_api_duration_seconds',
  help: 'Duration of weather API requests in seconds',
  labelNames: ['provider'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

export const databaseConnections = new client.Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections',
});

export const cacheHits = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type'],
});

export const cacheMisses = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type'],
});

export const userRegistrations = new client.Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations',
});

export const userLogins = new client.Counter({
  name: 'user_logins_total',
  help: 'Total number of user logins',
});

export const searchHistoryRequests = new client.Counter({
  name: 'search_history_requests_total',
  help: 'Total number of search history requests',
});

// Register all metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(weatherApiRequests);
register.registerMetric(weatherApiDuration);
register.registerMetric(databaseConnections);
register.registerMetric(cacheHits);
register.registerMetric(cacheMisses);
register.registerMetric(userRegistrations);
register.registerMetric(userLogins);
register.registerMetric(searchHistoryRequests);

export { register };
