const express = require('express');
// const {} = require('../controllers/users');

//Include other resource routers
const orderRouter = require('./orders');

const router = express.Router();

//Re-route into other resource routers
router.use('/:userId/parcels', orderRouter);

module.exports = router;
