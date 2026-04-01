// Debug test to see actual response structure
const https = require('https');

function debugEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'onpurpose.earth',
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DebugTest/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const jsonData = responseData ? JSON.parse(responseData) : null;
          const result = {
            status: res.statusCode,
            success: res.statusCode < 400,
            data: jsonData
          };
          console.log(`Endpoint: ${path}`);
          console.log(`Status: ${result.status}`);
          console.log(`Success: ${result.success}`);
          console.log(`Result object:`, JSON.stringify(result, null, 2));
          resolve(result);
        } catch (error) {
          const result = {
            status: res.statusCode,
            success: false,
            error: 'JSON Parse Error'
          };
          console.log(`Endpoint: ${path} (JSON Error)`);
          console.log(`Status: ${result.status}`);
          console.log(`Success: ${result.success}`);
          resolve(result);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`Endpoint: ${path} (Request Error)`);
      console.log(`Error: ${error.message}`);
      resolve({
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`Endpoint: ${path} (Timeout)`);
      resolve({
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function runDebug() {
  console.log('🔍 DEBUGGING PRODUCTION ENDPOINTS');
  console.log('===================================');
  
  const endpoints = ['/index.html', '/idea-generator.html', '/api/services'];
  
  for (const endpoint of endpoints) {
    await debugEndpoint(endpoint);
    console.log('---');
  }
}

runDebug();
