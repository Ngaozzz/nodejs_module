// controllers/BookingController.js
const express = require('express');
const router = express.Router();
const BookingController = require('../app/controllers/BookingController');
const { requireAuth, requireAdmin } = require('../middlewares/auth');

// Trang form chọn phòng (trả HTML)
router.get('/', requireAuth, BookingController.index);

// Người dùng gửi đặt phòng
router.post('/', requireAuth, BookingController.create);

// Quan trọng: Đặt trước :id
router.get('/my-bookings', requireAuth, BookingController.checkMyBookings);

// API: Admin lấy tất cả booking (JSON)
router.get('/all', requireAdmin, BookingController.getAllBookings);

// API: Lấy booking theo ID (này phải để sau cùng!)
router.get('/:id', requireAuth, BookingController.getById);

// Cập nhật + xóa booking (admin)
router.put('/:id', requireAdmin, BookingController.update);
router.delete('/:id', requireAdmin, BookingController.delete);

module.exports = router;
