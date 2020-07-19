require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const colors = require('colors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const cors = require('cors');

// Connect DB
const db = require('./config/db');

// Test DB
db.authenticate()
  .then(() => console.log('Database Connected....'.cyan.bold.underline))
  .catch((err) => console.log('Error: ' + err));

//Route Files
const orders = require('./routes/orders');
const auth = require('./routes/auth');
const users = require('./routes/users');

const app = express();

//Bodyparser middleware
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//enable cors
app.use(cors());

//Mount routers
app.use('/parcels', orders);
app.use('/auth', auth);
app.use('/users', users);

const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //Close server & exit process
  // server.close(() => process.exit());
});
