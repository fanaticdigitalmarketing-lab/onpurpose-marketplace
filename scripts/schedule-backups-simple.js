// Simple backup scheduler for development
class BackupScheduler {
  start() {
    console.log('Backup scheduler started (development mode)');
  }
  
  stop() {
    console.log('Backup scheduler stopped');
  }
}

module.exports = BackupScheduler;
