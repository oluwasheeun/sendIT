const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    pickupLocation: {
        type: String,
        required: [true, 'Please add an address'],
    },
    destination: {
        type: String,
        required: [true, 'Please add an address'],
    },
    recipientName: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters'],
    },
    phone: {
        type: String,
        required: true,
        maxlength: [20, 'Phone number can not be longer than 20 characters'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['In-Transit', 'Delivered', 'Cancelled'],
        default: 'In-Transit',
    },
    presentLocation: {
        type: String,
    },
});

module.exports = mongoose.model('Order', OrderSchema);
