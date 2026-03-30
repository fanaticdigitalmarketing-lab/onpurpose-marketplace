# 🔗 OnPurpose Platform - Netlify Preview Server Configuration

## **Preview Server Webhook**

### **Webhook URL**
```
https://api.netlify.com/preview_server_hooks/68ae70c4f1691d5a29884290
```

### **Preview Server Command**
For OnPurpose platform static site:
```
npx serve . -p $PORT
```

**Alternative commands:**
```
python -m http.server $PORT
```
or
```
php -S localhost:$PORT
```

### **Target Port**
```
3000
```

**Alternative ports:**
- `8000` (Python default)
- `8080` (Common development port)
- `5000` (Flask default)

## **Configuration Details**

### **Preview Server Setup**
- **Purpose:** Local development preview of OnPurpose platform
- **Webhook:** Triggers preview server for development builds
- **Command:** Serves static files from root directory
- **Port:** 3000 (or environment variable $PORT)

### **OnPurpose Platform Preview**
- **Files served:** All 9 platform files from root directory
- **Access:** Local development at `localhost:3000`
- **Hot reload:** Automatic updates on file changes
- **Database:** Uses environment variables for connections

### **Development Workflow**
1. **Webhook triggers** preview server
2. **Static files served** from root directory
3. **Platform accessible** at localhost:3000
4. **Database connections** use configured environment variables

**Preview server configured for OnPurpose platform development and testing.**
