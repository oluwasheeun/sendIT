const { Sequelize } = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = db.define(
  'users',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV1,
      primaryKey: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: {
        args: 'email',
        msg: 'The email is already taken!',
      },
      validate: {
        isEmail: true,
        is: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/],
      },
    },
    role: {
      type: Sequelize.ENUM(),
      values: ['user', 'admin'],
      defaultValue: 'user',
      validate: {
        isIn: [['user', 'admin']],
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [8, 32],
          msg: 'Password must be upto 8 characters and less than 32 characters',
        },
      },
    },
  }
  // {
  //   defaultScope: {
  //     attributes: { exclude: ['password'] },
  //   },
  // }
);

// Encrypt password using bcrypt
User.beforeCreate(async (user, options) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(user.password, salt);
  user.password = hashedPassword;
});

User.sync().then(() => console.log('Table created'));

module.exports = User;
