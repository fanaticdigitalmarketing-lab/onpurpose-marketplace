const cron = require('node-cron');
const DatabaseBackup = require('./backup-database');

class BackupScheduler {
  constructor() {
    this.backup = new DatabaseBackup();
  }

  start() {
    // Schedule daily backups at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Starting scheduled backup...');
      await this.backup.scheduleBackup();
    });

    // Schedule weekly cleanup on Sundays at 3 AM
    cron.schedule('0 3 * * 0', async () => {
      console.log('Starting weekly backup cleanup...');
      await this.backup.cleanOldBackups(30); // Keep 30 days of backups
    });

    console.log('Backup scheduler started');
    console.log('Daily backups: 2:00 AM');
    console.log('Weekly cleanup: Sunday 3:00 AM');
  }
}

module.exports = BackupScheduler;
