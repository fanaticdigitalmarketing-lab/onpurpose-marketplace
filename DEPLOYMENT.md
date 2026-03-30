# OnPurpose Deployment Guide

## Overview
Complete deployment setup for OnPurpose MVP including backend API, admin dashboard, and mobile app builds.

## Backend Deployment

### Prerequisites
- Docker and Docker Compose installed
- PostgreSQL database (local or cloud)
- Environment variables configured

### Quick Start
```bash
# Clone and setup
git clone <repository>
cd OnPurpose

# Configure environment
cp .env.example .env
# Edit .env with your actual values

# Deploy with Docker
chmod +x deploy.sh
./deploy.sh
```

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/onpurpose
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# App
PORT=3000
NODE_ENV=production
```

### Services
- **API Server**: http://localhost:3000
- **Database**: PostgreSQL on port 5432
- **Redis**: Cache and sessions on port 6379
- **Nginx**: Reverse proxy with SSL on ports 80/443

### Health Check
```bash
curl http://localhost/health
```

## Admin Dashboard Deployment

### Development
```bash
cd admin
npm install
npm start
# Runs on http://localhost:3001
```

### Production Build
```bash
cd admin
npm run build
# Serve build/ directory with nginx or hosting service
```

### Demo Credentials
- Email: admin@onpurpose.app
- Password: admin123

## Mobile App Builds

### Prerequisites
- Expo CLI installed: `npm install -g @expo/eas-cli`
- Expo account created
- EAS configured: `eas build:configure`

### Android Build
```bash
cd mobile
chmod +x build-android.sh
./build-android.sh
```

### iOS Build
```bash
cd mobile
chmod +x build-ios.sh
./build-ios.sh
```

### Development Testing
```bash
cd mobile
npm install
npx expo start
# Scan QR code with Expo Go app
```

## Database Setup

### Initial Schema
```bash
# Run schema setup
docker-compose exec db psql -U onpurpose -d onpurpose -f /docker-entrypoint-initdb.d/schema.sql
```

### Sample Data
The schema includes sample users and hosts for testing.

## SSL Configuration

### Development
Uses self-signed certificates in `ssl/` directory.

### Production
Replace certificates in `ssl/` directory:
- `onpurpose.crt` - SSL certificate
- `onpurpose.key` - Private key

## Monitoring

### Logs
```bash
# View all service logs
docker-compose logs -f

# View specific service
docker-compose logs -f app
docker-compose logs -f db
docker-compose logs -f nginx
```

### Service Status
```bash
docker-compose ps
```

## Scaling

### Horizontal Scaling
```bash
# Scale API servers
docker-compose up -d --scale app=3
```

### Load Balancing
Nginx is configured to load balance across multiple app instances.

## Backup

### Database Backup
```bash
docker-compose exec db pg_dump -U onpurpose onpurpose > backup.sql
```

### Restore
```bash
docker-compose exec -T db psql -U onpurpose onpurpose < backup.sql
```

## Security

### Features Implemented
- Rate limiting (100 requests/15min)
- Helmet.js security headers
- CORS configuration
- JWT authentication
- Input validation
- SQL injection protection
- SSL/TLS encryption

### Admin Access
Admin routes are protected and require admin role verification.

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify credentials

**Stripe Webhooks**
- Update webhook endpoint in Stripe dashboard
- Verify STRIPE_WEBHOOK_SECRET

**Mobile App Build Fails**
- Check Expo account authentication
- Verify app.json configuration
- Ensure all dependencies are installed

**Admin Dashboard 404**
- Check proxy configuration
- Verify backend API is running
- Check admin user exists in database

## Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups scheduled
- [ ] Monitoring setup
- [ ] Domain DNS configured
- [ ] Stripe webhooks configured
- [ ] Email service configured
- [ ] Admin user created
- [ ] Mobile apps built and tested
- [ ] Load testing completed

## Support

For deployment issues:
1. Check service logs
2. Verify environment variables
3. Test database connectivity
4. Validate SSL certificates
5. Check Stripe configuration

## Next Steps

1. **Production Hosting**: Deploy to AWS/GCP/Azure
2. **CI/CD Pipeline**: Setup automated deployments
3. **Monitoring**: Add APM and error tracking
4. **CDN**: Setup for static assets
5. **Auto-scaling**: Configure based on load
