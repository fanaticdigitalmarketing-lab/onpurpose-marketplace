'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Hosts', [
      {
        userId: 2, // Jane Smith
        title: 'Cozy Downtown Apartment',
        description: 'Beautiful 2-bedroom apartment in the heart of downtown with modern amenities and great city views.',
        location: 'Downtown, New York, NY',
        pricePerHour: 25.00,
        availability: JSON.stringify({
          monday: { start: '09:00', end: '22:00' },
          tuesday: { start: '09:00', end: '22:00' },
          wednesday: { start: '09:00', end: '22:00' },
          thursday: { start: '09:00', end: '22:00' },
          friday: { start: '09:00', end: '23:00' },
          saturday: { start: '10:00', end: '23:00' },
          sunday: { start: '10:00', end: '21:00' }
        }),
        amenities: JSON.stringify(['WiFi', 'Kitchen', 'Parking', 'Air Conditioning', 'TV']),
        images: JSON.stringify(['apartment1.jpg', 'apartment2.jpg', 'apartment3.jpg']),
        rating: 4.8,
        totalBookings: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 3, // Mike Johnson
        title: 'Modern Conference Room',
        description: 'Professional conference room perfect for business meetings, equipped with projector and whiteboard.',
        location: 'Business District, San Francisco, CA',
        pricePerHour: 45.00,
        availability: JSON.stringify({
          monday: { start: '08:00', end: '18:00' },
          tuesday: { start: '08:00', end: '18:00' },
          wednesday: { start: '08:00', end: '18:00' },
          thursday: { start: '08:00', end: '18:00' },
          friday: { start: '08:00', end: '17:00' }
        }),
        amenities: JSON.stringify(['WiFi', 'Projector', 'Whiteboard', 'Coffee Machine', 'Parking']),
        images: JSON.stringify(['conference1.jpg', 'conference2.jpg']),
        rating: 4.9,
        totalBookings: 32,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Hosts', null, {});
  }
};
