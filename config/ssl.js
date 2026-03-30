const fs = require('fs');
const https = require('https');
const logger = require('./logger');

class SSLConfig {
  static getHTTPSOptions() {
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }

    try {
      const certPath = process.env.SSL_CERT_PATH;
      const keyPath = process.env.SSL_KEY_PATH;

      if (!certPath || !keyPath) {
        logger.warn('SSL certificate paths not configured');
        return null;
      }

      if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        logger.error('SSL certificate files not found');
        return null;
      }

      return {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath)
      };
    } catch (error) {
      logger.error('Failed to load SSL certificates:', error);
      return null;
    }
  }

  static createHTTPSServer(app) {
    const httpsOptions = this.getHTTPSOptions();
    
    if (httpsOptions) {
      return https.createServer(httpsOptions, app);
    }
    
    return null;
  }

  static redirectHTTPToHTTPS(app) {
    if (process.env.NODE_ENV === 'production') {
      app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
          res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
          next();
        }
      });
    }
  }
}

module.exports = SSLConfig;
