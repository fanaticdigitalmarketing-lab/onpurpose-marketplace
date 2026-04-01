'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Services', 'image', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Service image stored as base64 data URI'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Services', 'image');
  }
};
