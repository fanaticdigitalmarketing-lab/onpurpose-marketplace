// ========================================
// ONPURPOSE MARKETPLACE - WINDSURF FIXED SEED
// ========================================
// Fixed seed file with properly hashed passwords
// ========================================

const sequelize = require('./config/sequelize');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Starting OnPurpose database seeding...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created');
    
    // Define models (same as server)
    const User = sequelize.define('User', {
      id: {
        type: sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      firstName: { type: sequelize.DataTypes.STRING, allowNull: false },
      lastName: { type: sequelize.DataTypes.STRING, allowNull: false },
      email: { type: sequelize.DataTypes.STRING, allowNull: false, unique: true },
      password: { type: sequelize.DataTypes.STRING, allowNull: false },
      phone: { type: sequelize.DataTypes.STRING },
      isHost: { type: sequelize.DataTypes.BOOLEAN, defaultValue: false },
      isVerified: { type: sequelize.DataTypes.BOOLEAN, defaultValue: true },
      bio: { type: sequelize.DataTypes.TEXT },
      location: { type: sequelize.DataTypes.STRING }
    }, { timestamps: true });

    const Host = sequelize.define('Host', {
      id: {
        type: sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: { type: sequelize.DataTypes.INTEGER, allowNull: false },
      category: { type: sequelize.DataTypes.STRING, allowNull: false },
      hourlyRate: { type: sequelize.DataTypes.DECIMAL(10, 2), allowNull: false },
      experience: { type: sequelize.DataTypes.TEXT, allowNull: false },
      skills: { type: sequelize.DataTypes.JSON },
      languages: { type: sequelize.DataTypes.JSON },
      location: { type: sequelize.DataTypes.STRING, allowNull: false },
      isActive: { type: sequelize.DataTypes.BOOLEAN, defaultValue: true }
    }, { timestamps: true });

    const Booking = sequelize.define('Booking', {
      id: {
        type: sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: { type: sequelize.DataTypes.INTEGER, allowNull: false },
      hostId: { type: sequelize.DataTypes.INTEGER, allowNull: false },
      startTime: { type: sequelize.DataTypes.DATE, allowNull: false },
      endTime: { type: sequelize.DataTypes.DATE, allowNull: false },
      notes: { type: sequelize.DataTypes.TEXT },
      totalPrice: { type: sequelize.DataTypes.DECIMAL(10, 2), allowNull: false },
      status: {
        type: sequelize.DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
        defaultValue: 'pending'
      }
    }, { timestamps: true });

    // Relationships
    User.hasMany(Host, { foreignKey: 'userId' });
    Host.belongsTo(User, { foreignKey: 'userId' });
    User.hasMany(Booking, { foreignKey: 'userId' });
    Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Host.hasMany(Booking, { foreignKey: 'hostId' });
    Booking.belongsTo(Host, { foreignKey: 'hostId', as: 'host' });

    // Create demo users with properly hashed passwords
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = await User.bulkCreate([
      {
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@onpurpose.app',
        password: hashedPassword,
        phone: '+1-555-0101',
        isHost: true,
        isVerified: true,
        bio: 'NYC native with 10+ years experience showing visitors the real New York. I specialize in local food tours and cultural experiences.',
        location: 'Manhattan, NYC'
      },
      {
        firstName: 'Marcus',
        lastName: 'Johnson',
        email: 'marcus.j@onpurpose.app',
        password: hashedPassword,
        phone: '+1-555-0102',
        isHost: true,
        isVerified: true,
        bio: 'Artist and cultural curator specializing in Brooklyn\'s vibrant arts scene. Let me show you the creative heart of NYC.',
        location: 'Brooklyn, NYC'
      },
      {
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily.r@onpurpose.app',
        password: hashedPassword,
        phone: '+1-555-0103',
        isHost: false,
        isVerified: true,
        bio: 'Looking for authentic experiences and connections in the city.',
        location: 'Queens, NYC'
      },
      {
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.k@onpurpose.app',
        password: hashedPassword,
        phone: '+1-555-0104',
        isHost: false,
        isVerified: true,
        bio: 'Adventure seeker and food enthusiast. Ready to explore NYC like a local!',
        location: 'Manhattan, NYC'
      },
      {
        firstName: 'Lisa',
        lastName: 'Thompson',
        email: 'lisa.t@onpurpose.app',
        password: hashedPassword,
        phone: '+1-555-0105',
        isHost: true,
        isVerified: true,
        bio: 'Wellness coach and yoga instructor. Helping people find balance and peace in the city that never sleeps.',
        location: 'Upper West Side, NYC'
      }
    ]);
    
    console.log('✅ Demo users created');

    // Create host profiles
    const hosts = await Host.bulkCreate([
      {
        userId: users[0].id, // Sarah Chen
        category: 'Local Expert',
        hourlyRate: 75.00,
        experience: '10+ years as a NYC tour guide. I know all the hidden gems and local secrets that tourists never find. From the best pizza joints to secret rooftop bars, I\'ll show you the real New York City.',
        skills: ['Tour Guiding', 'Local History', 'Food Knowledge', 'Photography'],
        languages: ['English', 'Mandarin', 'Spanish'],
        location: 'Manhattan, NYC',
        isActive: true
      },
      {
        userId: users[1].id, // Marcus Johnson
        category: 'Cultural Guide',
        hourlyRate: 60.00,
        experience: 'Brooklyn native and professional artist. I\'ve been part of the art scene for 15 years and can give you exclusive access to galleries, studios, and artist workshops.',
        skills: ['Art Curation', 'Gallery Tours', 'Creative Workshops', 'Street Art'],
        languages: ['English', 'French'],
        location: 'Brooklyn, NYC',
        isActive: true
      },
      {
        userId: users[4].id, // Lisa Thompson
        category: 'Wellness Coach',
        hourlyRate: 90.00,
        experience: 'Certified yoga instructor and wellness coach for 8 years. I specialize in stress management, meditation, and helping people find work-life balance in urban environments.',
        skills: ['Yoga', 'Meditation', 'Wellness Coaching', 'Stress Management'],
        languages: ['English', 'Sanskrit'],
        location: 'Upper West Side, NYC',
        isActive: true
      }
    ]);
    
    console.log('✅ Host profiles created');

    // Create sample bookings
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 1 week from now
    
    const bookings = await Booking.bulkCreate([
      {
        userId: users[2].id, // Emily Rodriguez
        hostId: hosts[0].id, // Sarah Chen's tour
        startTime: new Date(futureDate.getTime() + 14 * 60 * 60 * 1000), // 2 PM
        endTime: new Date(futureDate.getTime() + 17 * 60 * 60 * 1000), // 5 PM
        notes: 'Looking forward to exploring NYC food scene! Vegetarian friendly options appreciated.',
        totalPrice: 225.00, // 3 hours * $75
        status: 'confirmed'
      },
      {
        userId: users[3].id, // David Kim
        hostId: hosts[1].id, // Marcus Johnson's art tour
        startTime: new Date(futureDate.getTime() + 10 * 60 * 60 * 1000), // 10 AM
        endTime: new Date(futureDate.getTime() + 12 * 60 * 60 * 1000), // 12 PM
        notes: 'Interested in street art and emerging artists. Can we visit some independent galleries?',
        totalPrice: 120.00, // 2 hours * $60
        status: 'pending'
      }
    ]);
    
    console.log('✅ Sample bookings created');

    // Display summary
    console.log('🎉 OnPurpose database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Hosts: ${hosts.length}`);
    console.log(`   - Bookings: ${bookings.length}`);
    console.log('');
    console.log('🔑 Login credentials:');
    console.log('   Email: sarah.chen@onpurpose.app | Password: password123');
    console.log('   Email: marcus.j@onpurpose.app | Password: password123');
    console.log('   Email: emily.r@onpurpose.app | Password: password123');
    console.log('   Email: david.k@onpurpose.app | Password: password123');
    console.log('   Email: lisa.t@onpurpose.app | Password: password123');
    console.log('');
    console.log('🚀 Start the server with: npm run dev');
    console.log('📱 Test the API at: http://localhost:3000');
    console.log('🏥 Health check: http://localhost:3000/health');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;

// ========================================
// END OF WINDSURF FIXED SEED FILE
// ========================================
