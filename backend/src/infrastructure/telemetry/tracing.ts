import { logger } from '@/infrastructure/logging/Logger';

export async function initializeTracing() {
  if (process.env['OTEL_ENABLED'] !== 'true') {
    return;
  }
  try {
    // Use runtime require to avoid TypeScript module resolution during build
    const _require: any = (eval('require'));
    const { NodeTracerProvider } = _require('@opentelemetry/sdk-trace-node');
    const { Resource } = _require('@opentelemetry/resources');
    const { SemanticResourceAttributes } = _require('@opentelemetry/semantic-conventions');
    const { OTLPTraceExporter } = _require('@opentelemetry/exporter-trace-otlp-http');
    const { BatchSpanProcessor } = _require('@opentelemetry/sdk-trace-base');
    const { diag, DiagConsoleLogger, DiagLogLevel } = _require('@opentelemetry/api');

    if (process.env['OTEL_DEBUG'] === 'true') {
      diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
    }

    const serviceName = process.env['OTEL_SERVICE_NAME'] || 'weather-app-backend';
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    });

    const provider = new NodeTracerProvider({ resource });
    const exporter = new OTLPTraceExporter({
      url: process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] || 'http://localhost:4318/v1/traces',
      headers: {},
    });
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    provider.register();

    logger.info('OpenTelemetry tracing initialized');
  } catch (err) {
    logger.warn('OpenTelemetry not available or failed to initialize. Continuing without tracing.');
  }
}


