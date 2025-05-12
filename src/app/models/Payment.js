const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
        },
        amount: { type: Number, required: true },
        paymentMethod: {
            type: String,
            enum: ['credit_card', 'momo', 'cash'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
        },
        transactionId: { type: String },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Payment', paymentSchema);
