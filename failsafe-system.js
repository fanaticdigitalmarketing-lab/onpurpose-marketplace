// FAILSAFE SYSTEM - AUTO-SCALING ENFORCEMENT
// Implements graceful degradation, circuit breakers, and retry logic

const EventEmitter = require('events');

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;
    
    // Configuration
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconds
    this.expectedRecoveryTime = options.expectedRecoveryTime || 30000; // 30 seconds
  }

  // Execute operation with circuit breaker protection
  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker ${this.name} is OPEN until ${new Date(this.nextAttempt)}`);
      }
      this.state = 'HALF_OPEN';
      console.log(`[CircuitBreaker] ${this.name} transitioning to HALF_OPEN`);
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  // Handle successful operation
  onSuccess() {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log(`[CircuitBreaker] ${this.name} transitioning to CLOSED`);
    }
    
    this.successCount++;
  }

  // Handle failed operation
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.recoveryTimeout;
      console.log(`[CircuitBreaker] ${this.name} transitioning to OPEN until ${new Date(this.nextAttempt)}`);
    }
  }

  // Get circuit breaker status
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt
    };
  }
}

class RetryManager {
  constructor(options = {}) {
    this.maxAttempts = options.maxAttempts || 3;
    this.baseDelay = options.baseDelay || 1000; // 1 second
    this.maxDelay = options.maxDelay || 30000; // 30 seconds
    this.backoffMultiplier = options.backoffMultiplier || 2;
  }

  // Execute operation with retry logic
  async execute(operation, context = 'operation') {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        const result = await operation();
        if (attempt > 1) {
          console.log(`[Retry] ${context} succeeded on attempt ${attempt}`);
        }
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === this.maxAttempts) {
          console.error(`[Retry] ${context} failed after ${this.maxAttempts} attempts`);
          throw error;
        }
        
        const delay = this.calculateDelay(attempt);
        console.log(`[Retry] ${context} failed on attempt ${attempt}, retrying in ${delay}ms`);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  // Calculate exponential backoff delay
  calculateDelay(attempt) {
    const delay = this.baseDelay * Math.pow(this.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.maxDelay);
  }

  // Sleep for specified milliseconds
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class FailsafeSystem extends EventEmitter {
  constructor() {
    super();
    this.circuitBreakers = new Map();
    this.retryManager = new RetryManager();
    this.loadShedding = false;
    this.degradationLevel = 0; // 0 = normal, 1 = degraded, 2 = minimal
    this.systemHealth = {
      cpu: 0,
      memory: 0,
      activeConnections: 0,
      requestRate: 0
    };
    
    // Start monitoring
    this.startMonitoring();
  }

  // Get or create circuit breaker
  getCircuitBreaker(name, options = {}) {
    if (!this.circuitBreakers.has(name)) {
      this.circuitBreakers.set(name, new CircuitBreaker(name, options));
    }
    return this.circuitBreakers.get(name);
  }

  // Execute operation with failsafe protection
  async execute(operation, options = {}) {
    const {
      circuitBreakerName = 'default',
      retry = true,
      timeout = 30000,
      fallback = null
    } = options;

    // Check if system is under load
    if (this.shouldShedLoad()) {
      console.log('[Failsafe] Shedding load due to system overload');
      if (fallback) {
        return await fallback();
      }
      throw new Error('System under load - request rejected');
    }

    // Apply circuit breaker
    const circuitBreaker = this.getCircuitBreaker(circuitBreakerName);
    
    // Apply timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), timeout);
    });

    const operationPromise = retry 
      ? this.retryManager.execute(() => circuitBreaker.execute(operation), circuitBreakerName)
      : circuitBreaker.execute(operation);

    try {
      const result = await Promise.race([operationPromise, timeoutPromise]);
      this.emit('operationSuccess', { circuitBreakerName, result });
      return result;
    } catch (error) {
      this.emit('operationFailure', { circuitBreakerName, error });
      
      if (fallback) {
        console.log(`[Failsafe] Using fallback for ${circuitBreakerName}: ${error.message}`);
        return await fallback();
      }
      
      throw error;
    }
  }

  // Check if load shedding should be activated
  shouldShedLoad() {
    return this.loadShedding || this.degradationLevel >= 2;
  }

  // Update system health metrics
  updateSystemHealth(metrics) {
    this.systemHealth = { ...this.systemHealth, ...metrics };
    
    // Determine degradation level based on system health
    if (this.systemHealth.cpu > 90 || this.systemHealth.memory > 90) {
      this.degradationLevel = 2; // Minimal service
      this.loadShedding = true;
    } else if (this.systemHealth.cpu > 70 || this.systemHealth.memory > 70) {
      this.degradationLevel = 1; // Degraded service
      this.loadShedding = false;
    } else {
      this.degradationLevel = 0; // Normal service
      this.loadShedding = false;
    }
    
    this.emit('healthUpdate', this.systemHealth);
  }

  // Start system monitoring
  startMonitoring() {
    setInterval(() => {
      // Simulate system health monitoring (in production, use actual metrics)
      const cpu = Math.random() * 100;
      const memory = Math.random() * 100;
      const activeConnections = Math.floor(Math.random() * 1000);
      const requestRate = Math.floor(Math.random() * 500);
      
      this.updateSystemHealth({ cpu, memory, activeConnections, requestRate });
    }, 5000); // Monitor every 5 seconds
  }

  // Get system status
  getSystemStatus() {
    const circuitBreakerStatus = Array.from(this.circuitBreakers.values()).map(cb => cb.getStatus());
    
    return {
      degradationLevel: this.degradationLevel,
      loadShedding: this.loadShedding,
      systemHealth: this.systemHealth,
      circuitBreakers: circuitBreakerStatus,
      timestamp: new Date().toISOString()
    };
  }

  // Graceful degradation responses
  getFallbackResponse(endpoint) {
    const fallbacks = {
      '/api/ideas/generate-advanced': {
        success: true,
        data: {
          niche: 'coaching',
          ideas: [
            {
              id: 'fallback-1',
              title: 'Premium Coaching Service',
              description: 'Professional coaching service for busy professionals',
              category: 'coaching',
              estimatedPrice: 150,
              difficulty: 'Intermediate',
              timeCommitment: '1-2 hours'
            }
          ],
          generatedAt: new Date().toISOString(),
          fallback: true
        }
      },
      '/api/ideas/trending': {
        success: true,
        data: {
          topNiches: [
            { niche: 'coaching', count: 100, growth: '+10%' },
            { niche: 'fitness', count: 80, growth: '+8%' },
            { niche: 'marketing', count: 60, growth: '+12%' }
          ],
          fallback: true
        }
      },
      '/api/services': {
        success: true,
        data: [],
        fallback: true,
        message: 'Service listing temporarily unavailable'
      }
    };

    return fallbacks[endpoint] || {
      success: false,
      message: 'Service temporarily unavailable',
      fallback: true
    };
  }

  // Emergency shutdown
  async emergencyShutdown(reason) {
    console.log(`[Failsafe] EMERGENCY SHUTDOWN: ${reason}`);
    
    this.emit('emergencyShutdown', { reason, timestamp: new Date() });
    
    // Graceful shutdown logic
    this.degradationLevel = 2;
    this.loadShedding = true;
    
    // Close all circuit breakers
    this.circuitBreakers.forEach(cb => {
      cb.state = 'OPEN';
      cb.nextAttempt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    });
  }
}

// Singleton instance
const failsafeSystem = new FailsafeSystem();

module.exports = failsafeSystem;
