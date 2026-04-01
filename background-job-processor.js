// BACKGROUND JOB PROCESSOR - AUTO-SCALING ENFORCEMENT
// Moves heavy operations to background processing for unlimited scalability

const EventEmitter = require('events');

class BackgroundJobProcessor extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map(); // jobId -> job data
    this.queues = {
      email: [],
      ideaGeneration: [],
      payment: [],
      imageProcessing: [],
      reportGeneration: []
    };
    this.processing = false;
    this.concurrency = 5; // Max concurrent jobs
    this.activeJobs = 0;
    this.jobIdCounter = 0;
    
    // Start processing loop
    this.startProcessing();
  }

  // Generate unique job ID
  generateJobId() {
    return `job_${Date.now()}_${++this.jobIdCounter}`;
  }

  // Add job to queue
  addJob(type, data, priority = 'normal') {
    const jobId = this.generateJobId();
    const job = {
      id: jobId,
      type: type,
      data: data,
      priority: priority,
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3
    };

    this.jobs.set(jobId, job);
    
    // Add to appropriate queue
    if (this.queues[type]) {
      if (priority === 'high') {
        this.queues[type].unshift(job);
      } else {
        this.queues[type].push(job);
      }
    } else {
      console.error(`Unknown job type: ${type}`);
      return null;
    }

    console.log(`[BackgroundJob] Added ${type} job: ${jobId}`);
    this.emit('jobAdded', job);
    
    return jobId;
  }

  // Start background processing
  startProcessing() {
    setInterval(() => {
      if (!this.processing && this.activeJobs < this.concurrency) {
        this.processNextJob();
      }
    }, 100); // Check every 100ms
  }

  // Process next available job
  async processNextJob() {
    if (this.activeJobs >= this.concurrency) return;

    // Find next job across all queues (priority order)
    let nextJob = null;
    let jobType = null;

    const queueOrder = ['email', 'ideaGeneration', 'payment', 'imageProcessing', 'reportGeneration'];
    
    for (const type of queueOrder) {
      if (this.queues[type].length > 0) {
        nextJob = this.queues[type].shift();
        jobType = type;
        break;
      }
    }

    if (!nextJob) return;

    this.activeJobs++;
    this.processing = true;
    
    console.log(`[BackgroundJob] Processing ${jobType} job: ${nextJob.id}`);
    
    try {
      await this.executeJob(nextJob, jobType);
      this.jobs.delete(nextJob.id);
      this.emit('jobCompleted', nextJob);
      console.log(`[BackgroundJob] Completed ${jobType} job: ${nextJob.id}`);
    } catch (error) {
      console.error(`[BackgroundJob] Failed ${jobType} job: ${nextJob.id}`, error);
      await this.handleJobFailure(nextJob, jobType, error);
    } finally {
      this.activeJobs--;
      if (this.activeJobs === 0) {
        this.processing = false;
      }
    }
  }

  // Execute specific job type
  async executeJob(job, type) {
    switch (type) {
      case 'email':
        await this.processEmailJob(job);
        break;
      case 'ideaGeneration':
        await this.processIdeaGenerationJob(job);
        break;
      case 'payment':
        await this.processPaymentJob(job);
        break;
      case 'imageProcessing':
        await this.processImageProcessingJob(job);
        break;
      case 'reportGeneration':
        await this.processReportGenerationJob(job);
        break;
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  }

  // Process email job
  async processEmailJob(job) {
    const { to, subject, template, data } = job.data;
    
    // Simulate email sending (in production, use actual email service)
    await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
    
    console.log(`[EmailJob] Sent email to ${to}: ${subject}`);
    
    // In production, this would use the actual email service
    // await emailService.sendEmail(to, subject, template, data);
  }

  // Process idea generation job
  async processIdeaGenerationJob(job) {
    const { niche, userLevel, goal } = job.data;
    
    // Simulate idea generation (in production, use actual AI service)
    await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
    
    console.log(`[IdeaJob] Generated ideas for niche: ${niche}`);
    
    // In production, this would use the actual idea generation service
    // const ideas = await ideaGenerator.generateAdvancedIdeas({ niche, userLevel, goal });
  }

  // Process payment job
  async processPaymentJob(job) {
    const { paymentIntentId, amount } = job.data;
    
    // Simulate payment processing (in production, use actual Stripe service)
    await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay
    
    console.log(`[PaymentJob] Processed payment: ${paymentIntentId} (${amount})`);
    
    // In production, this would use the actual payment service
    // await paymentService.processPayment(paymentIntentId, amount);
  }

  // Process image processing job
  async processImageProcessingJob(job) {
    const { imageId, operations } = job.data;
    
    // Simulate image processing (in production, use actual image service)
    await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
    
    console.log(`[ImageJob] Processed image: ${imageId}`);
    
    // In production, this would use the actual image processing service
    // await imageService.processImage(imageId, operations);
  }

  // Process report generation job
  async processReportGenerationJob(job) {
    const { reportType, userId, period } = job.data;
    
    // Simulate report generation (in production, use actual reporting service)
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
    
    console.log(`[ReportJob] Generated ${reportType} report for user: ${userId}`);
    
    // In production, this would use the actual reporting service
    // await reportService.generateReport(reportType, userId, period);
  }

  // Handle job failure with retry logic
  async handleJobFailure(job, type, error) {
    job.attempts++;
    
    if (job.attempts < job.maxAttempts) {
      // Exponential backoff
      const backoffDelay = Math.pow(2, job.attempts) * 1000;
      
      console.log(`[BackgroundJob] Retrying ${type} job ${job.id} in ${backoffDelay}ms (attempt ${job.attempts}/${job.maxAttempts})`);
      
      setTimeout(() => {
        this.queues[type].push(job);
      }, backoffDelay);
    } else {
      // Max attempts reached, mark as failed
      job.status = 'failed';
      job.error = error.message;
      this.emit('jobFailed', job);
      console.error(`[BackgroundJob] Failed ${type} job ${job.id} after ${job.maxAttempts} attempts`);
    }
  }

  // Get queue statistics
  getQueueStats() {
    const stats = {
      totalJobs: this.jobs.size,
      activeJobs: this.activeJobs,
      processing: this.processing,
      queues: {}
    };

    Object.keys(this.queues).forEach(type => {
      stats.queues[type] = this.queues[type].length;
    });

    return stats;
  }

  // Get job status
  getJobStatus(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      return { status: 'not_found' };
    }

    return {
      id: job.id,
      type: job.type,
      status: job.status || 'pending',
      attempts: job.attempts,
      createdAt: job.createdAt,
      priority: job.priority
    };
  }

  // Clear completed jobs (cleanup)
  clearCompletedJobs(olderThan = 3600000) { // 1 hour default
    const cutoff = new Date(Date.now() - olderThan);
    let cleared = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if (job.createdAt < cutoff && (job.status === 'completed' || job.status === 'failed')) {
        this.jobs.delete(jobId);
        cleared++;
      }
    }

    console.log(`[BackgroundJob] Cleared ${cleared} completed jobs`);
    return cleared;
  }
}

// Singleton instance
const backgroundJobProcessor = new BackgroundJobProcessor();

module.exports = backgroundJobProcessor;
