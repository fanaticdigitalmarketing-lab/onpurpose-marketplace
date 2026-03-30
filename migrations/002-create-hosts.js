'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Hosts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      category: {
        type: Sequelize.ENUM('Local Expert', 'Cultural Guide', 'Wellness Coach', 'Creative Mentor', 'Professional Networker'),
        allowNull: false
      },
      hourlyRate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      experience: {
        type: Sequelize.TEXT
      },
      skills: {
        type: Sequelize.JSON
      },
      languages: {
        type: Sequelize.JSON
      },
      location: {
        type: Sequelize.STRING
      },
      availability: {
        type: Sequelize.JSON
      },
      approvalStatus: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0
      },
      totalBookings: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('Hosts', ['userId']);
    await queryInterface.addIndex('Hosts', ['category']);
    await queryInterface.addIndex('Hosts', ['approvalStatus']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Hosts');
  }
};
