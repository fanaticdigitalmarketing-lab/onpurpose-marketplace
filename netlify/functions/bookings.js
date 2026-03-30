const { neon } = require('@neondatabase/serverless');
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

  // Verify authentication for all requests
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

  try {
    if (event.httpMethod === 'POST') {
      // Create new booking
      const {
        hostId,
        experienceId,
        bookingDate,
        startTime,
        endTime,
        guestCount,
        specialRequests,
        totalAmount
      } = JSON.parse(event.body);

      // Validate required fields
      if (!hostId || !bookingDate || !startTime || !totalAmount) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Missing required fields: hostId, bookingDate, startTime, totalAmount'
          })
        };
      }

      // Check if host exists and is available
      const host = await sql`
        SELECT id, "firstName", "lastName", email, "hourlyRate"
        FROM "Hosts"
        WHERE id = ${hostId} AND "isActive" = true AND "verificationStatus" = 'verified'
      `;

      if (host.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Host not found or not available' })
        };
      }

      // Check for booking conflicts
      const conflicts = await sql`
        SELECT id FROM "Bookings"
        WHERE "hostId" = ${hostId} 
        AND "bookingDate" = ${bookingDate}
        AND status IN ('confirmed', 'pending')
        AND (
          ("startTime" <= ${startTime} AND "endTime" > ${startTime}) OR
          ("startTime" < ${endTime} AND "endTime" >= ${endTime}) OR
          ("startTime" >= ${startTime} AND "endTime" <= ${endTime})
        )
      `;

      if (conflicts.length > 0) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ error: 'Time slot not available' })
        };
      }

      // Create booking
      const newBooking = await sql`
        INSERT INTO "Bookings" (
          "guestId", "hostId", "experienceId", "bookingDate", 
          "startTime", "endTime", "guestCount", "specialRequests",
          "totalAmount", status, "createdAt", "updatedAt"
        )
        VALUES (
          ${decoded.userId}, ${hostId}, ${experienceId}, ${bookingDate},
          ${startTime}, ${endTime}, ${guestCount || 1}, ${specialRequests},
          ${totalAmount}, 'pending', NOW(), NOW()
        )
        RETURNING id, "hostId", "bookingDate", "startTime", "endTime", 
                  "totalAmount", status, "createdAt"
      `;

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Booking created successfully',
          booking: newBooking[0]
        })
      };

    } else if (event.httpMethod === 'GET') {
      // Get user's bookings
      const { status, hostId } = event.queryStringParameters || {};

      let whereConditions = [`"guestId" = ${decoded.userId}`];
      let queryParams = [];

      if (status) {
        whereConditions.push(`status = $${queryParams.length + 1}`);
        queryParams.push(status);
      }

      if (hostId) {
        whereConditions.push(`"hostId" = $${queryParams.length + 1}`);
        queryParams.push(hostId);
      }

      const whereClause = whereConditions.join(' AND ');

      const bookings = await sql`
        SELECT 
          b.id, b."hostId", b."experienceId", b."bookingDate",
          b."startTime", b."endTime", b."guestCount", b."specialRequests",
          b."totalAmount", b.status, b."createdAt",
          h."firstName" as "hostFirstName", h."lastName" as "hostLastName",
          h."profilePhoto" as "hostPhoto", h.category as "hostCategory",
          e.title as "experienceTitle", e.description as "experienceDescription"
        FROM "Bookings" b
        JOIN "Hosts" h ON b."hostId" = h.id
        LEFT JOIN "Experiences" e ON b."experienceId" = e.id
        WHERE ${sql.unsafe(whereClause)}
        ORDER BY b."bookingDate" DESC, b."startTime" DESC
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          bookings
        })
      };

    } else if (event.httpMethod === 'PUT') {
      // Update booking status
      const bookingId = event.path.split('/').pop();
      const { status, hostNotes, guestNotes } = JSON.parse(event.body);

      // Verify booking belongs to user
      const booking = await sql`
        SELECT id, "guestId", "hostId", status
        FROM "Bookings"
        WHERE id = ${bookingId}
      `;

      if (booking.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Booking not found' })
        };
      }

      if (booking[0].guestId !== decoded.userId) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Not authorized to update this booking' })
        };
      }

      // Update booking
      const updatedBooking = await sql`
        UPDATE "Bookings"
        SET 
          status = COALESCE(${status}, status),
          "hostNotes" = COALESCE(${hostNotes}, "hostNotes"),
          "guestNotes" = COALESCE(${guestNotes}, "guestNotes"),
          "updatedAt" = NOW()
        WHERE id = ${bookingId}
        RETURNING id, "hostId", "bookingDate", "startTime", "endTime",
                  "totalAmount", status, "updatedAt"
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Booking updated successfully',
          booking: updatedBooking[0]
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
    console.error('Bookings API error:', error);
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
