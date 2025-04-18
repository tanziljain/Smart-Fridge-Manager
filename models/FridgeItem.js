const mongoose = require('mongoose');

const fridgeItemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide item name'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please provide category'],
        enum: ['produce', 'dairy', 'meat', 'pantry', 'other']
    },
    quantity: {
        type: String,
        required: [true, 'Please provide quantity']
    },
    expiry: {
        type: Date,
        required: [true, 'Please provide expiry date']
    },
    addedDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'consumed'],
        default: 'active'
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for faster queries
fridgeItemSchema.index({ user: 1, expiry: 1 });
fridgeItemSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('FridgeItem', fridgeItemSchema); 