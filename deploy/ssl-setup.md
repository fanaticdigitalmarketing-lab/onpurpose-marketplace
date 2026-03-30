# SSL Certificate Setup Guide

## 🔒 SSL Certificate Options

### Option 1: Automatic SSL (Recommended)

#### Heroku
- **Automatic**: SSL certificates are automatically provided and managed
- **Custom Domain**: Add your domain in Heroku dashboard → Settings → Domains
- **Cost**: Free for Heroku apps, $7/month for custom domains

#### Cloudflare (Free SSL)
1. Sign up at [Cloudflare](https://cloudflare.com)
2. Add your domain
3. Update nameservers to Cloudflare
4. Enable "Full (strict)" SSL mode
5. **Result**: Free SSL certificate with CDN

### Option 2: Let's Encrypt (Free)

#### For Docker/Self-hosted
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (add to crontab)
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

#### Certificate Files Location
```bash
# Certificate files will be at:
/etc/letsencrypt/live/yourdomain.com/fullchain.pem
/etc/letsencrypt/live/yourdomain.com/privkey.pem

# Update your .env.production
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Option 3: Commercial SSL Certificate

#### Purchase from Certificate Authority
1. **Providers**: DigiCert, GlobalSign, Comodo, GoDaddy
2. **Generate CSR**:
```bash
openssl req -new -newkey rsa:2048 -nodes -keyout yourdomain.key -out yourdomain.csr
```
3. **Submit CSR** to certificate authority
4. **Install certificate** when received

## 🔧 SSL Configuration

### Update Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Update Environment Variables
```bash
# Add to .env.production
SSL_CERT_PATH=/path/to/certificate.crt
SSL_KEY_PATH=/path/to/private.key
APP_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

## 🧪 SSL Testing

### Test SSL Configuration
```bash
# Test SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate expiration
openssl x509 -in certificate.crt -text -noout | grep "Not After"

# Online SSL test
# Visit: https://www.ssllabs.com/ssltest/
```

### Verify HTTPS Redirect
```bash
# Test HTTP to HTTPS redirect
curl -I http://yourdomain.com
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://yourdomain.com/

# Test HTTPS response
curl -I https://yourdomain.com
# Should return: HTTP/2 200
```

## 🔄 SSL Maintenance

### Certificate Renewal
```bash
# Let's Encrypt auto-renewal test
sudo certbot renew --dry-run

# Manual renewal
sudo certbot renew

# Restart services after renewal
sudo systemctl reload nginx
```

### Monitoring
- **Expiration Alerts**: Set up monitoring for certificate expiration
- **SSL Labs**: Regular A+ rating checks
- **Certificate Transparency**: Monitor CT logs for unauthorized certificates

## 🚨 Troubleshooting

### Common Issues

#### Mixed Content Errors
```javascript
// Update frontend API calls to use HTTPS
const API_BASE = 'https://yourdomain.com/api';
```

#### Certificate Chain Issues
```bash
# Verify certificate chain
openssl verify -CAfile ca-bundle.crt certificate.crt
```

#### Permission Issues
```bash
# Fix certificate file permissions
sudo chmod 644 /path/to/certificate.crt
sudo chmod 600 /path/to/private.key
sudo chown root:root /path/to/certificate.crt /path/to/private.key
```

## 📋 SSL Checklist

- [ ] SSL certificate obtained and installed
- [ ] HTTP to HTTPS redirect configured
- [ ] Security headers implemented
- [ ] Mixed content issues resolved
- [ ] SSL Labs test shows A+ rating
- [ ] Certificate auto-renewal configured
- [ ] Monitoring alerts set up
- [ ] Backup certificates stored securely

## 🔗 Useful Resources

- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Cloudflare SSL](https://www.cloudflare.com/ssl/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
