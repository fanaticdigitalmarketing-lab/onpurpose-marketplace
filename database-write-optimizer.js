// DATABASE WRITE OPTIMIZER - PRODUCTION LEVEL
// Optimizes write operations with batching and transactions

const { Sequelize } = require('sequelize');

class DatabaseWriteOptimizer {
  constructor(sequelize) {
    this.sequelize = sequelize;
    this.batchSize = 100; // Maximum batch size for bulk operations
    this.writeQueue = [];
    this.processing = false;
    
    // Performance metrics
    this.metrics = {
      totalWrites: 0,
      batchWrites: 0,
      singleWrites: 0,
      failedWrites: 0,
      avgWriteTime: 0,
      totalWriteTime: 0
    };
  }

  // RULE 7: BATCH WRITES WHEN POSSIBLE
  async bulkCreate(model, data, options = {}) {
    const startTime = Date.now();
    
    try {
      // If data is small, use bulk create
      if (data.length <= this.batchSize) {
        const result = await model.bulkCreate(data, {
          validate: true,
          ...options
        });
        
        this.updateMetrics('bulk', data.length, Date.now() - startTime);
        console.log(`[WriteOptimizer] Bulk created ${data.length} ${model.name} records`);
        
        return result;
      }
      
      // For large datasets, split into batches
      const results = [];
      for (let i = 0; i < data.length; i += this.batchSize) {
        const batch = data.slice(i, i + this.batchSize);
        const batchResult = await model.bulkCreate(batch, {
          validate: true,
          ...options
        });
        results.push(...batchResult);
      }
      
      this.updateMetrics('bulk', data.length, Date.now() - startTime);
      console.log(`[WriteOptimizer] Bulk created ${data.length} ${model.name} records in ${Math.ceil(data.length / this.batchSize)} batches`);
      
      return results;
    } catch (error) {
      this.metrics.failedWrites++;
      console.error(`[WriteOptimizer] Bulk create failed for ${model.name}:`, error);
      throw error;
    }
  }

  // RULE 7: BATCH UPDATES WHEN POSSIBLE
  async bulkUpdate(model, values, where, options = {}) {
    const startTime = Date.now();
    
    try {
      const result = await model.update(values, {
        where,
        validate: true,
        ...options
      });
      
      this.updateMetrics('bulk', result[0], Date.now() - startTime);
      console.log(`[WriteOptimizer] Bulk updated ${result[0]} ${model.name} records`);
      
      return result;
    } catch (error) {
      this.metrics.failedWrites++;
      console.error(`[WriteOptimizer] Bulk update failed for ${model.name}:`, error);
      throw error;
    }
  }

  // RULE 7: USE TRANSACTIONS FOR CRITICAL OPERATIONS
  async transaction(callback) {
    const startTime = Date.now();
    
    try {
      const result = await this.sequelize.transaction(callback);
      
      this.updateMetrics('transaction', 1, Date.now() - startTime);
      console.log(`[WriteOptimizer] Transaction completed successfully`);
      
      return result;
    } catch (error) {
      this.metrics.failedWrites++;
      console.error(`[WriteOptimizer] Transaction failed:`, error);
      throw error;
    }
  }

  // Optimized single write with fallback to batch
  async optimizedCreate(model, data, options = {}) {
    const startTime = Date.now();
    
    try {
      // Check if we can batch this with queued writes
      if (this.writeQueue.length > 0 && this.canBatchWith(model, data)) {
        this.writeQueue.push({ model, data, options });
        
        if (this.writeQueue.length >= this.batchSize) {
          return await this.processWriteQueue();
        }
        
        return { queued: true, queueLength: this.writeQueue.length };
      }
      
      // Single write
      const result = await model.create(data, {
        validate: true,
        ...options
      });
      
      this.updateMetrics('single', 1, Date.now() - startTime);
      console.log(`[WriteOptimizer] Single created ${model.name} record`);
      
      return result;
    } catch (error) {
      this.metrics.failedWrites++;
      console.error(`[WriteOptimizer] Single create failed for ${model.name}:`, error);
      throw error;
    }
  }

  // Process write queue
  async processWriteQueue() {
    if (this.processing || this.writeQueue.length === 0) {
      return [];
    }
    
    this.processing = true;
    const startTime = Date.now();
    
    try {
      // Group writes by model
      const groupedWrites = {};
      this.writeQueue.forEach(item => {
        const modelName = item.model.name;
        if (!groupedWrites[modelName]) {
          groupedWrites[modelName] = [];
        }
        groupedWrites[modelName].push(item);
      });
      
      const results = [];
      
      // Process each group
      for (const [modelName, writes] of Object.entries(groupedWrites)) {
        const model = writes[0].model;
        const data = writes.map(w => w.data);
        const options = writes[0].options;
        
        const result = await this.bulkCreate(model, data, options);
        results.push(...result);
      }
      
      // Clear queue
      this.writeQueue = [];
      
      console.log(`[WriteOptimizer] Processed write queue: ${results.length} records`);
      return results;
    } catch (error) {
      console.error(`[WriteOptimizer] Failed to process write queue:`, error);
      throw error;
    } finally {
      this.processing = false;
      this.updateMetrics('batch', this.writeQueue.length, Date.now() - startTime);
    }
  }

  // Check if data can be batched
  canBatchWith(model, data) {
    if (this.writeQueue.length === 0) return false;
    
    const lastItem = this.writeQueue[this.writeQueue.length - 1];
    return lastItem.model === model && typeof data === 'object';
  }

  // RULE 7: AVOID UNNECESSARY UPDATES
  async optimizedUpdate(model, values, where, options = {}) {
    const startTime = Date.now();
    
    try {
      // Check if update is necessary
      if (this.isUpdateNecessary(model, values, where)) {
        const result = await model.update(values, {
          where,
          validate: true,
          ...options
        });
        
        this.updateMetrics('single', result[0], Date.now() - startTime);
        console.log(`[WriteOptimizer] Optimized updated ${result[0]} ${model.name} records`);
        
        return result;
      }
      
      console.log(`[WriteOptimizer] Skipped unnecessary update for ${model.name}`);
      return [0];
    } catch (error) {
      this.metrics.failedWrites++;
      console.error(`[WriteOptimizer] Optimized update failed for ${model.name}:`, error);
      throw error;
    }
  }

  // Check if update is necessary
  async isUpdateNecessary(model, values, where) {
    // Simple check - if no values to update, skip
    if (!values || Object.keys(values).length === 0) {
      return false;
    }
    
    // Check if any value is actually different from current value
    try {
      const existing = await model.findOne({ where, attributes: Object.keys(values) });
      if (!existing) return true; // Record doesn't exist, need to create
      
      for (const [key, value] of Object.entries(values)) {
        if (existing[key] !== value) {
          return true; // At least one value is different
        }
      }
      
      return false; // All values are the same
    } catch (error) {
      return true; // On error, proceed with update
    }
  }

  // Update performance metrics
  updateMetrics(type, count, duration) {
    this.metrics.totalWrites += count;
    
    if (type === 'bulk') {
      this.metrics.batchWrites += count;
    } else if (type === 'single') {
      this.metrics.singleWrites += count;
    }
    
    this.metrics.totalWriteTime += duration;
    this.metrics.avgWriteTime = this.metrics.totalWriteTime / this.metrics.totalWrites;
  }

  // Get performance metrics
  getMetrics() {
    return {
      ...this.metrics,
      queueLength: this.writeQueue.length,
      processing: this.processing,
      batchSize: this.batchSize,
      efficiency: this.metrics.totalWrites > 0 ? 
        (this.metrics.batchWrites / this.metrics.totalWrites * 100).toFixed(2) + '%' : '0%'
    };
  }

  // Flush write queue
  async flushQueue() {
    if (this.writeQueue.length > 0) {
      return await this.processWriteQueue();
    }
    return [];
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      totalWrites: 0,
      batchWrites: 0,
      singleWrites: 0,
      failedWrites: 0,
      avgWriteTime: 0,
      totalWriteTime: 0
    };
  }

  // Health check
  async healthCheck() {
    const metrics = this.getMetrics();
    
    return {
      status: 'healthy',
      queueLength: metrics.queueLength,
      processing: metrics.processing,
      avgWriteTime: metrics.avgWriteTime,
      efficiency: metrics.efficiency,
      failedWrites: metrics.failedWrites,
      recommendations: this.getRecommendations(metrics)
    };
  }

  // Get optimization recommendations
  getRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.queueLength > 50) {
      recommendations.push('Consider reducing batch size or processing queue more frequently');
    }
    
    if (metrics.avgWriteTime > 1000) {
      recommendations.push('Average write time is high, consider optimizing queries or increasing batch size');
    }
    
    if (parseFloat(metrics.efficiency) < 50) {
      recommendations.push('Low batch efficiency, consider batching more operations');
    }
    
    if (metrics.failedWrites > 0) {
      recommendations.push('Some writes failed, review error logs and improve error handling');
    }
    
    return recommendations;
  }
}

module.exports = DatabaseWriteOptimizer;
