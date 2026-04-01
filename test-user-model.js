const { User } = require('./models');

async function testUserModel() {
  try {
    console.log('Testing User model...');
    
    // Test creating a user
    const user = await User.create({
      name: 'Test User',
      email: 'testuser2@example.com',
      password: 'password123'
    });
    
    console.log('✓ User created successfully:', user.id);
    
    // Test finding user
    const foundUser = await User.findOne({ where: { email: 'testuser2@example.com' } });
    if (foundUser) {
      console.log('✓ User found successfully');
    } else {
      console.log('✗ User not found');
    }
    
    // Test password comparison
    const isValid = await foundUser.comparePassword('password123');
    console.log(isValid ? '✓ Password comparison works' : '✗ Password comparison failed');
    
    process.exit(0);
  } catch (error) {
    console.error('User model test failed:', error);
    process.exit(1);
  }
}

testUserModel();
