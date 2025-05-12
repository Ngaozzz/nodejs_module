const Room = require('../models/Room');
const Booking = require('../models/Booking'); // Bổ sung đúng nè

module.exports = {
    getAll: async (req, res) => {
        try {
            const rooms = await Room.find().populate('roomType');
            res.json(rooms);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách phòng:', err);
            res.status(500).json({ message: 'Lỗi khi lấy danh sách phòng', error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const { roomNumber, roomType, status } = req.body;
            const room = new Room({
                roomNumber,
                roomType,
                status,
            });

            await room.save();
            res.redirect('/admin/dashboard');
        } catch (err) {
            console.error('Lỗi khi tạo phòng:', err);
            res.status(500).json({ message: 'Lỗi khi thêm phòng', error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const { roomNumber, roomType, status } = req.body;
            await Room.findByIdAndUpdate(
                req.params.id,
                { roomNumber, roomType, status },
                { new: true },
            );
            res.redirect('/admin/dashboard');
        } catch (err) {
            console.error('Lỗi khi cập nhật phòng:', err);
            res.status(500).json({ message: 'Lỗi khi cập nhật phòng', error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await Room.findByIdAndDelete(req.params.id);
            res.redirect('/admin/dashboard');
        } catch (err) {
            console.error('Lỗi khi xóa phòng:', err);
            res.status(500).json({ message: 'Lỗi khi xóa phòng', error: err.message });
        }
    },

    getAvailableRooms: async (req, res) => {
        try {
            const { roomTypeId, checkIn, checkOut } = req.query;

            if (!roomTypeId || !checkIn || !checkOut) {
                return res.status(400).json({ message: 'Thiếu thông tin yêu cầu.' });
            }

            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            // Kiểm tra nếu ngày không hợp lệ
            if (isNaN(checkInDate) || isNaN(checkOutDate)) {
                return res.status(400).json({ message: 'Ngày không hợp lệ.' });
            }

            const allRooms = await Room.find({ roomType: roomTypeId });

            if (!allRooms || allRooms.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy phòng nào.' });
            }

            const allRoomIds = allRooms.map(room => room._id);

            // Tìm các phòng đã được đặt trong khoảng thời gian này
            const bookedRooms = await Booking.find({
                room: { $in: allRoomIds },
                $or: [
                    {
                        checkIn: { $lt: checkOutDate },
                        checkOut: { $gt: checkInDate },
                    }
                ]
            }).select('room');

            const bookedRoomIds = bookedRooms.map(b => b.room.toString());

            // Lọc phòng trống
            const availableRooms = allRooms.filter(room => !bookedRoomIds.includes(room._id.toString()));

            if (availableRooms.length === 0) {
                return res.status(404).json({ message: 'Không còn phòng trống trong khoảng thời gian này.' });
            }

            res.json(availableRooms);
        } catch (error) {
            console.error('Lỗi tìm phòng trống:', error);
            res.status(500).json({ message: 'Lỗi server.' });
        }
    },
};
