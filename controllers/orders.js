const db = require('../config/db');
const Order = require('../models/Orders');

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
        query = Order.findAll({ where: { user: req.params.userId } });
      }
    } else {
      //Only Admin can view all order
      //@route GET/parcels
      if (req.user.role === 'admin') {
        query = Order.findAll();
      }
    }

    const orders = await query;

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.log(err.message.red);
    res.status(400).json({
      success: false,
      error: err.message,
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

    let {
      description,
      pickupLocation,
      destination,
      recipientName,
      phone,
      user,
      presentLocation,
    } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Please add a description' });
    }
    if (!pickupLocation) {
      return res.status(400).json({ message: 'Please add Pickup address' });
    }
    if (!destination) {
      return res.status(400).json({ message: 'Please add destination' });
    }
    if (!recipientName) {
      return res.status(400).json({ message: 'Please add recipient name' });
    }
    if (!phone) {
      return res.status(400).json({ message: 'Please add phone number' });
    }

    const order = await Order.create({
      description,
      pickupLocation,
      destination,
      recipientName,
      phone,
      user,
      presentLocation,
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.log(err.message.red);
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc Update Order
// @route PUT /parcels/parcelId
exports.updateOrder = async (req, res, next) => {
  try {
    let order = await Order.findByPk(req.params.parcelId);

    if (!order) {
      return res.status(404).json({
        message: `Order not found with id of ${req.params.parcelId}`,
      });
    }

    //Make sure user is order owner
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: `User ${req.user.id} is not authorized to update this Order`,
      });
    }

    order = await Order.update(req.body, {
      returning: true,
      where: { id: req.params.parcelId },
    });

    res.status(200).json({ success: true, data: order[1][0] });
  } catch (err) {
    console.log(err.message.red);

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc Cancel the specific parcel delivery order
// @route PUT /parcels/<parcelId>/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    let order = await Order.findByPk(req.params.parcelId);

    if (!order) {
      return res.status(404).json({
        message: `Order not found with id of ${req.params.parcelId}`,
      });
    }

    // Make sure user is order owner
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: `User ${req.user.id} is not authorized to delete this Order`,
      });
    }

    order = await Order.destroy({
      where: { id: req.params.parcelId },
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.log(err.message.red);

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc Change the location of a specific parcel delivery order
// @route PUT /parcels/<parcelId>/destination
exports.changeDestination = async (req, res, next) => {
  try {
    let order = await Order.findByPk(req.params.parcelId);

    if (!order) {
      return res.status(404).json({
        message: `Order not found with id of ${req.params.parcelId}`,
      });
    }

    // Make sure only the user who creates order can make change
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: `User ${req.user.id} is not authorized to update this Order`,
      });
    }

    order = await Order.update(
      { destination: req.body.destination },
      {
        returning: true,
        where: { id: req.params.parcelId },
      }
    );

    res.status(200).json({ success: true, data: order[1][0] });
  } catch (err) {
    console.log(err.message.red);

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc Change the status of specific parcel delivery order
// @route PUT /parcels/<parcelId>/status
exports.changeStatus = async (req, res, next) => {
  try {
    let order = await Order.findByPk(req.params.parcelId);

    if (!order) {
      return res.status(404).json({
        message: `Order not found with id of ${req.params.parcelId}`,
      });
    }

    // Make sure only Admin can update
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: `User ${req.user.id} is not authorized to update this Order`,
      });
    }

    order = await Order.update(
      { status: req.body.status },
      {
        returning: true,
        where: { id: req.params.parcelId },
      }
    );

    res.status(200).json({ success: true, data: order[1][0] });
  } catch (err) {
    console.log(err.message.red);

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc Change the present location of a specific parcel delivery order
// @route PUT /parcels/<parcelId>/presentLocation
exports.changePresentLocation = async (req, res, next) => {
  try {
    let order = await Order.findByPk(req.params.parcelId);

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

    order = await Order.update(
      { presentLocation: req.body.presentLocation },
      {
        returning: true,
        where: { id: req.params.parcelId },
      }
    );

    res.status(200).json({ success: true, data: order[1][0] });
  } catch (err) {
    console.log(err.message.red);

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};
