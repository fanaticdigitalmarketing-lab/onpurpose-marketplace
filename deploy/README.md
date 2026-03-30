# OnPurpose Production Deployment Guide

This directory contains all the tools and scripts needed to deploy the OnPurpose application to production.

## Quick Start

### Option 1: Automated Deployment (Recommended)

**Windows:**
```powershell
.\deploy\deploy.ps1
```

**Linux/macOS:**
```bash
chmod +x deploy/quick-deploy.sh
./deploy/quick-deploy.sh
```

### Option 2: Manual Configuration

1. **Configure API Keys**: Follow `api-keys-setup.md`
2. **Choose Deployment Method**: 
   - Heroku: Run `deploy/heroku-deploy.sh`
   - AWS: Use `deploy/aws-deploy.yml` CloudFormation template
   - Docker: Use `docker-compose.yml`
3. **Set up SSL**: Follow `ssl-setup.md`
4. **Test Deployment**: Run `node deploy/production-test.js <your-url>`

## Files Overview

| File | Purpose |
|------|---------|
| `deploy.ps1` | Windows PowerShell deployment script |
| `quick-deploy.sh` | Linux/macOS bash deployment script |
| `production-test.js` | Comprehensive production testing suite |
| `api-keys-setup.md` | Guide for configuring Stripe, email, and other API keys |
| `ssl-setup.md` | SSL certificate configuration guide |
| `heroku-deploy.sh` | Automated Heroku deployment |
| `aws-deploy.yml` | AWS CloudFormation infrastructure template |
| `production-checklist.md` | Complete production readiness checklist |
| `deployment-wizard.js` | Interactive CLI deployment wizard |

## Deployment Options

### 1. Heroku (Easiest)
- **Pros**: Managed hosting, automatic SSL, easy scaling
- **Cons**: Cost at scale, vendor lock-in
- **Best for**: Quick deployment, small to medium apps

### 2. AWS (Enterprise)
- **Pros**: Full control, scalable, enterprise features
- **Cons**: Complex setup, requires AWS knowledge
- **Best for**: Large applications, enterprise requirements

### 3. Docker (Self-hosted)
- **Pros**: Portable, consistent environments, cost-effective
- **Cons**: Requires server management, SSL setup
- **Best for**: Self-hosted solutions, development teams

## Required Environment Variables

```bash
# Core
NODE_ENV=production
PORT=3000
JWT_SECRET=<32-character-secret>

# Database
DATABASE_URL=<postgresql-connection-string>

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=<sendgrid-api-key>
EMAIL_FROM=noreply@yourdomain.com

# Security
APP_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
SSL_CERT_PATH=/path/to/certificate.crt
SSL_KEY_PATH=/path/to/private.key
```

## Post-Deployment Checklist

After deployment, verify:

- [ ] Application loads successfully
- [ ] Health endpoint responds: `/health`
- [ ] User registration works
- [ ] User login works
- [ ] Payment processing works (test mode first)
- [ ] Email notifications work
- [ ] SSL certificate is valid
- [ ] Stripe webhook is configured
- [ ] Monitoring is active
- [ ] Backups are scheduled

## Testing Your Deployment

```bash
# Run comprehensive tests
node deploy/production-test.js https://your-app-url.com

# Test specific endpoints
curl https://your-app-url.com/health
curl https://your-app-url.com/api
```

## Monitoring and Maintenance

### Health Monitoring
- Health endpoint: `/health`
- Sentry error tracking (configure `SENTRY_DSN`)
- Winston logging with file rotation

### Database Backups
- Automated daily backups
- Weekly cleanup of old backups
- Manual backup: `node scripts/backup-database.js`

### SSL Certificate Renewal
- Let's Encrypt: Auto-renewal with certbot
- Commercial certs: Manual renewal required
- Test SSL: https://www.ssllabs.com/ssltest/

## Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check database URL format
echo $DATABASE_URL
# Should be: postgresql://user:pass@host:port/dbname
```

**SSL Certificate Issues**
```bash
# Verify certificate files exist
ls -la /etc/ssl/certs/certificate.crt
ls -la /etc/ssl/private/private.key
```

**Stripe Webhook Failures**
1. Check webhook URL in Stripe dashboard
2. Verify webhook secret matches environment variable
3. Check application logs for webhook errors

**Email Not Sending**
1. Verify SMTP credentials
2. Check email provider settings
3. Review application logs for email errors

### Getting Help

1. Check application logs: `heroku logs --tail` (Heroku) or `docker logs app_name`
2. Review error monitoring in Sentry dashboard
3. Test individual components using the production test suite
4. Verify all environment variables are set correctly

## Security Best Practices

- Use strong JWT secrets (32+ characters)
- Enable HTTPS in production
- Configure proper CORS origins
- Set up rate limiting
- Regular security updates
- Monitor for vulnerabilities
- Use environment variables for secrets
- Regular backup testing

## Scaling Considerations

### Heroku
- Use performance dynos for production
- Add Redis for session storage
- Configure database connection pooling

### AWS
- Use Application Load Balancer
- Auto Scaling Groups for EC2 instances
- RDS with read replicas
- CloudFront CDN

### Docker
- Use Docker Swarm or Kubernetes
- Load balancer (nginx, HAProxy)
- Database clustering
- Container orchestration

---

For detailed instructions on any specific deployment method, refer to the individual guide files in this directory.
