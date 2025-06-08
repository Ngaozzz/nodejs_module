const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Feedback', feedbackSchema);
