# 📧 Simple SendGrid Setup for Railway

## Skip Domain Authentication
Those CNAME errors are normal - you're using Railway's subdomain, not a custom domain.

## What You Need:
1. **Skip** all domain verification steps
2. **Get API key only**: Settings → API Keys → Create API Key
3. **Name**: "OnPurpose Railway"
4. **Permissions**: "Mail Send" 
5. **Copy**: API key (starts with `SG.`)

## Updated Environment Variables:
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your_api_key_here
EMAIL_FROM=noreply@sendgrid.net
```

## Result:
✅ Emails will send from SendGrid's domain
✅ No custom domain needed
✅ Ready for Railway deployment

Just get the API key and we can deploy immediately!
