const sequelize = require('../config/database');
const User = require('./User');
const Listing = require('./Listing');
const Booking = require('./Booking');

User.hasMany(Listing, { foreignKey: 'userId' });
Listing.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

Listing.hasMany(Booking, { foreignKey: 'listingId' });
Booking.belongsTo(Listing, { foreignKey: 'listingId' });

module.exports = {
  sequelize,
  User,
  Listing,
  Booking
};
