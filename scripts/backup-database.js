const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class DatabaseBackup {
  constructor() {
    this.backupDir = path.join(__dirname, '..', 'backups');
    this.ensureBackupDirectory();
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `onpurpose_backup_${timestamp}.sql`;
    const backupPath = path.join(this.backupDir, backupFileName);

    const command = `pg_dump "${process.env.DATABASE_URL}" > "${backupPath}"`;

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Backup failed:', error);
          reject(error);
          return;
        }

        if (stderr) {
          console.warn('Backup warnings:', stderr);
        }

        console.log(`Backup created successfully: ${backupFileName}`);
        resolve(backupPath);
      });
    });
  }

  async restoreBackup(backupPath) {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    const command = `psql "${process.env.DATABASE_URL}" < "${backupPath}"`;

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Restore failed:', error);
          reject(error);
          return;
        }

        if (stderr) {
          console.warn('Restore warnings:', stderr);
        }

        console.log('Database restored successfully');
        resolve();
      });
    });
  }

  async cleanOldBackups(daysToKeep = 7) {
    const files = fs.readdirSync(this.backupDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old backup: ${file}`);
        }
      }
    }
  }

  async scheduleBackup() {
    try {
      await this.createBackup();
      await this.cleanOldBackups();
      console.log('Scheduled backup completed successfully');
    } catch (error) {
      console.error('Scheduled backup failed:', error);
    }
  }
}

// If run directly, create a backup
if (require.main === module) {
  const backup = new DatabaseBackup();
  backup.createBackup()
    .then(() => {
      console.log('Manual backup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Manual backup failed:', error);
      process.exit(1);
    });
}

module.exports = DatabaseBackup;
