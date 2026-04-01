/**
 * OnPurpose Seed Data
 * Creates demo users, services, bookings, and reviews
 * © 2025 OnPurpose Inc. All rights reserved.
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, models } = require('./server');

const { User, Service, Booking, Review, Availability } = models;

const DEMO_PASSWORD = 'DemoPassword123!';
const BCRYPT_PEPPER = process.env.BCRYPT_PEPPER || '';
const BCRYPT_ROUNDS = 12;

const hashPw = async (plain) => bcrypt.hash(plain + BCRYPT_PEPPER, BCRYPT_ROUNDS);

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    const pw = await hashPw(DEMO_PASSWORD);

    console.log('Creating users...');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.onpurpose.app',
      password: pw,
      role: 'admin',
      isVerified: true,
      bio: 'Platform administrator'
    });

    const provider1 = await User.create({
      name: 'Sarah Chen',
      email: 'sarah@demo.onpurpose.app',
      password: pw,
      role: 'provider',
      isVerified: true,
      verifiedCredential: true,
      bio: 'Career coach with 10+ years experience in tech industry. Helped 200+ professionals land their dream jobs.',
      location: 'New York, NY',
      trustScore: 9.2
    });

    const provider2 = await User.create({
      name: 'Marcus Johnson',
      email: 'marcus@demo.onpurpose.app',
      password: pw,
      role: 'provider',
      isVerified: true,
      verifiedCredential: true,
      bio: 'Marketing expert specializing in growth strategies for startups and small businesses.',
      location: 'Brooklyn, NY',
      trustScore: 8.5
    });

    const customer = await User.create({
      name: 'Alex Rivera',
      email: 'alex@demo.onpurpose.app',
      password: pw,
      role: 'customer',
      isVerified: true,
      bio: 'Looking to grow my career and learn new skills'
    });

    console.log('Users created: 4');

    console.log('Creating services...');

    const service1 = await Service.create({
      title: 'Career Coaching Session',
      description: 'One-on-one career coaching to help you navigate your professional path. Includes resume review, interview prep, and career strategy.',
      price: 150.00,
      category: 'Career Coaching',
      providerId: provider1.id,
      duration: 60,
      location: 'Manhattan, NY',
      isOnline: true,
      avgRating: 4.8,
      reviewCount: 1
    });

    const service2 = await Service.create({
      title: 'Marketing Strategy Consultation',
      description: 'Comprehensive marketing strategy session covering digital marketing, brand positioning, and growth tactics for startups.',
      price: 200.00,
      category: 'Marketing',
      providerId: provider2.id,
      duration: 90,
      location: 'Brooklyn, NY',
      isOnline: true,
      avgRating: 4.5,
      reviewCount: 0
    });

// // // // // // // // // // // // // // // // // // const service3 = await Service.create({ // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
      title: 'Resume & LinkedIn Optimization',
      description: 'Professional resume writing and LinkedIn profile optimization to help you stand out to recruiters.',
      price: 120.00,
      category: 'Career Coaching',
      providerId: provider1.id,
      duration: 45,
      location: 'Remote',
      isOnline: true,
      avgRating: 0,
      reviewCount: 0
    });

// // // // // // // // // // // // // // // // // // const service4 = await Service.create({ // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
      title: 'Local NYC Tour Guide',
      description: 'Discover hidden gems in NYC with a local expert. Personalized tours of neighborhoods, food spots, and cultural landmarks.',
      price: 75.00,
      category: 'Local Expert',
      providerId: provider2.id,
      duration: 120,
      location: 'New York, NY',
      isOnline: false,
      avgRating: 0,
      reviewCount: 0
    });

// // // // // // // // // // // // // // // // // // const service5 = await Service.create({ // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
      title: 'Wellness & Mindfulness Coaching',
      description: 'Guided mindfulness and wellness sessions to reduce stress, improve focus, and build healthy daily routines.',
      price: 90.00,
      category: 'Wellness',
      providerId: provider1.id,
      duration: 60,
      location: 'Central Park, NY',
      isOnline: false,
      avgRating: 0,
      reviewCount: 0
    });

    console.log('Services created: 5');

    console.log('Creating availability...');

    for (let day = 1; day <= 5; day++) {
      await Availability.create({ providerId: provider1.id, dayOfWeek: day, startTime: '09:00', endTime: '17:00' });
    }
    for (let day = 1; day <= 5; day++) {
      await Availability.create({ providerId: provider2.id, dayOfWeek: day, startTime: '10:00', endTime: '18:00' });
    }
    await Availability.create({ providerId: provider2.id, dayOfWeek: 6, startTime: '10:00', endTime: '14:00' });

    console.log('Availability created');

    console.log('Creating bookings...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

// // // // // // // // // // // // // // // // // // const booking1 = await Booking.create({ // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
      userId: customer.id,
      serviceId: service1.id,
      date: tomorrow.toISOString().split('T')[0],
      time: '14:00',
      status: 'confirmed',
      totalAmount: 150.00,
      platformFee: 22.50,
      providerAmount: 127.50,
      paymentStatus: 'paid',
      notes: 'Looking forward to discussing career transition'
    });

// // // // // // // // // // // // // // // // // // const booking2 = await Booking.create({ // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
      userId: customer.id,
      serviceId: service2.id,
      date: nextWeek.toISOString().split('T')[0],
      time: '10:00',
      status: 'confirmed',
      totalAmount: 200.00,
      platformFee: 30.00,
      providerAmount: 170.00,
      paymentStatus: 'paid',
      notes: 'Need help with startup marketing strategy'
    });

    console.log('Confirmed bookings created: 2');

    console.log('Creating completed booking + review...');

    const pastBooking = await Booking.create({
      userId: customer.id,
      serviceId: service1.id,
      date: '2025-03-01',
      time: '15:00',
      status: 'completed',
      totalAmount: 150.00,
      platformFee: 22.50,
      providerAmount: 127.50,
      paymentStatus: 'paid',
      sessionStartTime: new Date('2025-03-01T15:00:00'),
      sessionEndTime: new Date('2025-03-01T16:00:00'),
      sessionDurationMinutes: 60
    });

    await Review.create({
      bookingId: pastBooking.id,
      userId: customer.id,
      serviceId: service1.id,
      rating: 5,
      comment: 'Sarah was amazing! She helped me completely revamp my resume and gave me great interview tips. Highly recommend!'
    });

    console.log('Completed booking + review created: 1');

    console.log('\n========================================');
    console.log('SEED COMPLETED SUCCESSFULLY');
    console.log('========================================');
    console.log('\nDemo Accounts (password: DemoPassword123!):');
    console.log('  Admin:     admin@demo.onpurpose.app');
    console.log('  Provider:  sarah@demo.onpurpose.app');
    console.log('  Provider:  marcus@demo.onpurpose.app');
    console.log('  Customer:  alex@demo.onpurpose.app');
    console.log('\n5 services, 2 confirmed paid bookings, 1 completed with review');
    console.log('========================================');

    process.exit(0);

  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
