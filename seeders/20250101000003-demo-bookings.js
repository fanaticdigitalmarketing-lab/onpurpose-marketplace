'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Bookings', [
      {
        userId: 1, // John Doe
        hostId: 1, // Cozy Downtown Apartment
        startTime: new Date('2025-01-15 14:00:00'),
        endTime: new Date('2025-01-15 18:00:00'),
        totalPrice: 100.00,
        status: 'confirmed',
        paymentStatus: 'paid',
        specialRequests: 'Please ensure the apartment is clean and ready by 2 PM.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 1, // John Doe
        hostId: 2, // Modern Conference Room
        startTime: new Date('2025-01-20 09:00:00'),
        endTime: new Date('2025-01-20 12:00:00'),
        totalPrice: 135.00,
        status: 'pending',
        paymentStatus: 'pending',
        specialRequests: 'Need setup for 10 people presentation.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Bookings', null, {});
  }
};
