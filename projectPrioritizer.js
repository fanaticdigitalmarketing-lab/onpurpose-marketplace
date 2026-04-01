const fs = require('fs');

const PROJECTS_FILE = 'projects.json';

function loadProjects() {
  if (!fs.existsSync(PROJECTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'));
}

function scoreProject(project) {
  let score = 0;

  // Traffic weight
  score += (project.users || 0) * 0.4;

  // Revenue weight
  score += (project.revenue || 0) * 0.4;

  // Growth weight
  score += (project.growth || 0) * 0.2;

  return score;
}

function pickBestProject() {
  const projects = loadProjects();

  const scored = projects.map(p => ({
    ...p,
    score: scoreProject(p)
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored[0];
}

module.exports = { pickBestProject };
