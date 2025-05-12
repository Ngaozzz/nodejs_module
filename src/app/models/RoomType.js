// models/RoomType.js
const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: String,
        price: { type: Number, required: true },
        amenities: [String], // tiện nghi
        image: String,
    },
    { timestamps: true },
);

module.exports = mongoose.model('RoomType', roomTypeSchema);
