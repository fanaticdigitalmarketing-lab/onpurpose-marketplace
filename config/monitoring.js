const Sentry = require('@sentry/node');
const logger = require('./logger');

class MonitoringConfig {
  static init(app) {
    // Initialize Sentry for error tracking
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        integrations: [
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.Express({ app }),
        ],
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      });

      // Request handler must be the first middleware
      app.use(Sentry.Handlers.requestHandler());
      app.use(Sentry.Handlers.tracingHandler());
      
      logger.info('Sentry monitoring initialized');
    }
  }

  static setupErrorHandler(app) {
    if (process.env.SENTRY_DSN) {
      // Error handler must be before any other error middleware
      app.use(Sentry.Handlers.errorHandler());
    }
  }

  static captureException(error, context = {}) {
    logger.error('Application error:', error);
    
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error, { extra: context });
    }
  }

  static addPerformanceMonitoring(app) {
    // Request logging middleware
    app.use((req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
          method: req.method,
          url: req.url,
          status: res.statusCode,
          duration: `${duration}ms`,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        };
        
        if (res.statusCode >= 400) {
          logger.warn('Request completed with error', logData);
        } else {
          logger.info('Request completed', logData);
        }
      });
      
      next();
    });
  }

  static getHealthMetrics() {
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.version,
      environment: process.env.NODE_ENV
    };
  }
}

module.exports = MonitoringConfig;
