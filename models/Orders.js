const { Sequelize } = require('sequelize');
const db = require('../config/db');

const Order = db.define('orders', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV1,
    primaryKey: true,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  pickupLocation: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  destination: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  recipientName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  user: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM('In-Transit', 'Delivered'),
    defaultValue: 'In-Transit',
    validate: {
      isIn: [['In-Transit', 'Delivered']],
    },
  },
  presentLocation: {
    type: Sequelize.STRING,
  },
});

Order.sync().then(() => console.log('table created'));

module.exports = Order;
