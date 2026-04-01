# Railway Logs Check Required

## Current Status:
- ✅ Registration: Working (Status 201 Created)
- ❌ Login: Failing with "Invalid credentials"

## Next Steps:
1. Check Railway logs for the last 50 lines
2. Look for specific error messages during login attempts
3. Identify the root cause of the authentication failure

## Common Issues:
- BCRYPT_PEPPER mismatch between registration and login
- Database connection issues
- JWT token problems
- Password hashing inconsistencies

## Action Required:
Please open railway.app → your project → Deployments → View Logs
Show me the last 50 lines of the logs to identify the exact error.
