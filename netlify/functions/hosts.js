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
      const { category, location, minPrice, maxPrice, rating, search } = event.queryStringParameters || {};

      // Build dynamic query
      let whereConditions = ['h."isActive" = true', 'h."verificationStatus" = \'verified\''];
      let queryParams = [];

      if (category) {
        whereConditions.push(`h.category = $${queryParams.length + 1}`);
        queryParams.push(category);
      }

      if (location) {
        whereConditions.push(`h.location ILIKE $${queryParams.length + 1}`);
        queryParams.push(`%${location}%`);
      }

      if (minPrice) {
        whereConditions.push(`h."hourlyRate" >= $${queryParams.length + 1}`);
        queryParams.push(parseFloat(minPrice));
      }

      if (maxPrice) {
        whereConditions.push(`h."hourlyRate" <= $${queryParams.length + 1}`);
        queryParams.push(parseFloat(maxPrice));
      }

      if (rating) {
        whereConditions.push(`h."averageRating" >= $${queryParams.length + 1}`);
        queryParams.push(parseFloat(rating));
      }

      if (search) {
        whereConditions.push(`(h."firstName" ILIKE $${queryParams.length + 1} OR h."lastName" ILIKE $${queryParams.length + 2} OR h.bio ILIKE $${queryParams.length + 3})`);
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      const whereClause = whereConditions.join(' AND ');

      // Get hosts with search filters
      const hosts = await sql`
        SELECT 
          h.id, h."firstName", h."lastName", h.email, h.phone,
          h.category, h.bio, h.location, h."hourlyRate",
          h."profilePhoto", h."averageRating", h."totalReviews",
          h."responseRate", h."createdAt"
        FROM "Hosts" h
        WHERE ${sql.unsafe(whereClause)}
        ORDER BY h."averageRating" DESC, h."totalReviews" DESC
        LIMIT 50
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          hosts,
          count: hosts.length
        })
      };

    } else if (event.httpMethod === 'GET' && event.path.includes('/profile/')) {
      // Get specific host profile
      const hostId = event.path.split('/').pop();

      const host = await sql`
        SELECT 
          h.id, h."firstName", h."lastName", h.email, h.phone,
          h.category, h.bio, h.location, h."hourlyRate",
          h."profilePhoto", h."portfolioImages", h."averageRating", 
          h."totalReviews", h."responseRate", h."createdAt"
        FROM "Hosts" h
        WHERE h.id = ${hostId} AND h."isActive" = true AND h."verificationStatus" = 'verified'
      `;

      if (host.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Host not found' })
        };
      }

      // Get host experiences
      const experiences = await sql`
        SELECT id, title, description, duration, "maxGuests", "basePrice", category
        FROM "Experiences"
        WHERE "hostId" = ${hostId} AND "isActive" = true
        ORDER BY "createdAt" DESC
      `;

      // Get host availability
      const availability = await sql`
        SELECT "dayOfWeek", "startTime", "endTime", "isRecurring", "specificDate"
        FROM "HostAvailability"
        WHERE "hostId" = ${hostId} AND "isAvailable" = true
        ORDER BY "dayOfWeek", "startTime"
      `;

      // Get recent reviews
      const reviews = await sql`
        SELECT 
          r."overallRating", r."reviewText", r."createdAt",
          u."firstName" as "guestName"
        FROM "Reviews" r
        JOIN "Users" u ON r."guestId" = u.id
        WHERE r."hostId" = ${hostId} AND r."isPublic" = true
        ORDER BY r."createdAt" DESC
        LIMIT 10
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          host: {
            ...host[0],
            experiences,
            availability,
            reviews
          }
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
    console.error('Hosts API error:', error);
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
