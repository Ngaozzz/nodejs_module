// models/Room.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true }, // Số phòng
    roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
    status: {
        type: String,
        enum: ['available', 'booked', 'maintenance'],
        default: 'available',
    },
});

module.exports = mongoose.model('Room', roomSchema);
