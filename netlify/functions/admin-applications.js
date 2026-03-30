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
    if (event.httpMethod === 'GET') {
      // Get all host applications for admin review
      const applications = await sql`
        SELECT 
          id, "firstName", "lastName", email, phone, category,
          experience, portfolio, bio, location, "hourlyRate",
          availability, status, "reviewNotes", "createdAt"
        FROM "HostApplications"
        ORDER BY 
          CASE status 
            WHEN 'pending' THEN 1 
            WHEN 'under_review' THEN 2 
            WHEN 'approved' THEN 3 
            WHEN 'rejected' THEN 4 
          END,
          "createdAt" DESC
      `;

      // Get application statistics
      const stats = await sql`
        SELECT 
          status,
          COUNT(*) as count
        FROM "HostApplications"
        GROUP BY status
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          applications,
          stats: stats.reduce((acc, stat) => {
            acc[stat.status] = parseInt(stat.count);
            return acc;
          }, {})
        })
      };

    } else if (event.httpMethod === 'PUT') {
      // Update application status (approve/reject)
      const { applicationId, status, reviewNotes } = JSON.parse(event.body);

      if (!applicationId || !status) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Missing required fields: applicationId, status'
          })
        };
      }

      // Update application status
      const updatedApp = await sql`
        UPDATE "HostApplications"
        SET 
          status = ${status},
          "reviewNotes" = ${reviewNotes || null},
          "reviewedAt" = NOW(),
          "updatedAt" = NOW()
        WHERE id = ${applicationId}
        RETURNING id, "firstName", "lastName", email, category, status
      `;

      if (updatedApp.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Application not found' })
        };
      }

      // If approved, create host record
      if (status === 'approved') {
        const application = await sql`
          SELECT * FROM "HostApplications" WHERE id = ${applicationId}
        `;

        if (application.length > 0) {
          const app = application[0];
          
          // Create host record
          await sql`
            INSERT INTO "Hosts" (
              "firstName", "lastName", email, phone, category,
              bio, location, "hourlyRate", "verificationStatus",
              "isActive", "createdAt", "updatedAt"
            )
            VALUES (
              ${app.firstName}, ${app.lastName}, ${app.email}, ${app.phone}, ${app.category},
              ${app.bio}, ${app.location}, ${app.hourlyRate}, 'verified',
              true, NOW(), NOW()
            )
          `;
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: `Application ${status} successfully`,
          application: updatedApp[0]
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
    console.error('Admin applications error:', error);
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
