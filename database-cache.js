// DATABASE CACHE LAYER - PRODUCTION LEVEL OPTIMIZATION
// Implements intelligent caching for frequently accessed database data

const cacheManager = require('./cache-manager');

class DatabaseCache {
  constructor() {
    this.cache = cacheManager;
    this.defaultTTL = 300; // 5 minutes default
    this.cacheStrategies = new Map();
    
    this.initializeCacheStrategies();
  }

  // Initialize cache strategies for different data types
  initializeCacheStrategies() {
    // User data caching
    this.cacheStrategies.set('user', {
      ttl: 3600, // 1 hour
      fields: ['id', 'name', 'email', 'role', 'avatar', 'bio', 'location', 'avgRating', 'trustScore'],
      keyPrefix: 'user:'
    });

    // Service data caching
    this.cacheStrategies.set('service', {
      ttl: 1800, // 30 minutes
      fields: ['id', 'title', 'description', 'price', 'category', 'duration', 'location', 'isOnline', 'providerId', 'avgRating', 'reviewCount', 'trustScore'],
      keyPrefix: 'service:'
    });

    // Service list caching
    this.cacheStrategies.set('serviceList', {
      ttl: 600, // 10 minutes
      keyPrefix: 'services:'
    });

    // Booking data caching
    this.cacheStrategies.set('booking', {
      ttl: 900, // 15 minutes
      fields: ['id', 'userId', 'providerId', 'serviceId', 'status', 'date', 'createdAt'],
      keyPrefix: 'booking:'
    });

    // Review data caching
    this.cacheStrategies.set('review', {
      ttl: 1800, // 30 minutes
      fields: ['id', 'serviceId', 'userId', 'rating', 'comment', 'createdAt'],
      keyPrefix: 'review:'
    });

    // Trending data caching
    this.cacheStrategies.set('trending', {
      ttl: 600, // 10 minutes
      keyPrefix: 'trending:'
    });
  }

  // Get cached data or fetch and cache it
  async getOrSet(key, fetchFunction, strategy = 'default') {
    const cacheKey = `${strategy}:${key}`;
    
    // Try to get from cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`[DatabaseCache] HIT: ${cacheKey}`);
      return cached;
    }

    console.log(`[DatabaseCache] MISS: ${cacheKey}`);
    
    // Fetch fresh data
    const data = await fetchFunction();
    
    // Cache the data
    const ttl = this.cacheStrategies.get(strategy)?.ttl || this.defaultTTL;
    this.cache.set(cacheKey, data, ttl);
    
    return data;
  }

  // Cache user data
  async cacheUser(userId, userData) {
    const strategy = this.cacheStrategies.get('user');
    const cacheKey = `${strategy.keyPrefix}${userId}`;
    
    // Filter fields according to strategy
    const filteredData = this.filterFields(userData, strategy.fields);
    
    this.cache.set(cacheKey, filteredData, strategy.ttl);
    console.log(`[DatabaseCache] SET: ${cacheKey}`);
  }

  // Get cached user data
  async getCachedUser(userId) {
    const strategy = this.cacheStrategies.get('user');
    const cacheKey = `${strategy.keyPrefix}${userId}`;
    
    return this.cache.get(cacheKey);
  }

  // Cache service data
  async cacheService(serviceId, serviceData) {
    const strategy = this.cacheStrategies.get('service');
    const cacheKey = `${strategy.keyPrefix}${serviceId}`;
    
    const filteredData = this.filterFields(serviceData, strategy.fields);
    
    this.cache.set(cacheKey, filteredData, strategy.ttl);
    console.log(`[DatabaseCache] SET: ${cacheKey}`);
  }

  // Get cached service data
  async getCachedService(serviceId) {
    const strategy = this.cacheStrategies.get('service');
    const cacheKey = `${strategy.keyPrefix}${serviceId}`;
    
    return this.cache.get(cacheKey);
  }

  // Cache service list with pagination
  async cacheServiceList(params, serviceList) {
    const strategy = this.cacheStrategies.get('serviceList');
    const cacheKey = `${strategy.keyPrefix}${JSON.stringify(params)}`;
    
    this.cache.set(cacheKey, serviceList, strategy.ttl);
    console.log(`[DatabaseCache] SET: ${cacheKey}`);
  }

  // Get cached service list
  async getCachedServiceList(params) {
    const strategy = this.cacheStrategies.get('serviceList');
    const cacheKey = `${strategy.keyPrefix}${JSON.stringify(params)}`;
    
    return this.cache.get(cacheKey);
  }

  // Cache trending data
  async cacheTrendingData(trendingData) {
    const strategy = this.cacheStrategies.get('trending');
    const cacheKey = `${strategy.keyPrefix}data`;
    
    this.cache.set(cacheKey, trendingData, strategy.ttl);
    console.log(`[DatabaseCache] SET: ${cacheKey}`);
  }

  // Get cached trending data
  async getCachedTrendingData() {
    const strategy = this.cacheStrategies.get('trending');
    const cacheKey = `${strategy.keyPrefix}data`;
    
    return this.cache.get(cacheKey);
  }

  // Invalidate cache for specific data
  invalidateCache(type, id) {
    const strategy = this.cacheStrategies.get(type);
    if (!strategy) return false;
    
    const cacheKey = `${strategy.keyPrefix}${id}`;
    const deleted = this.cache.delete(cacheKey);
    
    if (deleted) {
      console.log(`[DatabaseCache] INVALIDATE: ${cacheKey}`);
    }
    
    return deleted;
  }

  // Invalidate cache pattern
  invalidatePattern(pattern) {
    return this.cache.invalidatePattern(pattern);
  }

  // Filter fields according to strategy
  filterFields(data, fields) {
    if (!fields || !Array.isArray(fields)) return data;
    
    const filtered = {};
    fields.forEach(field => {
      if (data[field] !== undefined) {
        filtered[field] = data[field];
      }
    });
    
    return filtered;
  }

  // Warm up cache with frequently accessed data
  async warmUpCache(models) {
    console.log('[DatabaseCache] Starting cache warm-up...');
    
    const warmUpTasks = [
      // Warm up trending data
      this.getOrSet('trending_data', async () => {
        // This would normally fetch from database
        return {
          topNiches: [
            { niche: 'coaching', count: 245, growth: '+12%' },
            { niche: 'fitness', count: 189, growth: '+8%' },
            { niche: 'marketing', count: 167, growth: '+15%' }
          ]
        };
      }, 'trending'),

      // Warm up popular services
      this.getOrSet('popular_services', async () => {
        // This would normally fetch from database
        return await models.Service.findAll({
          where: { isActive: true },
          limit: 10,
          order: [['avgRating', 'DESC']],
          include: [
            { model: models.User, as: 'provider', attributes: ['id', 'name', 'avatar'] }
          ]
        });
      }, 'serviceList')
    ];

    await Promise.all(warmUpTasks);
    console.log('[DatabaseCache] Cache warm-up completed');
  }

  // Get cache statistics
  getCacheStats() {
    const baseStats = this.cache.getStats();
    const strategyStats = {};
    
    this.cacheStrategies.forEach((strategy, type) => {
      strategyStats[type] = {
        ttl: strategy.ttl,
        fields: strategy.fields?.length || 0,
        keyPrefix: strategy.keyPrefix
      };
    });
    
    return {
      ...baseStats,
      strategies: strategyStats,
      totalStrategies: this.cacheStrategies.size
    };
  }

  // Clean up expired entries
  cleanup() {
    return this.cache.clearCompletedJobs();
  }
}

// Singleton instance
const databaseCache = new DatabaseCache();

module.exports = databaseCache;
