const { neon } = require('@neondatabase/serverless');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

  // Verify authentication
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

  const path = event.path.split('/').pop();

  try {
    if (event.httpMethod === 'POST' && path === 'create-intent') {
      // Create payment intent
      const { bookingId, amount, currency = 'usd' } = JSON.parse(event.body);

      if (!bookingId || !amount) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Missing required fields: bookingId, amount'
          })
        };
      }

      // Verify booking belongs to user
      const booking = await sql`
        SELECT b.id, b."hostId", b."totalAmount", h."stripeAccountId"
        FROM "Bookings" b
        JOIN "Hosts" h ON b."hostId" = h.id
        WHERE b.id = ${bookingId} AND b."guestId" = ${decoded.userId}
      `;

      if (booking.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Booking not found' })
        };
      }

      // Calculate platform fee (20%)
      const platformFee = Math.round(amount * 0.20);
      const hostPayout = amount - platformFee;

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          bookingId: bookingId.toString(),
          userId: decoded.userId.toString(),
          hostId: booking[0].hostId.toString()
        },
        transfer_data: booking[0].stripeAccountId ? {
          destination: booking[0].stripeAccountId,
          amount: Math.round(hostPayout * 100)
        } : undefined
      });

      // Store payment record
      await sql`
        INSERT INTO "Payments" (
          "bookingId", "stripePaymentIntentId", amount, "platformFee", 
          "hostPayout", currency, status, "createdAt"
        )
        VALUES (
          ${bookingId}, ${paymentIntent.id}, ${amount}, ${platformFee},
          ${hostPayout}, ${currency}, 'pending', NOW()
        )
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        })
      };

    } else if (event.httpMethod === 'POST' && path === 'confirm') {
      // Confirm payment
      const { paymentIntentId } = JSON.parse(event.body);

      if (!paymentIntentId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Payment intent ID required'
          })
        };
      }

      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        // Update payment status
        await sql`
          UPDATE "Payments"
          SET status = 'completed', "processedAt" = NOW()
          WHERE "stripePaymentIntentId" = ${paymentIntentId}
        `;

        // Update booking status
        const bookingId = paymentIntent.metadata.bookingId;
        await sql`
          UPDATE "Bookings"
          SET status = 'confirmed', "updatedAt" = NOW()
          WHERE id = ${bookingId}
        `;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Payment confirmed successfully',
            status: paymentIntent.status
          })
        };
      } else {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Payment not completed',
            status: paymentIntent.status
          })
        };
      }

    } else if (event.httpMethod === 'POST' && path === 'refund') {
      // Process refund
      const { paymentIntentId, amount, reason } = JSON.parse(event.body);

      if (!paymentIntentId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Payment intent ID required'
          })
        };
      }

      // Create refund
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason || 'requested_by_customer'
      });

      // Update payment status
      await sql`
        UPDATE "Payments"
        SET status = 'refunded', "updatedAt" = NOW()
        WHERE "stripePaymentIntentId" = ${paymentIntentId}
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Refund processed successfully',
          refundId: refund.id
        })
      };

    } else if (event.httpMethod === 'GET' && path === 'history') {
      // Get payment history
      const payments = await sql`
        SELECT 
          p.id, p."bookingId", p.amount, p."platformFee", p."hostPayout",
          p.currency, p.status, p."processedAt", p."createdAt",
          b."bookingDate", b."startTime", b."endTime",
          h."firstName" as "hostFirstName", h."lastName" as "hostLastName"
        FROM "Payments" p
        JOIN "Bookings" b ON p."bookingId" = b.id
        JOIN "Hosts" h ON b."hostId" = h.id
        WHERE b."guestId" = ${decoded.userId}
        ORDER BY p."createdAt" DESC
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          payments
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
    console.error('Payments API error:', error);
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
