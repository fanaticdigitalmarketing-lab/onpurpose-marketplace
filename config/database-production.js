const { Pool } = require('pg');
const logger = require('./logger');

class ProductionDatabase {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Parse DATABASE_URL for production
      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is required');
      }

      // Configure SSL for production databases (required by most cloud providers)
      const sslConfig = process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false // Required for Heroku and most cloud databases
      } : false;

      this.pool = new Pool({
        connectionString: databaseUrl,
        ssl: sslConfig,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
        maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.isConnected = true;
      logger.info('Production database connected successfully');
      
      // Set up connection monitoring
      this.setupConnectionMonitoring();
      
      return this.pool;
    } catch (error) {
      logger.error('Failed to connect to production database:', error);
      throw error;
    }
  }

  setupConnectionMonitoring() {
    this.pool.on('connect', (client) => {
      logger.info('New database client connected');
    });

    this.pool.on('error', (err, client) => {
      logger.error('Database client error:', err);
    });

    this.pool.on('remove', (client) => {
      logger.info('Database client removed');
    });

    // Monitor pool statistics
    setInterval(() => {
      const stats = {
        totalCount: this.pool.totalCount,
        idleCount: this.pool.idleCount,
        waitingCount: this.pool.waitingCount
      };
      logger.debug('Database pool stats:', stats);
    }, 60000); // Log every minute
  }

  async healthCheck() {
    try {
      if (!this.pool) {
        throw new Error('Database pool not initialized');
      }

      const start = Date.now();
      const result = await this.pool.query('SELECT 1 as health_check, NOW() as timestamp');
      const duration = Date.now() - start;

      return {
        status: 'healthy',
        responseTime: `${duration}ms`,
        timestamp: result.rows[0].timestamp,
        poolStats: {
          totalCount: this.pool.totalCount,
          idleCount: this.pool.idleCount,
          waitingCount: this.pool.waitingCount
        }
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async gracefulShutdown() {
    try {
      if (this.pool) {
        logger.info('Closing database connections...');
        await this.pool.end();
        this.isConnected = false;
        logger.info('Database connections closed successfully');
      }
    } catch (error) {
      logger.error('Error during database shutdown:', error);
    }
  }

  getPool() {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.pool;
  }
}

// Create singleton instance
const productionDb = new ProductionDatabase();

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await productionDb.gracefulShutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await productionDb.gracefulShutdown();
  process.exit(0);
});

module.exports = productionDb;
