const winston = require('winston');
const path = require('path');

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'onpurpose-api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Custom logging methods
const customLogger = {
  // User activity logging
  logUserActivity: (userId, action, details = {}) => {
    logger.info('User Activity', {
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  },

  // Booking activity logging
  logBookingActivity: (bookingId, action, userId, details = {}) => {
    logger.info('Booking Activity', {
      bookingId,
      action,
      userId,
      details,
      timestamp: new Date().toISOString()
    });
  },

  // Payment activity logging
  logPaymentActivity: (paymentId, action, amount, userId, details = {}) => {
    logger.info('Payment Activity', {
      paymentId,
      action,
      amount,
      userId,
      details,
      timestamp: new Date().toISOString()
    });
  },

  // Security events logging
  logSecurityEvent: (event, ip, userId = null, details = {}) => {
    logger.warn('Security Event', {
      event,
      ip,
      userId,
      details,
      timestamp: new Date().toISOString()
    });
  },

  // API request logging
  logApiRequest: (method, url, statusCode, responseTime, userId = null) => {
    logger.info('API Request', {
      method,
      url,
      statusCode,
      responseTime,
      userId,
      timestamp: new Date().toISOString()
    });
  },

  // Error logging with context
  logError: (error, context = {}) => {
    logger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  },

  // Performance logging
  logPerformance: (operation, duration, details = {}) => {
    logger.info('Performance Metric', {
      operation,
      duration,
      details,
      timestamp: new Date().toISOString()
    });
  }
};

// Express middleware for request logging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    customLogger.logApiRequest(
      req.method,
      req.originalUrl,
      res.statusCode,
      duration,
      req.user?.id
    );
  });
  
  next();
};

module.exports = {
  logger,
  customLogger,
  requestLogger
};
