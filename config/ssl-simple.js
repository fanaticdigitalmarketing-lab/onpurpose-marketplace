// SSL configuration with HTTPS redirection
const SSLConfig = {
  redirectHTTPToHTTPS: (app) => {
    // FORCE HTTPS (important for production)
    app.use((req, res, next) => {
      if (process.env.NODE_ENV === 'production') {
        if (req.headers['x-forwarded-proto'] !== 'https') {
          return res.redirect(`https://${req.headers.host}${req.url}`);
        }
      }
      next();
    });
  },
  
  createHTTPSServer: (app) => {
    // No HTTPS server in development (handled by hosting provider in production)
    return null;
  }
};

module.exports = SSLConfig;
