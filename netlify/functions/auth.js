const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const sql = neon(process.env.NETLIFY_DATABASE_URL);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const path = event.path.split('/').pop();

  try {
    if (event.httpMethod === 'POST' && path === 'register') {
      // User Registration
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        interests,
        location
      } = JSON.parse(event.body);

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Missing required fields: email, password, firstName, lastName'
          })
        };
      }

      // Check if user already exists
      const existingUser = await sql`
        SELECT id FROM "Users" WHERE email = ${email}
      `;

      if (existingUser.length > 0) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({
            error: 'User with this email already exists'
          })
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await sql`
        INSERT INTO "Users" (
          email, password, "firstName", "lastName", phone,
          interests, location, "isEmailVerified", "onboardingCompleted",
          "createdAt", "updatedAt"
        )
        VALUES (
          ${email}, ${hashedPassword}, ${firstName}, ${lastName}, ${phone},
          ${JSON.stringify(interests || [])}, ${location}, false, false,
          NOW(), NOW()
        )
        RETURNING id, email, "firstName", "lastName", phone, interests, location, "isEmailVerified", "onboardingCompleted"
      `;

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser[0].id, email: newUser[0].email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'User registered successfully',
          user: newUser[0],
          token
        })
      };

    } else if (event.httpMethod === 'POST' && path === 'login') {
      // User Login
      const { email, password } = JSON.parse(event.body);

      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Email and password are required'
          })
        };
      }

      // Find user
      const user = await sql`
        SELECT id, email, password, "firstName", "lastName", phone, interests, location, "isEmailVerified", "onboardingCompleted"
        FROM "Users" 
        WHERE email = ${email}
      `;

      if (user.length === 0) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            error: 'Invalid email or password'
          })
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user[0].password);
      if (!isValidPassword) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            error: 'Invalid email or password'
          })
        };
      }

      // Update last login
      await sql`
        UPDATE "Users" 
        SET "lastLoginAt" = NOW(), "updatedAt" = NOW()
        WHERE id = ${user[0].id}
      `;

      // Generate JWT token
      const token = jwt.sign(
        { userId: user[0].id, email: user[0].email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user[0];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          user: userWithoutPassword,
          token
        })
      };

    } else if (event.httpMethod === 'GET' && path === 'profile') {
      // Get User Profile
      const authHeader = event.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Authorization token required' })
        };
      }

      const token = authHeader.substring(7);
      let decoded;
      
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid or expired token' })
        };
      }

      // Get user profile
      const user = await sql`
        SELECT id, email, "firstName", "lastName", phone, interests, location, 
               "profilePhoto", "isEmailVerified", "onboardingCompleted", "createdAt"
        FROM "Users" 
        WHERE id = ${decoded.userId}
      `;

      if (user.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'User not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: user[0]
        })
      };

    } else if (event.httpMethod === 'PUT' && path === 'profile') {
      // Update User Profile
      const authHeader = event.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Authorization token required' })
        };
      }

      const token = authHeader.substring(7);
      let decoded;
      
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid or expired token' })
        };
      }

      const {
        firstName,
        lastName,
        phone,
        interests,
        location,
        profilePhoto,
        onboardingCompleted
      } = JSON.parse(event.body);

      // Update user profile
      const updatedUser = await sql`
        UPDATE "Users" 
        SET 
          "firstName" = COALESCE(${firstName}, "firstName"),
          "lastName" = COALESCE(${lastName}, "lastName"),
          phone = COALESCE(${phone}, phone),
          interests = COALESCE(${JSON.stringify(interests)}, interests),
          location = COALESCE(${location}, location),
          "profilePhoto" = COALESCE(${profilePhoto}, "profilePhoto"),
          "onboardingCompleted" = COALESCE(${onboardingCompleted}, "onboardingCompleted"),
          "updatedAt" = NOW()
        WHERE id = ${decoded.userId}
        RETURNING id, email, "firstName", "lastName", phone, interests, location, 
                  "profilePhoto", "isEmailVerified", "onboardingCompleted"
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Profile updated successfully',
          user: updatedUser[0]
        })
      };

    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
