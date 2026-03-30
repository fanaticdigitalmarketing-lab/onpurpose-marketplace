const { neon } = require('@neondatabase/serverless');

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

  try {
    if (event.httpMethod === 'POST') {
      // Create host application
      const {
        firstName,
        lastName,
        email,
        phone,
        category,
        experience,
        portfolio,
        availability,
        hourlyRate,
        bio,
        location
      } = JSON.parse(event.body);

      // Validate required fields
      if (!firstName || !lastName || !email || !category || !experience) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Missing required fields: firstName, lastName, email, category, experience'
          })
        };
      }

      // Insert host application
      const result = await sql`
        INSERT INTO "HostApplications" (
          "firstName", "lastName", email, phone, category, 
          experience, portfolio, availability, "hourlyRate", 
          bio, location, status, "createdAt"
        )
        VALUES (
          ${firstName}, ${lastName}, ${email}, ${phone}, ${category},
          ${experience}, ${portfolio}, ${JSON.stringify(availability)}, ${hourlyRate},
          ${bio}, ${location}, 'pending', NOW()
        )
        RETURNING id, "firstName", "lastName", email, category, status, "createdAt"
      `;

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Host application submitted successfully',
          application: result[0]
        })
      };

    } else if (event.httpMethod === 'GET') {
      // Get all applications (admin only)
      const applications = await sql`
        SELECT 
          id, "firstName", "lastName", email, phone, category,
          experience, portfolio, availability, "hourlyRate",
          bio, location, status, "reviewNotes", "createdAt"
        FROM "HostApplications"
        ORDER BY "createdAt" DESC
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          applications
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
    console.error('Host application error:', error);
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
