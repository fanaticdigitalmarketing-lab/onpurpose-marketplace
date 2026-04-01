const fs = require('fs');

const GLOBAL_MEMORY_FILE = 'global-brain.json';

function loadBrain() {
  if (!fs.existsSync(GLOBAL_MEMORY_FILE)) {
    return {
      rules: [],
      issues: {},
      learnings: []
    };
  }
  return JSON.parse(fs.readFileSync(GLOBAL_MEMORY_FILE, 'utf8'));
}

function saveBrain(brain) {
  fs.writeFileSync(GLOBAL_MEMORY_FILE, JSON.stringify(brain, null, 2));
}

function learnFromFix(fix) {
  const brain = loadBrain();

  const type = fix.error.type;

  // Track issue frequency
  brain.issues[type] = (brain.issues[type] || 0) + 1;

  // Store successful patterns
  if (fix.success) {
    brain.learnings.push({
      type,
      file: fix.file,
      timestamp: new Date().toISOString()
    });
  }

  saveBrain(brain);
}

function getTopIssues() {
  const brain = loadBrain();
  return Object.entries(brain.issues)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

module.exports = {
  learnFromFix,
  getTopIssues
};
