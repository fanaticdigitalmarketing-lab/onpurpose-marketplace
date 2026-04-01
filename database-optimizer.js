// DATABASE OPTIMIZATION ENGINE - PRODUCTION LEVEL
// Ensures database is fast, efficient, and scalable under high traffic

const fs = require('fs');

class DatabaseOptimizer {
  constructor() {
    this.serverContent = fs.readFileSync('server.js', 'utf8');
    this.models = this.extractModels();
    this.queries = this.extractQueries();
    this.optimizations = [];
    this.indexes = [];
    this.n1Queries = [];
    this.slowQueries = [];
  }

  // Extract database models from server.js
  extractModels() {
    const models = {};
    
    // Find User model definition
    const userMatch = this.serverContent.match(/User\.init\(([\s\S]*?)\);/);
    if (userMatch) {
      models.User = {
        fields: this.extractFieldsFromInit(userMatch[1]),
        indexes: []
      };
    }
    
    // Find Service model definition
    const serviceMatch = this.serverContent.match(/Service\.init\(([\s\S]*?)\);/);
    if (serviceMatch) {
      models.Service = {
        fields: this.extractFieldsFromInit(serviceMatch[1]),
        indexes: []
      };
    }
    
    // Find Booking model definition
    const bookingMatch = this.serverContent.match(/Booking\.init\(([\s\S]*?)\);/);
    if (bookingMatch) {
      models.Booking = {
        fields: this.extractFieldsFromInit(bookingMatch[1]),
        indexes: []
      };
    }
    
    // Find Review model definition
    const reviewMatch = this.serverContent.match(/Review\.init\(([\s\S]*?)\);/);
    if (reviewMatch) {
      models.Review = {
        fields: this.extractFieldsFromInit(reviewMatch[1]),
        indexes: []
      };
    }
    
    return models;
  }

  // Extract fields from model init
  extractFieldsFromInit(initString) {
    const fields = {};
    const fieldMatches = initString.match(/(\w+):\s*{\s*type:\s*DataTypes\.(\w+)/g);
    
    if (fieldMatches) {
      fieldMatches.forEach(match => {
        const [fieldName, dataType] = match.split(':').map(s => s.trim());
        fields[fieldName] = dataType;
      });
    }
    
    return fields;
  }

  // Extract all database queries
  extractQueries() {
    const queries = [];
    
    // Find findAll queries
    const findAllMatches = this.serverContent.match(/\.findAll\(([\s\S]*?)\)/g);
    if (findAllMatches) {
      findAllMatches.forEach((match, index) => {
        queries.push({
          type: 'findAll',
          id: index,
          raw: match,
          optimized: false
        });
      });
    }
    
    // Find findByPk queries
    const findByPkMatches = this.serverContent.match(/\.findByPk\(([\s\S]*?)\)/g);
    if (findByPkMatches) {
      findByPkMatches.forEach((match, index) => {
        queries.push({
          type: 'findByPk',
          id: index,
          raw: match,
          optimized: true // findByPk is already optimized
        });
      });
    }
    
    // Find create queries
    const createMatches = this.serverContent.match(/\.create\(([\s\S]*?)\)/g);
    if (createMatches) {
      createMatches.forEach((match, index) => {
        queries.push({
          type: 'create',
          id: index,
          raw: match,
          optimized: false
        });
      });
    }
    
    // Find update queries
    const updateMatches = this.serverContent.match(/\.update\(([\s\S]*?)\)/g);
    if (updateMatches) {
      updateMatches.forEach((match, index) => {
        queries.push({
          type: 'update',
          id: index,
          raw: match,
          optimized: false
        });
      });
    }
    
    return queries;
  }

  // RULE 1: INDEX CRITICAL FIELDS
  analyzeCriticalIndexes() {
    console.log('🔍 ANALYZING CRITICAL DATABASE INDEXES...');
    
    const criticalIndexes = [
      // User table indexes
      { table: 'User', field: 'email', type: 'UNIQUE', priority: 'HIGH' },
      { table: 'User', field: 'id', type: 'PRIMARY', priority: 'HIGH' },
      { table: 'User', field: 'role', type: 'INDEX', priority: 'MEDIUM' },
      { table: 'User', field: 'createdAt', type: 'INDEX', priority: 'MEDIUM' },
      
      // Service table indexes
      { table: 'Service', field: 'providerId', type: 'INDEX', priority: 'HIGH' },
      { table: 'Service', field: 'category', type: 'INDEX', priority: 'MEDIUM' },
      { table: 'Service', field: 'isActive', type: 'INDEX', priority: 'MEDIUM' },
      { table: 'Service', field: 'createdAt', type: 'INDEX', priority: 'LOW' },
      
      // Booking table indexes
      { table: 'Booking', field: 'userId', type: 'INDEX', priority: 'HIGH' },
      { table: 'Booking', field: 'providerId', type: 'INDEX', priority: 'HIGH' },
      { table: 'Booking', field: 'serviceId', type: 'INDEX', priority: 'HIGH' },
      { table: 'Booking', field: 'status', type: 'INDEX', priority: 'MEDIUM' },
      { table: 'Booking', field: 'date', type: 'INDEX', priority: 'MEDIUM' },
      
      // Review table indexes
      { table: 'Review', field: 'serviceId', type: 'INDEX', priority: 'HIGH' },
      { table: 'Review', field: 'userId', type: 'INDEX', priority: 'MEDIUM' },
      { table: 'Review', field: 'rating', type: 'INDEX', priority: 'LOW' }
    ];
    
    // Check which indexes are missing
    const missingIndexes = [];
    
    criticalIndexes.forEach(index => {
      const model = this.models[index.table];
      if (!model || !model.fields[index.field]) {
        missingIndexes.push(index);
      }
    });
    
    console.log(`✅ Critical indexes analyzed: ${criticalIndexes.length} total`);
    console.log(`❌ Missing indexes: ${missingIndexes.length}`);
    
    missingIndexes.forEach(index => {
      console.log(`   - ${index.table}.${index.field} (${index.type})`);
    });
    
    this.indexes = criticalIndexes;
    return { total: criticalIndexes.length, missing: missingIndexes };
  }

  // RULE 2: DETECT N+1 QUERIES
  detectN1Queries() {
    console.log('\n🔍 DETECTING N+1 QUERY PATTERNS...');
    
    const n1Patterns = [];
    
    // Pattern 1: Loop with database query
    const loopPattern = /for\s*\([^)]*\)\s*{[\s\S]*?await.*\.(find|create|update|delete)/g;
    const loopMatches = this.serverContent.match(loopPattern);
    
    if (loopMatches) {
      loopMatches.forEach((match, index) => {
        n1Patterns.push({
          type: 'LOOP_QUERY',
          pattern: 'Database query inside loop',
          location: `Line ${this.getLineNumber(match)}`,
          code: match.substring(0, 100) + '...',
          severity: 'HIGH'
        });
      });
    }
    
    // Pattern 2: Multiple similar queries in sequence
    const queryPattern = /await.*\.(find|create|update|delete)/g;
    const queryMatches = this.serverContent.match(queryPattern);
    
    if (queryMatches && queryMatches.length > 5) {
      // Check if there are multiple similar queries
      const similarQueries = this.findSimilarQueries(queryMatches);
      similarQueries.forEach(similar => {
        n1Patterns.push({
          type: 'MULTIPLE_SIMILAR_QUERIES',
          pattern: 'Multiple similar queries detected',
          count: similar.count,
          location: `Line ${this.getLineNumber(similar.example)}`,
          example: similar.example.substring(0, 100) + '...',
          severity: 'MEDIUM'
        });
      });
    }
    
    // Pattern 3: Missing eager loading
    const findAllQueries = this.queries.filter(q => q.type === 'findAll');
    const queriesWithoutIncludes = findAllQueries.filter(q => !q.raw.includes('include:'));
    
    queriesWithoutIncludes.forEach(query => {
      n1Patterns.push({
        type: 'MISSING_EAGER_LOADING',
        pattern: 'findAll without include',
        location: `Query ${query.id}`,
        code: query.raw.substring(0, 100) + '...',
        severity: 'MEDIUM'
      });
    });
    
    console.log(`✅ N+1 patterns analyzed: ${n1Patterns.length} found`);
    
    n1Patterns.forEach(pattern => {
      console.log(`   ${pattern.severity === 'HIGH' ? '🚨' : '⚠️'} ${pattern.type}: ${pattern.pattern}`);
      if (pattern.location) console.log(`      Location: ${pattern.location}`);
    });
    
    this.n1Queries = n1Patterns;
    return n1Patterns;
  }

  // Find similar queries
  findSimilarQueries(queryMatches) {
    const similarGroups = {};
    
    queryMatches.forEach((query, index) => {
      // Extract query type (find, create, update, delete)
      const queryType = query.match(/\.(\w+)/)?.[1];
      
      if (queryType) {
        if (!similarGroups[queryType]) {
          similarGroups[queryType] = [];
        }
        similarGroups[queryType].push({ query, index });
      }
    });
    
    const similarQueries = [];
    Object.entries(similarGroups).forEach(([type, queries]) => {
      if (queries.length > 3) {
        similarQueries.push({
          type,
          count: queries.length,
          example: queries[0].query
        });
      }
    });
    
    return similarQueries;
  }

  // RULE 3: ANALYZE DATA LIMITING
  analyzeDataLimiting() {
    console.log('\n🔍 ANALYZING DATA LIMITING...');
    
    const limitingIssues = [];
    
    // Check for findAll without limit
    const findAllQueries = this.queries.filter(q => q.type === 'findAll');
    const queriesWithoutLimit = findAllQueries.filter(q => !q.raw.includes('limit:') && !q.raw.includes('LIMIT'));
    
    queriesWithoutLimit.forEach(query => {
      limitingIssues.push({
        type: 'MISSING_LIMIT',
        pattern: 'findAll without limit',
        location: `Query ${query.id}`,
        code: query.raw.substring(0, 100) + '...',
        severity: 'HIGH'
      });
    });
    
    // Check for select all fields
    const queriesWithSelectAll = this.queries.filter(q => q.raw.includes('attributes: []') || q.raw.includes('attributes: [[]]'));
    
    queriesWithSelectAll.forEach(query => {
      limitingIssues.push({
        type: 'SELECT_ALL_FIELDS',
        pattern: 'Query selecting all fields',
        location: `Query ${query.id}`,
        code: query.raw.substring(0, 100) + '...',
        severity: 'MEDIUM'
      });
    });
    
    // Check for missing pagination
    const queriesWithoutPagination = findAllQueries.filter(q => !q.raw.includes('offset:') && !q.raw.includes('limit:'));
    
    queriesWithoutPagination.forEach(query => {
      limitingIssues.push({
        type: 'MISSING_PAGINATION',
        pattern: 'Query without pagination',
        location: `Query ${query.id}`,
        code: query.raw.substring(0, 100) + '...',
        severity: 'MEDIUM'
      });
    });
    
    console.log(`✅ Data limiting analyzed: ${limitingIssues.length} issues found`);
    
    limitingIssues.forEach(issue => {
      console.log(`   ${issue.severity === 'HIGH' ? '🚨' : '⚠️'} ${issue.type}: ${issue.pattern}`);
      console.log(`      Location: ${issue.location}`);
    });
    
    return limitingIssues;
  }

  // RULE 4: QUERY OPTIMIZATION ANALYSIS
  analyzeQueryOptimization() {
    console.log('\n🔍 ANALYZING QUERY OPTIMIZATION...');
    
    const optimizationIssues = [];
    
    // Check for queries without where clauses
    const findAllQueries = this.queries.filter(q => q.type === 'findAll');
    const queriesWithoutWhere = findAllQueries.filter(q => !q.raw.includes('where:'));
    
    queriesWithoutWhere.forEach(query => {
      optimizationIssues.push({
        type: 'MISSING_WHERE_CLAUSE',
        pattern: 'Query without filtering',
        impact: 'Full table scan',
        location: `Query ${query.id}`,
        code: query.raw.substring(0, 100) + '...',
        severity: 'HIGH'
      });
    });
    
    // Check for missing indexes usage
    const queriesWithWhere = findAllQueries.filter(q => q.raw.includes('where:'));
    
    queriesWithWhere.forEach(query => {
      const whereClause = query.raw.match(/where:\s*{([^}]*)}/);
      if (whereClause) {
        const fields = Object.keys(JSON.parse(`{${whereClause[1]}}`));
        fields.forEach(field => {
          if (!this.hasIndex(field)) {
            optimizationIssues.push({
              type: 'MISSING_INDEX',
              pattern: `Query using unindexed field: ${field}`,
              impact: 'Slow query performance',
              location: `Query ${query.id}`,
              field: field,
              severity: 'HIGH'
            });
          }
        });
      }
    });
    
    // Check for expensive operations
    const expensivePatterns = [
      { pattern: /ORDER BY.*RAND()/, type: 'RANDOM_ORDER', severity: 'HIGH' },
      { pattern: /LIKE.*%.*%/, type: 'WILDCARD_SEARCH', severity: 'HIGH' },
      { pattern: /OR.*OR/, type: 'MULTIPLE_OR', severity: 'MEDIUM' }
    ];
    
    expensivePatterns.forEach(({ pattern, type, severity }) => {
      const matches = this.serverContent.match(pattern);
      if (matches) {
        optimizationIssues.push({
          type,
          pattern: `Expensive query pattern: ${type}`,
          impact: 'Performance degradation',
          count: matches.length,
          severity
        });
      }
    });
    
    console.log(`✅ Query optimization analyzed: ${optimizationIssues.length} issues found`);
    
    optimizationIssues.forEach(issue => {
      console.log(`   ${issue.severity === 'HIGH' ? '🚨' : '⚠️'} ${issue.type}: ${issue.pattern}`);
      console.log(`      Impact: ${issue.impact}`);
      if (issue.field) console.log(`      Field: ${issue.field}`);
    });
    
    this.slowQueries = optimizationIssues;
    return optimizationIssues;
  }

  // Check if field has index
  hasIndex(field) {
    return this.indexes.some(index => index.field === field);
  }

  // Get line number for code snippet
  getLineNumber(code) {
// // // // // // // // // // // // // // // // // // const lines = this.serverContent.split('\n'); // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
    const index = this.serverContent.indexOf(code);
    if (index === -1) return 'Unknown';
    
    const beforeMatch = this.serverContent.substring(0, index);
    return beforeMatch.split('\n').length;
  }

  // Generate optimization recommendations
  generateOptimizationPlan() {
    console.log('\n🔧 GENERATING DATABASE OPTIMIZATION PLAN...');
    
    const plan = {
      indexes: [],
      queryFixes: [],
      optimizations: [],
      cacheStrategies: [],
      connectionPool: {
        min: 5,
        max: 20,
        acquire: 30000,
        idle: 10000
      }
    };
    
    // Index recommendations
    this.indexes.forEach(index => {
      plan.indexes.push({
        table: index.table,
        field: index.field,
        type: index.type,
        priority: index.priority,
        sql: this.generateIndexSQL(index)
      });
    });
    
    // N+1 query fixes
    this.n1Queries.forEach(query => {
      plan.queryFixes.push({
        type: query.type,
        pattern: query.pattern,
        solution: this.getN1Solution(query),
        priority: query.severity
      });
    });
    
    // Query optimizations
    this.slowQueries.forEach(query => {
      plan.optimizations.push({
        type: query.type,
        pattern: query.pattern,
        solution: this.getOptimizationSolution(query),
        priority: query.severity
      });
    });
    
    // Cache strategies
    plan.cacheStrategies = [
      { table: 'User', fields: ['id', 'email', 'role'], ttl: 3600 },
      { table: 'Service', fields: ['id', 'providerId', 'category'], ttl: 1800 },
      { table: 'Booking', fields: ['id', 'userId', 'status'], ttl: 900 },
      { endpoint: '/api/services', ttl: 300 },
      { endpoint: '/api/ideas/trending', ttl: 600 }
    ];
    
    return plan;
  }

  // Generate SQL for index creation
  generateIndexSQL(index) {
    const indexName = `idx_${index.table}_${index.field}`;
    const uniqueClause = index.type === 'UNIQUE' ? 'UNIQUE ' : '';
    
    return `CREATE ${uniqueClause}INDEX ${indexName} ON ${index.table} (${index.field});`;
  }

  // Get solution for N+1 query
  getN1Solution(query) {
    switch (query.type) {
      case 'LOOP_QUERY':
        return 'Replace loop with single query using includes or bulk operations';
      case 'MULTIPLE_SIMILAR_QUERIES':
        return 'Use Promise.all or batch operations to reduce round trips';
      case 'MISSING_EAGER_LOADING':
        return 'Add include option to load related data in single query';
      default:
        return 'Optimize query to reduce database round trips';
    }
  }

  // Get solution for optimization
  getOptimizationSolution(query) {
    switch (query.type) {
      case 'MISSING_WHERE_CLAUSE':
        return 'Add where clause to limit results and use index';
      case 'MISSING_INDEX':
        return 'Create index on frequently queried field';
      case 'RANDOM_ORDER':
        return 'Avoid ORDER BY RAND(), use indexed random selection';
      case 'WILDCARD_SEARCH':
        return 'Use full-text search or prefix matching instead of wildcards';
      case 'MULTIPLE_OR':
        return 'Use IN clause or union instead of multiple OR conditions';
      default:
        return 'Optimize query structure and add appropriate indexes';
    }
  }

  // Generate comprehensive optimization report
  generateOptimizationReport() {
    console.log('\n📊 DATABASE OPTIMIZATION REPORT');
    console.log('===============================');
    
    // Run all analyses
    const indexAnalysis = this.analyzeCriticalIndexes();
    const n1Analysis = this.detectN1Queries();
    const limitingAnalysis = this.analyzeDataLimiting();
    const optimizationAnalysis = this.analyzeQueryOptimization();
    
    // Generate optimization plan
    const plan = this.generateOptimizationPlan();
    
    // Calculate overall score
    const totalIssues = indexAnalysis.missing + n1Analysis.length + limitingAnalysis.length + optimizationAnalysis.length;
    const criticalIssues = n1Analysis.filter(q => q.severity === 'HIGH').length + 
                           limitingAnalysis.filter(q => q.severity === 'HIGH').length + 
                           optimizationAnalysis.filter(q => q.severity === 'HIGH').length;
    
    let overallGrade;
    if (totalIssues === 0) {
      overallGrade = 'A+ (OPTIMIZED)';
    } else if (criticalIssues === 0) {
      overallGrade = 'B (GOOD)';
    } else if (criticalIssues <= 3) {
      overallGrade = 'C (NEEDS WORK)';
    } else {
      overallGrade = 'D (REQUIRES OPTIMIZATION)';
    }
    
    console.log('\n📈 OPTIMIZATION SUMMARY:');
    console.log(`   Missing Indexes: ${indexAnalysis.missing}`);
    console.log(`   N+1 Queries: ${n1Analysis.length}`);
    console.log(`   Data Limiting Issues: ${limitingAnalysis.length}`);
    console.log(`   Query Optimization Issues: ${optimizationAnalysis.length}`);
    console.log(`   Critical Issues: ${criticalIssues}`);
    console.log(`   Overall Grade: ${overallGrade}`);
    
    // Display optimization plan
    console.log('\n🔧 OPTIMIZATION PLAN:');
    
    console.log('\n📋 INDEXES TO CREATE:');
    plan.indexes.forEach((index, i) => {
      const priority = index.priority === 'HIGH' ? '🔴' : index.priority === 'MEDIUM' ? '🟡' : '🟢';
      console.log(`   ${i + 1}. ${priority} ${index.table}.${index.field} (${index.type})`);
      console.log(`      SQL: ${index.sql}`);
    });
    
    console.log('\n📋 QUERY FIXES:');
    plan.queryFixes.forEach((fix, i) => {
      const priority = fix.priority === 'HIGH' ? '🔴' : fix.priority === 'MEDIUM' ? '🟡' : '🟢';
      console.log(`   ${i + 1}. ${priority} ${fix.type}: ${fix.solution}`);
    });
    
    console.log('\n📋 OPTIMIZATIONS:');
    plan.optimizations.forEach((opt, i) => {
      const priority = opt.priority === 'HIGH' ? '🔴' : opt.priority === 'MEDIUM' ? '🟡' : '🟢';
      console.log(`   ${i + 1}. ${priority} ${opt.type}: ${opt.solution}`);
    });
    
    console.log('\n📋 CACHE STRATEGIES:');
    plan.cacheStrategies.forEach((cache, i) => {
      if (cache.table) {
        console.log(`   ${i + 1}. ${cache.table} fields: ${cache.fields.join(', ')} (TTL: ${cache.ttl}s)`);
      } else {
        console.log(`   ${i + 1}. ${cache.endpoint} (TTL: ${cache.ttl}s)`);
      }
    });
    
    console.log('\n📋 CONNECTION POOL:');
    console.log(`   Min: ${plan.connectionPool.min}, Max: ${plan.connectionPool.max}`);
    console.log(`   Acquire: ${plan.connectionPool.acquire}ms, Idle: ${plan.connectionPool.idle}ms`);
    
    return {
      totalIssues,
      criticalIssues,
      overallGrade,
      plan,
      analyses: {
        indexes: indexAnalysis,
        n1Queries: n1Analysis,
        limiting: limitingAnalysis,
        optimization: optimizationAnalysis
      }
    };
  }
}

// Run the database optimization analysis
const optimizer = new DatabaseOptimizer();
const report = optimizer.generateOptimizationReport();

console.log('\n🎯 DATABASE OPTIMIZATION COMPLETE');
console.log('===============================');
console.log(`Overall Grade: ${report.overallGrade}`);
console.log(`Critical Issues: ${report.criticalIssues}`);
console.log(`Next Step: Implement optimization plan for production performance`);
