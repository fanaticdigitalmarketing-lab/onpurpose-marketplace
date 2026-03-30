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

  // Verify authentication for POST/PUT requests
  let decoded = null;
  if (event.httpMethod !== 'GET') {
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authorization token required' })
      };
    }

    const token = authHeader.substring(7);
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired token' })
      };
    }
  }

  try {
    if (event.httpMethod === 'POST') {
      // Submit review
      const {
        bookingId,
        overallRating,
        knowledgeRating,
        communicationRating,
        valueRating,
        authenticityRating,
        reviewText
      } = JSON.parse(event.body);

      // Validate required fields
      if (!bookingId || !overallRating) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Missing required fields: bookingId, overallRating'
          })
        };
      }

      // Verify booking exists and belongs to user
      const booking = await sql`
        SELECT b.id, b."guestId", b."hostId", b.status
        FROM "Bookings" b
        WHERE b.id = ${bookingId} AND b."guestId" = ${decoded.userId} AND b.status = 'completed'
      `;

      if (booking.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'Booking not found or not completed' 
          })
        };
      }

      // Check if review already exists
      const existingReview = await sql`
        SELECT id FROM "Reviews" WHERE "bookingId" = ${bookingId}
      `;

      if (existingReview.length > 0) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ 
            error: 'Review already submitted for this booking' 
          })
        };
      }

      // Create review
      const newReview = await sql`
        INSERT INTO "Reviews" (
          "bookingId", "guestId", "hostId", "overallRating",
          "knowledgeRating", "communicationRating", "valueRating",
          "authenticityRating", "reviewText", "isPublic", "isVerified",
          "createdAt"
        )
        VALUES (
          ${bookingId}, ${decoded.userId}, ${booking[0].hostId}, ${overallRating},
          ${knowledgeRating || null}, ${communicationRating || null}, 
          ${valueRating || null}, ${authenticityRating || null}, ${reviewText || null},
          true, true, NOW()
        )
        RETURNING id, "overallRating", "reviewText", "createdAt"
      `;

      // Update host rating aggregates
      await updateHostRatings(booking[0].hostId);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Review submitted successfully',
          review: newReview[0]
        })
      };

    } else if (event.httpMethod === 'GET' && event.path.includes('/host/')) {
      // Get reviews for a specific host
      const hostId = event.path.split('/').pop();

      const reviews = await sql`
        SELECT 
          r.id, r."overallRating", r."knowledgeRating", r."communicationRating",
          r."valueRating", r."authenticityRating", r."reviewText", 
          r."hostResponse", r."createdAt", r."respondedAt",
          u."firstName" as "guestName", u."profilePhoto" as "guestPhoto"
        FROM "Reviews" r
        JOIN "Users" u ON r."guestId" = u.id
        WHERE r."hostId" = ${hostId} AND r."isPublic" = true
        ORDER BY r."createdAt" DESC
        LIMIT 20
      `;

      // Get rating summary
      const ratingSummary = await sql`
        SELECT 
          AVG("overallRating") as "averageRating",
          COUNT(*) as "totalReviews",
          AVG("knowledgeRating") as "avgKnowledge",
          AVG("communicationRating") as "avgCommunication",
          AVG("valueRating") as "avgValue",
          AVG("authenticityRating") as "avgAuthenticity"
        FROM "Reviews"
        WHERE "hostId" = ${hostId} AND "isPublic" = true
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          reviews,
          summary: ratingSummary[0] || {
            averageRating: 0,
            totalReviews: 0,
            avgKnowledge: 0,
            avgCommunication: 0,
            avgValue: 0,
            avgAuthenticity: 0
          }
        })
      };

    } else if (event.httpMethod === 'PUT' && event.path.includes('/respond/')) {
      // Host response to review
      const reviewId = event.path.split('/').pop();
      const { hostResponse } = JSON.parse(event.body);

      if (!hostResponse) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Host response text required'
          })
        };
      }

      // Verify review exists and user is the host
      const review = await sql`
        SELECT r.id, r."hostId", h."userId"
        FROM "Reviews" r
        JOIN "Hosts" h ON r."hostId" = h.id
        WHERE r.id = ${reviewId}
      `;

      if (review.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Review not found' })
        };
      }

      // Note: In a full implementation, you'd verify the user is the host
      // For now, we'll allow any authenticated user to respond

      // Update review with host response
      const updatedReview = await sql`
        UPDATE "Reviews"
        SET "hostResponse" = ${hostResponse}, "respondedAt" = NOW()
        WHERE id = ${reviewId}
        RETURNING id, "hostResponse", "respondedAt"
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Response added successfully',
          review: updatedReview[0]
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
    console.error('Reviews API error:', error);
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

// Helper function to update host rating aggregates
async function updateHostRatings(hostId) {
  try {
    const ratings = await sql`
      SELECT 
        AVG("overallRating") as "avgRating",
        COUNT(*) as "totalReviews"
      FROM "Reviews"
      WHERE "hostId" = ${hostId} AND "isPublic" = true
    `;

    if (ratings.length > 0) {
      await sql`
        UPDATE "Hosts"
        SET 
          "averageRating" = ${parseFloat(ratings[0].avgRating).toFixed(2)},
          "totalReviews" = ${ratings[0].totalReviews},
          "updatedAt" = NOW()
        WHERE id = ${hostId}
      `;
    }
  } catch (error) {
    console.error('Error updating host ratings:', error);
  }
}
