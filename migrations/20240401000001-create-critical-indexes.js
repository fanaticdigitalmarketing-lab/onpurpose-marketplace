'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // RULE 1: INDEX ALL CRITICAL FIELDS
    
    // User table indexes
    await queryInterface.addIndex('Users', ['email'], {
      name: 'idx_users_email',
      unique: true,
      fields: ['email']
    });
    
    await queryInterface.addIndex('Users', ['role'], {
      name: 'idx_users_role',
      fields: ['role']
    });
    
    await queryInterface.addIndex('Users', ['createdAt'], {
      name: 'idx_users_created_at',
      fields: ['createdAt']
    });
    
    // Service table indexes
    await queryInterface.addIndex('Services', ['providerId'], {
      name: 'idx_services_provider_id',
      fields: ['providerId']
    });
    
    await queryInterface.addIndex('Services', ['category'], {
      name: 'idx_services_category',
      fields: ['category']
    });
    
    await queryInterface.addIndex('Services', ['isActive'], {
      name: 'idx_services_is_active',
      fields: ['isActive']
    });
    
    await queryInterface.addIndex('Services', ['createdAt'], {
      name: 'idx_services_created_at',
      fields: ['createdAt']
    });
    
    // Booking table indexes
    await queryInterface.addIndex('Bookings', ['userId'], {
      name: 'idx_bookings_user_id',
      fields: ['userId']
    });
    
    await queryInterface.addIndex('Bookings', ['providerId'], {
      name: 'idx_bookings_provider_id',
      fields: ['providerId']
    });
    
    await queryInterface.addIndex('Bookings', ['serviceId'], {
      name: 'idx_bookings_service_id',
      fields: ['serviceId']
    });
    
    await queryInterface.addIndex('Bookings', ['status'], {
      name: 'idx_bookings_status',
      fields: ['status']
    });
    
    await queryInterface.addIndex('Bookings', ['date'], {
      name: 'idx_bookings_date',
      fields: ['date']
    });
    
    // Review table indexes
    await queryInterface.addIndex('Reviews', ['serviceId'], {
      name: 'idx_reviews_service_id',
      fields: ['serviceId']
    });
    
    await queryInterface.addIndex('Reviews', ['userId'], {
      name: 'idx_reviews_user_id',
      fields: ['userId']
    });
    
    await queryInterface.addIndex('Reviews', ['rating'], {
      name: 'idx_reviews_rating',
      fields: ['rating']
    });
    
    // Composite indexes for common query patterns
    await queryInterface.addIndex('Services', ['providerId', 'isActive'], {
      name: 'idx_services_provider_active',
      fields: ['providerId', 'isActive']
    });
    
    await queryInterface.addIndex('Bookings', ['userId', 'status'], {
      name: 'idx_bookings_user_status',
      fields: ['userId', 'status']
    });
    
    await queryInterface.addIndex('Bookings', ['providerId', 'status'], {
      name: 'idx_bookings_provider_status',
      fields: ['providerId', 'status']
    });
    
    console.log('✅ Critical database indexes created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes in reverse order
    
    // Composite indexes
    await queryInterface.removeIndex('Bookings', 'idx_bookings_provider_status');
    await queryInterface.removeIndex('Bookings', 'idx_bookings_user_status');
    await queryInterface.removeIndex('Services', 'idx_services_provider_active');
    
    // Review table indexes
    await queryInterface.removeIndex('Reviews', 'idx_reviews_rating');
    await queryInterface.removeIndex('Reviews', 'idx_reviews_user_id');
    await queryInterface.removeIndex('Reviews', 'idx_reviews_service_id');
    
    // Booking table indexes
    await queryInterface.removeIndex('Bookings', 'idx_bookings_date');
    await queryInterface.removeIndex('Bookings', 'idx_bookings_status');
    await queryInterface.removeIndex('Bookings', 'idx_bookings_service_id');
    await queryInterface.removeIndex('Bookings', 'idx_bookings_provider_id');
    await queryInterface.removeIndex('Bookings', 'idx_bookings_user_id');
    
    // Service table indexes
    await queryInterface.removeIndex('Services', 'idx_services_created_at');
    await queryInterface.removeIndex('Services', 'idx_services_is_active');
    await queryInterface.removeIndex('Services', 'idx_services_category');
    await queryInterface.removeIndex('Services', 'idx_services_provider_id');
    
    // User table indexes
    await queryInterface.removeIndex('Users', 'idx_users_created_at');
    await queryInterface.removeIndex('Users', 'idx_users_role');
    await queryInterface.removeIndex('Users', 'idx_users_email');
    
    console.log('✅ Critical database indexes removed successfully');
  }
};
