const Order = require('../models/Orders');
const User = require('../models/Users');

// @desc Fetch all orders or parcels delivery orders by a specific user
// @route GET /parcels
// @route GET /users/<userId>/parcels
exports.getOrders = async (req, res, next) => {
    try {
        let query;

        if (req.params.userId) {
            //Make sure user owns the orders
            //@route GET /users/<userId>/parcels
            if (req.params.userId === req.user.id) {
                query = Order.find({ user: req.params.userId });
            }
        } else {
            //Only Admin can view all order
            //@route GET/parcels
            if (req.user.role === 'admin') {
                query = Order.find();
            }
        }
        const orders = await query;

        res.status(200).json({
            success: true,
            orderCount: orders.length,
            data: orders,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
        });
    }
};

// @desc Fetch a specific parcel delivery order
// @route GET /parcels:parcelId
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.parcelId);

        if (!order) {
            return res.status(404).json({
                message: `Order not found with id of ${req.params.parcelId}`,
            });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (err) {
        console.log(err.message.red);

        res.status(400).json({
            success: false,
        });
    }
};

// @desc Create a parcel delivery order
// @route POST /parcels
exports.createOrder = async (req, res, next) => {
    try {
        //Add user to req.body
        req.body.user = req.user.id;

        //set current percel location to pick location
        req.body.presentLocation = req.body.pickupLocation;

        const order = await Order.create(req.body);

        res.status(201).json({
            success: true,
            data: order,
        });
    } catch (err) {
        console.log(err.message.red);

        res.status(400).json({
            success: false,
            error: 'Invalid input',
        });
    }
};

// @desc Update Order
// @route PUT /parcels/parcelId
exports.updateOrder = async (req, res, next) => {
    try {
        let order = await Order.findById(req.params.parcelId);

        if (!order) {
            return res.status(404).json({
                message: `Order not found with id of ${req.params.parcelId}`,
            });
        }

        //Make sure user is order owner
        if (
            order.user.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(401).json({
                success: false,
                error: `User ${req.user.id} is not authorized to update this Order`,
            });
        }

        order = await Order.findByIdAndUpdate(req.params.parcelId, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        console.log(err.message.red);

        res.status(400).json({
            success: false,
            error: 'Invalid input',
        });
    }
};

// @desc Cancel the specific parcel delivery order
// @route PUT /parcels/<parcelId>/cancel
exports.cancelOrder = async (req, res, next) => {
    try {
        let order = await Order.findById(req.params.parcelId);

        if (!order) {
            return res.status(404).json({
                message: `Order not found with id of ${req.params.parcelId}`,
            });
        }

        //Make sure user is order owner
        if (
            order.user.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(401).json({
                success: false,
                error: `User ${req.user.id} is not authorized to delete this Order`,
            });
        }

        order = await Order.findByIdAndDelete(req.params.parcelId);

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (err) {
        console.log(err.message.red);

        res.status(400).json({
            success: false,
        });
    }
};

// @desc Change the location of a specific parcel delivery order
// @route PUT /parcels/<parcelId>/destination
exports.changeDestination = async (req, res, next) => {
    try {
        let order = await Order.findById(req.params.parcelId);

        if (!order) {
            return res.status(404).json({
                message: `Order not found with id of ${req.params.parcelId}`,
            });
        }

        //Make sure only the user who creates order can make change
        if (order.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                error: `User ${req.user.id} is not authorized to update this Order`,
            });
        }

        order = await Order.findByIdAndUpdate(
            req.params.parcelId,
            { $set: { destination: req.body.destination } },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        console.log(err.message.red);

        res.status(400).json({
            success: false,
            error: 'Invalid input',
        });
    }
};

// @desc Change the status of specific parcel delivery order
// @route PUT /parcels/<parcelId>/status
exports.changeStatus = async (req, res, next) => {
    try {
        let order = await Order.findById(req.params.parcelId);

        if (!order) {
            return res.status(404).json({
                message: `Order not found with id of ${req.params.parcelId}`,
            });
        }

        //Make sure only Admin can update
        if (req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: `User ${req.user.id} is not authorized to update this Order`,
            });
        }

        order = await Order.findByIdAndUpdate(
            req.params.parcelId,
            { $set: { status: req.body.status } },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        console.log(err.message.red);

        res.status(400).json({
            success: false,
            error: 'Invalid input',
        });
    }
};

// @desc Change the present location of a specific parcel delivery order
// @route PUT /parcels/<parcelId>/presentLocation
exports.changePresentLocation = async (req, res, next) => {
    try {
        let order = await Order.findById(req.params.parcelId);

        if (!order) {
            return res.status(404).json({
                message: `Order not found with id of ${req.params.parcelId}`,
            });
        }

        //Make sure only Admin can update
        if (req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                error: `User ${req.user.id} is not authorized to update this Order`,
            });
        }

        order = await Order.findByIdAndUpdate(
            req.params.parcelId,
            { $set: { presentLocation: req.body.presentLocation } },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        console.log(err.message.red);

        res.status(400).json({
            success: false,
            error: 'Invalid input',
        });
    }
};
