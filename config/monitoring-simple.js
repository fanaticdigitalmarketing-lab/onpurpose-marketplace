// Simple monitoring configuration for development
const MonitoringConfig = {
  init: (app) => {
    // No monitoring init in development
  },
  
  addPerformanceMonitoring: (app) => {
    // No performance monitoring in development
  },
  
  getHealthMetrics: () => {
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };
  },
  
  setupErrorHandler: (app) => {
    // No error handler setup in development
  },
  
  captureException: (err, context) => {
    console.error('Error captured:', err.message, context);
  }
};

module.exports = MonitoringConfig;
