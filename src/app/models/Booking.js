const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
        },
        roomType: {
            type: Schema.Types.ObjectId,
            ref: 'RoomType',
            required: true,
        },
        checkIn: {
            type: Date,
            required: true,
            validate: {
                validator: function (v) {
                    return v instanceof Date;
                },
                message: (props) => `${props.value} là ngày không hợp lệ!`,
            },
        },
        checkOut: {
            type: Date,
            required: true,
            validate: {
                validator: function (v) {
                    return v instanceof Date;
                },
                message: (props) => `${props.value} là ngày không hợp lệ!`,
            },
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending',
        },
        totalPrice: {
            type: Number,
            default: 0,
        },
        deposit: { type: Number, required: true },

        paymentNote: {
            type: String,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        isDepositPaid: { type: Boolean, default: false },
    },
    { timestamps: true },
);

// Thêm phương thức để tính toán tổng tiền
bookingSchema.pre('save', async function (next) {
    if (this.isNew) {
        const room = await mongoose.model('Room').findById(this.room);
        if (room) {
            const nights =
                (new Date(this.checkOut) - new Date(this.checkIn)) /
                (1000 * 3600 * 24);
            this.totalPrice = room.price * nights; // Giả sử price là giá phòng mỗi đêm
        }
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
