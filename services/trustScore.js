/**
 * OnPurpose Trust Score Algorithm
 * © 2025 OnPurpose Inc. All rights reserved.
 * Patent-pending intellectual property
 * 
 * Formula:
 * TrustScore = (V*0.25 + C*0.30 + R*0.20 + D*0.15 + B*0.10) * P
 * 
 * Where:
 * - V = verifiedCredential ? 1.0 : 0.3
 * - C = completedBookings / totalNonPendingBookings (default 0.5 if none)
 * - R = quickResponseRate (bookings confirmed / total bookings, default 0.5)
 * - D = recency-decayed rating: each review weighted by e^(-ageDays/45)
 * - B = repeatBookingRatio: (total bookings - unique customers) / unique customers, capped at 1.0
 * - P = geographic proximity multiplier
 */

const crypto = require('crypto');

// Geographic proximity multipliers
const PROXIMITY_MULTIPLIERS = {
  WITHIN_2KM: 1.20,
  WITHIN_5KM: 1.10,
  WITHIN_15KM: 1.00,
  WITHIN_30KM: 0.90,
  BEYOND_30KM: 0.75,
  ONLINE: 1.00
};

// Calculate trust score for a provider
const calculateTrustScore = (provider, bookings, reviews, opts = {}) => {
  const { customerLocation, serviceLocation } = opts;
  
  // V = Verified credential factor
  const V = provider.verifiedCredential ? 1.0 : 0.3;
  
  // C = Completion rate
  let C = 0.5;
  if (bookings && bookings.length > 0) {
    const nonPendingBookings = bookings.filter(b => b.status !== 'pending');
    if (nonPendingBookings.length > 0) {
      const completedBookings = bookings.filter(b => b.status === 'completed').length;
      C = completedBookings / nonPendingBookings.length;
    }
  }
  
  // R = Quick response rate
  let R = 0.5;
  if (bookings && bookings.length > 0) {
    const confirmedBookings = bookings.filter(b => 
      b.status === 'confirmed' || b.status === 'completed' || b.status === 'in-progress'
    ).length;
    R = confirmedBookings / bookings.length;
  }
  
  // D = Recency-decayed rating
  let D = 0.5;
  if (reviews && reviews.length > 0) {
    const now = new Date();
    let weightedSum = 0;
    let weightSum = 0;
    
    reviews.forEach(review => {
      const ageDays = (now - new Date(review.createdAt)) / (1000 * 60 * 60 * 24);
      const weight = Math.exp(-ageDays / 45);
      weightedSum += (review.rating / 5) * weight;
      weightSum += weight;
    });
    
    D = weightSum > 0 ? weightedSum / weightSum : 0.5;
  }
  
  // B = Repeat booking ratio
  let B = 0;
  if (bookings && bookings.length > 0) {
    const uniqueCustomers = new Set(bookings.map(b => b.userId)).size;
    const totalBookings = bookings.length;
    if (uniqueCustomers > 0) {
      B = Math.min((totalBookings - uniqueCustomers) / uniqueCustomers, 1.0);
    }
  }
  
  // P = Geographic proximity multiplier
  let P = PROXIMITY_MULTIPLIERS.ONLINE;
  
  if (customerLocation && serviceLocation) {
    const distance = calculateDistance(customerLocation, serviceLocation);
    
    if (provider.isOnline) {
      P = PROXIMITY_MULTIPLIERS.ONLINE;
    } else if (distance <= 2) {
      P = PROXIMITY_MULTIPLIERS.WITHIN_2KM;
    } else if (distance <= 5) {
      P = PROXIMITY_MULTIPLIERS.WITHIN_5KM;
    } else if (distance <= 15) {
      P = PROXIMITY_MULTIPLIERS.WITHIN_15KM;
    } else if (distance <= 30) {
      P = PROXIMITY_MULTIPLIERS.WITHIN_30KM;
    } else {
      P = PROXIMITY_MULTIPLIERS.BEYOND_30KM;
    }
  }
  
  // Calculate final score
  const rawScore = (V * 0.25 + C * 0.30 + R * 0.20 + D * 0.15 + B * 0.10) * P;
  
  // Scale to 0-10 range
  const finalScore = Math.min(Math.max(rawScore * 10, 0), 10);
  
  return {
    score: parseFloat(finalScore.toFixed(2)),
    breakdown: {
      V: { value: V, weight: 0.25, contribution: V * 0.25 },
      C: { value: C, weight: 0.30, contribution: C * 0.30 },
      R: { value: R, weight: 0.20, contribution: R * 0.20 },
      D: { value: D, weight: 0.15, contribution: D * 0.15 },
      B: { value: B, weight: 0.10, contribution: B * 0.10 },
      P: { value: P, multiplier: true }
    }
  };
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (loc1, loc2) => {
  if (!loc1 || !loc2 || !loc1.lat || !loc1.lng || !loc2.lat || !loc2.lng) {
    return Infinity;
  }
  
  const R = 6371; // Earth's radius in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
};

// Rank services by trust score
const rankServicesByTrust = (services, customerOpts = {}) => {
  const ranked = services.map(service => {
    const trustData = calculateTrustScore(
      service.provider,
      service.bookings || [],
      service.reviews || [],
      {
        customerLocation: customerOpts.location,
        serviceLocation: service.location
      }
    );
    
    return {
      ...service.toJSON(),
      trustScore: trustData.score,
      trustBreakdown: trustData.breakdown
    };
  });
  
  // Sort by trust score descending
  return ranked.sort((a, b) => b.trustScore - a.trustScore);
};

// Update provider trust score in database
const updateProviderTrustScore = async (providerId, models) => {
  try {
    const { User, Booking, Review, Service } = models;
    
    const provider = await User.findByPk(providerId);
    if (!provider) return;
    
    // Get all services by this provider
    const services = await Service.findAll({
      where: { providerId }
    });
    
    const serviceIds = services.map(s => s.id);
    
    // Get all bookings for these services
    const bookings = await Booking.findAll({
      where: { serviceId: serviceIds }
    });
    
    // Get all reviews for these services
    const reviews = await Review.findAll({
      where: { serviceId: serviceIds }
    });
    
    const trustData = calculateTrustScore(provider, bookings, reviews);
    
    await provider.update({ trustScore: trustData.score });
    
    return trustData;
  } catch (error) {
    console.error('Error updating trust score:', error);
    return null;
  }
};

module.exports = {
  calculateTrustScore,
  rankServicesByTrust,
  updateProviderTrustScore,
  calculateDistance,
  PROXIMITY_MULTIPLIERS
};
