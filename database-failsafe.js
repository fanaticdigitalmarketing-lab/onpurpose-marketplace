// DATABASE FAILSAFE PROTECTION - PRODUCTION LEVEL
// Prevents system crashes when database slows or fails

class DatabaseFailsafe {
  constructor(sequelize) {
    this.sequelize = sequelize;
    this.status = 'healthy';
    this.slowQueryThreshold = 5000; // 5 seconds
    this.connectionTimeout = 10000; // 10 seconds
    this.maxRetries = 3;
    this.fallbackMode = false;
    
    // Metrics
    this.metrics = {
      totalQueries: 0,
      slowQueries: 0,
      failedQueries: 0,
      fallbackResponses: 0,
      avgQueryTime: 0,
      totalQueryTime: 0
    };
    
    // Initialize monitoring
    this.initializeMonitoring();
  }

  // Initialize database monitoring
  initializeMonitoring() {
    // Override sequelize query method to monitor performance
    const originalQuery = this.sequelize.query;
    this.sequelize.query = async (...args) => {
      return await this.monitoredQuery(originalQuery, ...args);
    };
    
    // Start health check interval
    this.startHealthCheck();
    
    console.log('[DatabaseFailsafe] Database monitoring initialized');
  }

  // Monitored query with performance tracking
  async monitoredQuery(originalQuery, sql, options = {}) {
    const startTime = Date.now();
    this.metrics.totalQueries++;
    
    try {
      // Set timeout for query
      const queryPromise = originalQuery.call(this.sequelize, sql, {
        ...options,
        timeout: this.connectionTimeout
      });
      
      const result = await Promise.race([
        queryPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), this.connectionTimeout)
        )
      ]);
      
      const duration = Date.now() - startTime;
      this.updateQueryMetrics(duration, false);
      
      // Log slow queries
      if (duration > this.slowQueryThreshold) {
        this.metrics.slowQueries++;
        console.warn(`[DatabaseFailsafe] Slow query detected: ${duration}ms`);
        console.warn(`[DatabaseFailsafe] SQL: ${typeof sql === 'string' ? sql.substring(0, 100) + '...' : 'Complex query'}`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateQueryMetrics(duration, true);
      
      console.error(`[DatabaseFailsafe] Query failed after ${duration}ms:`, error.message);
      
      // Check if we should enter fallback mode
      if (this.shouldEnterFallbackMode()) {
        this.enterFallbackMode();
      }
      
      throw error;
    }
  }

  // RULE 8: IF DATABASE SLOWS, RETURN FALLBACK RESPONSE
  async safeQuery(queryFunction, fallbackData = null) {
    if (this.fallbackMode) {
      this.metrics.fallbackResponses++;
      console.log('[DatabaseFailsafe] Returning fallback response (fallback mode active)');
      return fallbackData;
    }
    
    try {
      const result = await this.executeWithRetry(queryFunction);
      return result;
    } catch (error) {
      this.metrics.failedQueries++;
      console.error('[DatabaseFailsafe] Query failed, returning fallback:', error.message);
      
      this.metrics.fallbackResponses++;
      return fallbackData;
    }
  }

  // Execute query with retry logic
  async executeWithRetry(queryFunction, retryCount = 0) {
    try {
      return await queryFunction();
    } catch (error) {
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`[DatabaseFailsafe] Retrying query (attempt ${retryCount + 1}/${this.maxRetries}) after ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.executeWithRetry(queryFunction, retryCount + 1);
      }
      
      throw error;
    }
  }

  // Check if error is retryable
  isRetryableError(error) {
    const retryableErrors = [
      'Connection timeout',
      'Connection lost',
      'Connection refused',
      'ETIMEDOUT',
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED'
    ];
    
    return retryableErrors.some(retryableError => 
      error.message.includes(retryableError)
    );
  }

  // Check if we should enter fallback mode
  shouldEnterFallbackMode() {
    const recentFailures = this.metrics.failedQueries;
    const failureRate = this.metrics.totalQueries > 0 ? 
      recentFailures / this.metrics.totalQueries : 0;
    
    // Enter fallback mode if failure rate > 20% or > 10 consecutive failures
    return failureRate > 0.2 || recentFailures > 10;
  }

  // Enter fallback mode
  enterFallbackMode() {
    if (!this.fallbackMode) {
      this.fallbackMode = true;
      this.status = 'degraded';
      console.warn('[DatabaseFailsafe] ENTERING FALLBACK MODE - Database issues detected');
      
      // Set up automatic recovery check
      setTimeout(() => this.checkRecovery(), 30000); // Check recovery in 30 seconds
    }
  }

  // Check if database has recovered
  async checkRecovery() {
    try {
      // Simple health check query
      await this.sequelize.query('SELECT 1');
      
      console.log('[DatabaseFailsafe] Database recovered, exiting fallback mode');
      this.fallbackMode = false;
      this.status = 'healthy';
      
      // Reset some metrics
      this.metrics.failedQueries = Math.max(0, this.metrics.failedQueries - 5);
    } catch (error) {
      console.log('[DatabaseFailsafe] Database not yet recovered, staying in fallback mode');
      
      // Check again in 30 seconds
      setTimeout(() => this.checkRecovery(), 30000);
    }
  }

  // Start health check monitoring
  startHealthCheck() {
    setInterval(async () => {
      try {
        await this.sequelize.query('SELECT 1');
        
        if (this.status === 'unhealthy') {
          console.log('[DatabaseFailsafe] Database health restored');
          this.status = 'healthy';
        }
      } catch (error) {
        if (this.status === 'healthy') {
          console.error('[DatabaseFailsafe] Database health check failed:', error.message);
          this.status = 'unhealthy';
        }
      }
    }, 30000); // Check every 30 seconds
  }

  // Update query metrics
  updateQueryMetrics(duration, failed) {
    this.metrics.totalQueryTime += duration;
    
    if (!failed) {
      this.metrics.avgQueryTime = this.metrics.totalQueryTime / 
        Math.max(1, this.metrics.totalQueries - this.metrics.failedQueries);
    }
  }

  // Get fallback data for common queries
  getFallbackData(queryType) {
    const fallbacks = {
      services: {
        success: true,
        data: [],
        message: 'Service listing temporarily unavailable',
        fallback: true
      },
      users: {
        success: true,
        data: [],
        message: 'User data temporarily unavailable',
        fallback: true
      },
      bookings: {
        success: true,
        data: [],
        message: 'Booking data temporarily unavailable',
        fallback: true
      },
      reviews: {
        success: true,
        data: [],
        message: 'Review data temporarily unavailable',
        fallback: true
      },
      trending: {
        success: true,
        data: {
          topNiches: [],
          trendingPatterns: [],
          viralScoreLeaders: []
        },
        message: 'Trending data temporarily unavailable',
        fallback: true
      }
    };
    
    return fallbacks[queryType] || {
      success: false,
      message: 'Database temporarily unavailable',
      fallback: true
    };
  }

  // Log slow queries for optimization
  logSlowQuery(sql, duration) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      duration,
      sql: typeof sql === 'string' ? sql : 'Complex query',
      type: 'SLOW_QUERY'
    };
    
    console.warn('[DatabaseFailsafe] Slow query logged:', logEntry);
    
    // In production, this would be sent to a monitoring service
    // await this.sendToMonitoring(logEntry);
  }

  // Get database health status
  getHealthStatus() {
    const successRate = this.metrics.totalQueries > 0 ? 
      ((this.metrics.totalQueries - this.metrics.failedQueries) / this.metrics.totalQueries * 100).toFixed(2) + '%' : '100%';
    
    return {
      status: this.status,
      fallbackMode: this.fallbackMode,
      metrics: {
        ...this.metrics,
        successRate,
        slowQueryRate: this.metrics.totalQueries > 0 ? 
          (this.metrics.slowQueries / this.metrics.totalQueries * 100).toFixed(2) + '%' : '0%'
      },
      thresholds: {
        slowQueryThreshold: this.slowQueryThreshold,
        connectionTimeout: this.connectionTimeout,
        maxRetries: this.maxRetries
      },
      recommendations: this.getHealthRecommendations()
    };
  }

  // Get health recommendations
  getHealthRecommendations() {
    const recommendations = [];
    
    if (this.fallbackMode) {
      recommendations.push('Database is in fallback mode - investigate database connectivity and performance');
    }
    
    if (this.metrics.slowQueries > 10) {
      recommendations.push('High number of slow queries detected - consider query optimization and indexing');
    }
    
    if (this.metrics.failedQueries > 5) {
      recommendations.push('Multiple query failures detected - check database logs and connection pool');
    }
    
    if (this.metrics.avgQueryTime > this.slowQueryThreshold) {
      recommendations.push('Average query time is high - review query performance and database load');
    }
    
    return recommendations;
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      totalQueries: 0,
      slowQueries: 0,
      failedQueries: 0,
      fallbackResponses: 0,
      avgQueryTime: 0,
      totalQueryTime: 0
    };
  }

  // Force exit fallback mode
  exitFallbackMode() {
    this.fallbackMode = false;
    this.status = 'healthy';
    console.log('[DatabaseFailsafe] Manually exited fallback mode');
  }
}

module.exports = DatabaseFailsafe;
