# 🔑 OnPurpose Platform - SSH Key Configuration

## **SSH Public Key for Git Deployment**

### **SSH Key**
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC2t/TdH5juMv+TdincjtW+kKHH4Px9+Zw86yaDv9FSGEOn+QYo4oTEgtL2n+UIuOC9Sl455Orw3qFyFH73RnK8FoZgNtzEEG45Bg7j2cm8boSGbw9bbeUmI3PUj+Yr5+LKe4mbCwIMrbe7H6PdH5ekIBr1LN/7ffNxYsoxzTiASY5B1WufOFLfgfeRMWje9MCBtGF9erEXpRqSMIrVWIPX8s0F+J783lLlbYuV2tFxV/JUXTzhmMr9RidtFV8r4/p/5Sy/nLfopesOywl3+sCoIyu7RlDNVNCslpOTBwhZa0yWQmbz9/mNiu3YnAsHwvHm7VDoYjEfjhP/AA7r8MiV700p63dN0IRoyIac0A6aNHUvvWJ/06HafhJIzLHgIMk0orBv8Gv/0o/nKsMS1vJppmjI7Uao2dMxiiVp9Zg2Z6O6puUTR1SMRRti8uqPHGWJ9RNKAH5oLRgX+Th2IqtFormDjcnZzk10q61aVqE3qXGsTAAWDOaCCiiI4cTeb7DgikWsDpjBmqSYI4Os09tc8R0e8gukEHKpZumrcEWKzEs/qDHtZm9dqHgEjHsnolDE6Eav1l9664Hce8fN3k3DxWFg+wxOxk6zg2A29jNmMx0TR5IvMOZrQr+3PDdDO6+MtVETS+b9oUWNIZaNG1tVB3AHVwPwQCKSVDuJjKRtRw==
```

## **Configuration for Netlify**

### **Deploy Key Setup**
1. **Navigate to:** Netlify Site Settings → Build & Deploy → Deploy Keys
2. **Add Deploy Key:** Paste the SSH key above
3. **Title:** OnPurpose Platform Deploy Key
4. **Access:** Read-only (recommended for security)

### **Git Repository Integration**
- **SSH Key Type:** RSA 4096-bit
- **Purpose:** Secure Git repository access for automated deployments
- **Security:** Public key safe to share, private key remains secure

### **Alternative Git Integration**
If using GitHub/GitLab integration:
1. **Add SSH key** to your Git provider (GitHub/GitLab)
2. **Configure repository** in Netlify site settings
3. **Enable automatic deployments** on Git push

## **OnPurpose Platform Repository**
This SSH key enables secure access to the OnPurpose platform repository for automated deployments with all 8 platform files and database configuration.

**SSH key configured for secure Git deployment integration.**
