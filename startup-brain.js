const { pickBestProject } = require('./projectPrioritizer');

/**
 * Startup Brain - Intelligent project focus system
 * Integrates project prioritization with autonomous decision making
 */

// Re-export the core function
const { pickBestProject: _pickBestProject } = require('./projectPrioritizer');

// Enhanced version with startup-specific logic
function pickBestProject() {
  const project = _pickBestProject();
  
  if (!project) {
    return {
      name: "No projects available",
      score: 0,
      recommendation: "Add projects to projects.json to enable prioritization"
    };
  }
  
  // Add startup-specific recommendations
  project.recommendation = generateRecommendation(project);
  project.focusArea = identifyFocusArea(project);
  project.priority = calculatePriority(project);
  
  return project;
}

function generateRecommendation(project) {
  const { users, revenue, growth } = project;
  
  if (revenue > 400) {
    return "Focus on scaling revenue streams and user retention";
  } else if (growth > 15) {
    return "Invest in growth acceleration and market expansion";
  } else if (users > 200) {
    return "Optimize user experience and increase engagement";
  } else {
    return "Focus on user acquisition and product development";
  }
}

function identifyFocusArea(project) {
  const { users, revenue, growth } = project;
  
  const areas = [];
  
  if (users < 150) areas.push("User Acquisition");
  if (revenue < 300) areas.push("Revenue Optimization");
  if (growth < 12) areas.push("Growth Strategy");
  
  return areas.length > 0 ? areas : "Scale Operations";
}

function calculatePriority(project) {
  const score = project.score;
  
  if (score > 200) return "HIGH";
  if (score > 100) return "MEDIUM";
  return "LOW";
}

function getStartupInsights() {
  const project = pickBestProject();
  
  return {
    focusProject: project.name,
    priority: project.priority,
    focusArea: project.focusArea,
    recommendation: project.recommendation,
    metrics: {
      users: project.users,
      revenue: project.revenue,
      growth: project.growth,
      score: project.score
    },
    timestamp: new Date().toISOString()
  };
}

function executeFocusStrategy() {
  const insights = getStartupInsights();
  
  console.log("🚀 Startup Brain Analysis:");
  console.log("========================");
  console.log(`📊 Focus Project: ${insights.focusProject}`);
  console.log(`🎯 Priority: ${insights.priority}`);
  console.log(`🔍 Focus Area: ${insights.focusArea}`);
  console.log(`💡 Recommendation: ${insights.recommendation}`);
  console.log(`📈 Metrics: Users ${insights.metrics.users}, Revenue $${insights.metrics.revenue}, Growth ${insights.metrics.growth}%`);
  console.log(`⏰ Analysis Time: ${insights.timestamp}`);
  
  return insights;
}

module.exports = {
  pickBestProject,
  getStartupInsights,
  executeFocusStrategy
};
