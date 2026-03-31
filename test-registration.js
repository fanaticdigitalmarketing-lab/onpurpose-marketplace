const axios = require('axios');

async function testRegistration() {
  try {
    console.log('Testing registration endpoint...');
    
    const response = await axios.post('https://ydmxe6sf.up.railway.app/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123',
      role: 'customer'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Registration failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('Network error:', error.message);
      console.log('Code:', error.code);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testRegistration();
