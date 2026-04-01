// 🧠 PLANNER AGENT
// Understands problems and assigns tasks to specialized agents

class PlannerAgent {
  constructor() {
    this.priorityRules = {
      critical: 100,
      high: 80,
      medium: 60,
      low: 40,
      predicted: 90
    };
  }

  planTasks(issues, predictions) {
    console.log('🧠 PLANNER AGENT - Creating task assignments');
    
    const allIssues = [...issues, ...predictions];
    const tasks = [];
    
    // Sort by priority
    allIssues.sort((a, b) => this.calculatePriority(b) - this.calculatePriority(a));
    
    allIssues.forEach((issue, index) => {
      const task = this.createTask(issue, index);
      tasks.push(task);
    });
    
    console.log(`📋 Planned ${tasks.length} tasks for agent execution`);
    
    return tasks;
  }

  calculatePriority(issue) {
    let basePriority = 50;
    
    // Severity-based priority
    if (issue.severity === 'critical') {
      basePriority = this.priorityRules.critical;
    } else if (issue.severity === 'high') {
      basePriority = this.priorityRules.high;
    } else if (issue.severity === 'medium') {
      basePriority = this.priorityRules.medium;
    } else if (issue.severity === 'low') {
      basePriority = this.priorityRules.low;
    }
    
    // Predicted issues get higher priority
    if (issue.probability !== undefined) {
      basePriority = Math.max(basePriority, this.priorityRules.predicted);
      basePriority += issue.probability * 10; // Boost by probability
    }
    
    // File-based priority
    if (issue.file === 'server.js') {
      basePriority += 20; // Server files are critical
    } else if (issue.file.includes('index.html')) {
      basePriority += 10; // Frontend files are important
    }
    
    // Issue type priority
    const issueTypePriority = {
      'missing_try_catch': 25,
      'security_vulnerability': 30,
      'missing_form_validation': 15,
      'console_error': 10,
      'missing_charset': 5
    };
    
    if (issueTypePriority[issue.type]) {
      basePriority += issueTypePriority[issue.type];
    }
    
    return Math.min(100, basePriority);
  }

  createTask(issue, index) {
    const priority = this.calculatePriority(issue);
    const strategy = this.determineStrategy(issue, priority);
    const assignedAgent = this.assignAgent(issue, priority);
    
    return {
      id: `task_${index + 1}`,
      issue: {
        type: issue.type,
        file: issue.file,
        description: issue.description,
        severity: issue.severity || 'medium',
        probability: issue.probability,
        lineNumbers: issue.lineNumbers
      },
      priority: priority,
      assignedAgent: assignedAgent,
      strategy: strategy,
      dependencies: this.identifyDependencies(issue),
      estimatedComplexity: this.estimateComplexity(issue),
      deadline: this.calculateDeadline(priority),
      status: 'planned'
    };
  }

  determineStrategy(issue, priority) {
    const strategies = {
      critical: {
        approach: 'immediate_fix',
        validation: 'strict',
        testing: 'comprehensive',
        deployment: 'manual_review'
      },
      high: {
        approach: 'ai_generated_fix',
        validation: 'standard',
        testing: 'automated',
        deployment: 'auto_merge_if_safe'
      },
      medium: {
        approach: 'ai_generated_fix',
        validation: 'standard',
        testing: 'automated',
        deployment: 'auto_merge'
      },
      low: {
        approach: 'template_fix',
        validation: 'basic',
        testing: 'minimal',
        deployment: 'auto_merge'
      }
    };
    
    let strategyLevel = 'medium';
    if (priority >= 90) strategyLevel = 'critical';
    else if (priority >= 70) strategyLevel = 'high';
    else if (priority >= 50) strategyLevel = 'medium';
    else strategyLevel = 'low';
    
    return strategies[strategyLevel];
  }

  assignAgent(issue, priority) {
    // Primary assignment based on issue type and priority
    if (priority >= 90) {
      return 'fixer'; // Critical issues go directly to fixer
    }
    
    // Issue type-based assignment
    const agentMapping = {
      'missing_try_catch': 'fixer',
      'security_vulnerability': 'fixer',
      'missing_form_validation': 'fixer',
      'console_error': 'fixer',
      'missing_charset': 'fixer',
      'api_error_handling': 'fixer',
      'hardcoded_secrets': 'fixer'
    };
    
    return agentMapping[issue.type] || 'fixer';
  }

  identifyDependencies(issue) {
    const dependencies = [];
    
    // File dependencies
    if (issue.file === 'server.js') {
      dependencies.push('package.json');
      dependencies.push('database connection');
    }
    
    // Issue type dependencies
    if (issue.type === 'missing_try_catch') {
      dependencies.push('error handling middleware');
    }
    
    if (issue.type === 'missing_form_validation') {
      dependencies.push('frontend validation library');
    }
    
    return dependencies;
  }

  estimateComplexity(issue) {
    const complexityMap = {
      'missing_try_catch': 'low',
      'missing_form_validation': 'low',
      'console_error': 'low',
      'missing_charset': 'low',
      'security_vulnerability': 'high',
      'api_error_handling': 'medium',
      'hardcoded_secrets': 'medium'
    };
    
    return complexityMap[issue.type] || 'medium';
  }

  calculateDeadline(priority) {
    const deadlines = {
      critical: 'immediate',
      high: '1 hour',
      medium: '4 hours',
      low: '1 day'
    };
    
    let deadlineLevel = 'medium';
    if (priority >= 90) deadlineLevel = 'critical';
    else if (priority >= 70) deadlineLevel = 'high';
    else if (priority >= 50) deadlineLevel = 'medium';
    else deadlineLevel = 'low';
    
    return deadlines[deadlineLevel];
  }

  optimizeTaskOrder(tasks) {
    // Sort by priority first, then by dependencies
    const sorted = [...tasks].sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      // Fewer dependencies first
      return a.dependencies.length - b.dependencies.length;
    });
    
    return sorted;
  }

  generateTaskSummary(tasks) {
    const summary = {
      total: tasks.length,
      byPriority: {
        critical: tasks.filter(t => t.priority >= 90).length,
        high: tasks.filter(t => t.priority >= 70 && t.priority < 90).length,
        medium: tasks.filter(t => t.priority >= 50 && t.priority < 70).length,
        low: tasks.filter(t => t.priority < 50).length
      },
      byAgent: this.groupByAgent(tasks),
      byComplexity: this.groupByComplexity(tasks),
      estimatedTime: this.estimateTotalTime(tasks)
    };
    
    return summary;
  }

  groupByAgent(tasks) {
    const grouped = {};
    
    tasks.forEach(task => {
      if (!grouped[task.assignedAgent]) {
        grouped[task.assignedAgent] = 0;
      }
      grouped[task.assignedAgent]++;
    });
    
    return grouped;
  }

  groupByComplexity(tasks) {
    const grouped = {
      low: 0,
      medium: 0,
      high: 0
    };
    
    tasks.forEach(task => {
      grouped[task.estimatedComplexity]++;
    });
    
    return grouped;
  }

  estimateTotalTime(tasks) {
    const timeEstimates = {
      low: 15,    // minutes
      medium: 45,
      high: 120
    };
    
    let totalMinutes = 0;
    
    tasks.forEach(task => {
      totalMinutes += timeEstimates[task.estimatedComplexity] || 45;
    });
    
    return {
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      estimatedCompletion: new Date(Date.now() + totalMinutes * 60 * 1000).toISOString()
    };
  }

  updatePlanBasedOnResults(tasks, results) {
    console.log('🧠 PLANNER AGENT - Updating plan based on results');
    
    // Update task statuses based on results
    results.forEach(result => {
      const task = tasks.find(t => t.id === result.taskId);
      if (task) {
        task.status = result.success ? 'completed' : 'failed';
        task.actualComplexity = result.complexity;
        task.actualTime = result.timeSpent;
        task.issues = result.issues || [];
      }
    });
    
    // Re-plan any failed tasks with different strategy
    const failedTasks = tasks.filter(t => t.status === 'failed');
    const replannedTasks = [];
    
    failedTasks.forEach(task => {
      const newStrategy = this.alternativeStrategy(task);
      if (newStrategy) {
        const newTask = {
          ...task,
          id: `${task.id}_retry`,
          strategy: newStrategy,
          status: 'planned',
          retryCount: (task.retryCount || 0) + 1
        };
        replannedTasks.push(newTask);
      }
    });
    
    return {
      updatedTasks: tasks,
      replannedTasks: replannedTasks
    };
  }

  alternativeStrategy(failedTask) {
    const alternativeStrategies = {
      'immediate_fix': 'template_fix',
      'ai_generated_fix': 'manual_review_fix',
      'template_fix': 'human_intervention'
    };
    
    // Don't retry more than 2 times
    if (failedTask.retryCount >= 2) {
      return null;
    }
    
    return alternativeStrategies[failedTask.strategy.approach] || 'human_intervention';
  }
}

module.exports = PlannerAgent;
