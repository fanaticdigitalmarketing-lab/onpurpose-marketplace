const fs = require('fs');

const MULTI_REPO_MEMORY_FILE = 'multi-repo-brain.json';

function loadMultiRepoBrain() {
  if (!fs.existsSync(MULTI_REPO_MEMORY_FILE)) {
    return {
      repositories: {},
      globalPatterns: {},
      crossRepoLearnings: [],
      successMetrics: {
        totalFixes: 0,
        successfulFixes: 0,
        failedFixes: 0,
        successRate: 0
      }
    };
  }
  return JSON.parse(fs.readFileSync(MULTI_REPO_MEMORY_FILE, 'utf8'));
}

function saveMultiRepoBrain(brain) {
  fs.writeFileSync(MULTI_REPO_MEMORY_FILE, JSON.stringify(brain, null, 2));
}

function learnFromFix(fix) {
  const brain = loadMultiRepoBrain();
  
  const repo = fix.repository || 'default';
  const type = fix.error.type;
  
  // Initialize repository if not exists
  if (!brain.repositories[repo]) {
    brain.repositories[repo] = {
      issues: {},
      learnings: [],
      lastUpdated: new Date().toISOString()
    };
  }
  
  // Track issue frequency per repository
  brain.repositories[repo].issues[type] = (brain.repositories[repo].issues[type] || 0) + 1;
  
  // Track global patterns across repositories
  brain.globalPatterns[type] = (brain.globalPatterns[type] || 0) + 1;
  
  // Store successful patterns
  if (fix.success) {
    const learning = {
      repository: repo,
      type,
      file: fix.file,
      method: fix.method || 'unknown',
      timestamp: new Date().toISOString(),
      duration: fix.duration || 0
    };
    
    brain.repositories[repo].learnings.push(learning);
    brain.crossRepoLearnings.push(learning);
    
    // Update success metrics
    brain.successMetrics.totalFixes++;
    brain.successMetrics.successfulFixes++;
  } else {
    // Track failed fixes
    brain.successMetrics.totalFixes++;
    brain.successMetrics.failedFixes++;
  }
  
  // Calculate success rate
  brain.successMetrics.successRate = brain.successMetrics.totalFixes > 0 
    ? (brain.successMetrics.successfulFixes / brain.successMetrics.totalFixes * 100).toFixed(1)
    : 0;
  
  // Update repository timestamp
  brain.repositories[repo].lastUpdated = new Date().toISOString();
  
  saveMultiRepoBrain(brain);
}

function getTopIssuesByRepo() {
  const brain = loadMultiRepoBrain();
  const results = {};
  
  Object.keys(brain.repositories).forEach(repo => {
    results[repo] = Object.entries(brain.repositories[repo].issues)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  });
  
  return results;
}

function getGlobalTopIssues() {
  const brain = loadMultiRepoBrain();
  return Object.entries(brain.globalPatterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
}

function getCrossRepoInsights() {
  const brain = loadMultiRepoBrain();
  
  // Find patterns that appear across multiple repositories
  const crossRepoPatterns = {};
  
  Object.keys(brain.repositories).forEach(repo => {
    Object.keys(brain.repositories[repo].issues).forEach(issueType => {
      if (!crossRepoPatterns[issueType]) {
        crossRepoPatterns[issueType] = [];
      }
      crossRepoPatterns[issueType].push(repo);
    });
  });
  
  // Filter to patterns that appear in multiple repos
  const multiRepoPatterns = Object.entries(crossRepoPatterns)
    .filter(([repos]) => repos.length > 1)
    .map(([issueType, repos]) => ({
      issueType,
      repositoryCount: repos.length,
      repositories: repos
    }))
    .sort((a, b) => b.repositoryCount - a.repositoryCount);
  
  return multiRepoPatterns;
}

function getRepositoryStats(repo) {
  const brain = loadMultiRepoBrain();
  const repoData = brain.repositories[repo];
  
  if (!repoData) {
    return null;
  }
  
  const totalIssues = Object.values(repoData.issues).reduce((sum, count) => sum + count, 0);
  const successfulLearnings = repoData.learnings.length;
  
  return {
    repository: repo,
    totalIssues,
    uniqueIssueTypes: Object.keys(repoData.issues).length,
    successfulLearnings,
    lastUpdated: repoData.lastUpdated,
    topIssues: Object.entries(repoData.issues)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
  };
}

function getAllRepositoryStats() {
  const brain = loadMultiRepoBrain();
  const stats = {};
  
  Object.keys(brain.repositories).forEach(repo => {
    stats[repo] = getRepositoryStats(repo);
  });
  
  return stats;
}

function getSuccessMetrics() {
  const brain = loadMultiRepoBrain();
  return brain.successMetrics;
}

module.exports = {
  learnFromFix,
  getTopIssuesByRepo,
  getGlobalTopIssues,
  getCrossRepoInsights,
  getRepositoryStats,
  getAllRepositoryStats,
  getSuccessMetrics
};
