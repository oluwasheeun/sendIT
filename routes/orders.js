const express = require('express');
const {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    cancelOrder,
    changeDestination,
    changeStatus,
    changePresentLocation,
} = require('../controllers/orders');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(protect, getOrders)
    .post(protect, authorize('user'), createOrder);

router.route('/:parcelId').get(protect, getOrder).put(protect, updateOrder);

router.route('/:parcelId/cancel').put(protect, cancelOrder);

router
    .route('/:parcelId/destination')
    .put(protect, authorize('user'), changeDestination);

router
    .route('/:parcelId/status')
    .put(protect, authorize('admin'), changeStatus);

router
    .route('/:parcelId/presentLocation')
    .put(protect, authorize('admin'), changePresentLocation);

module.exports = router;
