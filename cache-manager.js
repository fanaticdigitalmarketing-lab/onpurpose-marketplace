// CACHE MANAGER - AUTO-SCALING PERFORMANCE OPTIMIZATION
// Implements intelligent caching for unlimited scalability

class CacheManager {
  constructor() {
    this.cache = new Map(); // In-memory cache (in production, use Redis)
    this.ttlMap = new Map(); // Time-to-live tracking
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };
    
    // Start cleanup interval
    this.startCleanup();
  }

  // Get value from cache
  get(key) {
    const cached = this.cache.get(key);
    
    if (!cached) {
      this.stats.misses++;
      return null;
    }

    // Check TTL
    const ttl = this.ttlMap.get(key);
    if (ttl && Date.now() > ttl) {
      this.cache.delete(key);
      this.ttlMap.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return cached.value;
  }

  // Set value in cache with optional TTL
  set(key, value, ttlSeconds = 300) { // 5 minutes default TTL
    this.cache.set(key, { value, createdAt: Date.now() });
    
    if (ttlSeconds > 0) {
      this.ttlMap.set(key, Date.now() + (ttlSeconds * 1000));
    }
    
    this.stats.sets++;
    
    // Evict oldest entries if cache gets too large
    if (this.cache.size > 1000) {
      this.evictOldest();
    }
  }

  // Delete from cache
  delete(key) {
    const deleted = this.cache.delete(key);
    this.ttlMap.delete(key);
    
    if (deleted) {
      this.stats.deletes++;
    }
    
    return deleted;
  }

  // Clear cache
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.ttlMap.clear();
    this.stats.deletes += size;
  }

  // Evict oldest entries
  evictOldest(count = 100) {
    let evicted = 0;
    const entries = Array.from(this.cache.entries());
    
    // Sort by creation time
    entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
    
    for (let i = 0; i < Math.min(count, entries.length); i++) {
      const [key] = entries[i];
      this.cache.delete(key);
      this.ttlMap.delete(key);
      evicted++;
    }
    
    this.stats.evictions += evicted;
    return evicted;
  }

  // Start cleanup interval
  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      
      for (const [key, ttl] of this.ttlMap.entries()) {
        if (now > ttl) {
          this.cache.delete(key);
          this.ttlMap.delete(key);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        this.stats.evictions += cleaned;
        console.log(`[Cache] Cleaned up ${cleaned} expired entries`);
      }
    }, 60000); // Cleanup every minute
  }

  // Get cache statistics
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: hitRate.toFixed(2) + '%'
    };
  }

  // Cache middleware for Express
  middleware(ttlSeconds = 300) {
    return (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const key = this.generateKey(req);
      const cached = this.get(key);

      if (cached) {
        console.log(`[Cache] HIT: ${req.method} ${req.originalUrl}`);
        return res.json(cached);
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = (data) => {
        // Only cache successful responses
        if (res.statusCode === 200) {
          this.set(key, data, ttlSeconds);
          console.log(`[Cache] SET: ${req.method} ${req.originalUrl}`);
        }
        return originalJson.call(res, data);
      };

      next();
    };
  }

  // Generate cache key from request
  generateKey(req) {
    const url = req.originalUrl || req.url;
    const query = JSON.stringify(req.query);
    return `${req.method}:${url}:${query}`;
  }

  // Cache helper for API responses
  async cacheApiResponse(key, fetchFunction, ttlSeconds = 300) {
    const cached = this.get(key);
    
    if (cached) {
      console.log(`[Cache] API HIT: ${key}`);
      return cached;
    }

    console.log(`[Cache] API MISS: ${key}`);
    const result = await fetchFunction();
    this.set(key, result, ttlSeconds);
    
    return result;
  }

  // Invalidate cache pattern
  invalidatePattern(pattern) {
    let invalidated = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        invalidated++;
      }
    }
    
    console.log(`[Cache] Invalidated ${invalidated} entries matching pattern: ${pattern}`);
    return invalidated;
  }

  // Warm up cache with common data
  async warmUp(warmUpFunctions = []) {
    console.log('[Cache] Starting cache warm-up...');
    
    for (const { key, fetchFunction, ttl } of warmUpFunctions) {
      try {
        await this.cacheApiResponse(key, fetchFunction, ttl);
        console.log(`[Cache] Warmed up: ${key}`);
      } catch (error) {
        console.error(`[Cache] Failed to warm up: ${key}`, error);
      }
    }
    
    console.log(`[Cache] Cache warm-up completed. Size: ${this.cache.size}`);
  }
}

// Singleton instance
const cacheManager = new CacheManager();

module.exports = cacheManager;
