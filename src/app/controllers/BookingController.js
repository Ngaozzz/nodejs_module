// controllers/BookingController.js
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const User = require('../models/User'); // Thêm dòng này để lấy thông tin user

module.exports = {
  /**
   * API: Lấy danh sách booking (trả JSON)
   */
  getAllBookings: async (req, res) => {
    try {
      const bookings = await Booking.find()
        .populate('room')
        .populate('user');
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách đặt phòng', error: err.message });
    }
  },

  /**
   * Hiển thị trang chọn loại phòng để đặt (GET /bookings)
   */
  index: async (req, res) => {
    try {
      const roomTypes = await RoomType.find();
      res.render('bookings', {
        roomTypes: roomTypes.map(rt => rt.toObject()),
        currentUser: req.user || null,
        errorMessage: null
      });
    } catch (err) {
      console.error('Lỗi index booking:', err);
      res.status(500).send('Lỗi khi tải danh sách loại phòng');
    }
  },

  /**
 * Tạo một booking mới từ form (POST /bookings)
 */
create: async (req, res) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  try {
    const { roomTypeId, checkIn, checkOut, paymentMethod, paymentNote } = req.body;
    const userId = req.user._id || req.user.id;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (isNaN(checkInDate) || isNaN(checkOutDate)) {
      throw new Error('Ngày không hợp lệ.');
    }

    // Tìm danh sách các phòng đã được đặt trong khoảng thời gian này
    const bookedRooms = await Booking.find({
      roomType: roomTypeId,
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
      ]
    }).distinct('room');

    // Tìm một phòng trống
    const availableRoom = await Room.findOne({
      roomType: roomTypeId,
      _id: { $nin: bookedRooms }
    });

    if (!availableRoom) {
      throw new Error('Không còn phòng trống trong khoảng thời gian này.');
    }

    // Tính số đêm và giá
    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType) {
      throw new Error('Không tìm thấy loại phòng.');
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.round((checkOutDate - checkInDate) / msPerDay);
    if (nights <= 0) {
      throw new Error('Ngày nhận và trả phòng không hợp lệ.');
    }

    const totalPrice = nights * roomType.price;

    const booking = new Booking({
      user: userId,
      room: availableRoom._id,
      roomType: roomTypeId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      deposit,  // Lưu số tiền cọc
      paymentMethod,
      paymentNote,
      isPaid: paymentMethod !== 'cash',
      isDepositPaid: false  // Cọc chưa được thanh toán
    });

    await booking.save();
    return res.redirect('/bookings');
  } catch (err) {
    console.error('Lỗi khi tạo booking:', err);
    try {
      const roomTypes = await RoomType.find();
      return res.render('bookings', {
        roomTypes: roomTypes.map(rt => rt.toObject()),
        currentUser: req.user,
        errorMessage: err.message
      });
    } catch (e2) {
      console.error('Lỗi khi reload trang booking:', e2);
      return res.status(500).send('Lỗi nghiêm trọng');
    }
  }
},


  /**
   * API: Lấy booking theo ID (GET /bookings/:id)
   */
  getById: async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate('room')
        .populate('user');
      if (!booking) return res.status(404).json({ message: 'Không tìm thấy booking' });
      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  /**
   * Cập nhật booking (PUT /bookings/:id)
   */
  update: async (req, res) => {
    try {
      const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate('room')
        .populate('user');
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi khi cập nhật booking', error: err.message });
    }
  },

  /**
   * Xóa booking (DELETE /bookings/:id)
   */
  delete: async (req, res) => {
    try {
      await Booking.findByIdAndDelete(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: 'Lỗi khi xóa booking', error: err.message });
    }
  },

  /**
   * API: Người dùng kiểm tra các phòng họ đã đặt
   * GET /check_room
   */
  checkMyBookings: async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để xem đặt phòng.' });
    }

    try {
      const userId = req.user._id || req.user.id;

      // ✅ Lấy lại thông tin đầy đủ từ database
      const user = await User.findById(userId);

      const bookings = await Booking.find({ user: userId })
        .populate({
          path: 'room',
          populate: { path: 'roomType' }
        })
        .sort({ checkIn: 1 });

      res.render('my_bookings', {
        bookings: bookings.map(b => b.toObject()),
        User: user.toObject(), // Truyền dữ liệu người dùng đầy đủ vào view
        currentUser: req.user
      });
    } catch (err) {
      console.error('Lỗi lấy booking cá nhân:', err);
      res.status(500).send('Lỗi server');
    }
  },
  /**
    * API: Thanh toán cọc (POST /bookings/:id/deposit)
   */
  payDeposit: async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: 'Không tìm thấy booking' });
      }

      // Kiểm tra nếu booking chưa thanh toán cọc
      if (booking.isDepositPaid) {
        return res.status(400).json({ message: 'Cọc đã được thanh toán trước đó' });
      }

      // Cập nhật trạng thái thanh toán cọc
      booking.isDepositPaid = true;
      await booking.save();

      res.json({ message: 'Thanh toán cọc thành công', booking });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi khi thanh toán cọc', error: err.message });
    }
  },
};
