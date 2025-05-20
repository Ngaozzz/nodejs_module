const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

module.exports = {
  getAll: async (req, res) => {
    const payments = await Payment.find();
    res.json(payments);
  },

  getById: async (req, res) => {
    const payment = await Payment.findById(req.params.id);
    res.json(payment);
  },

  create: async (req, res) => {
     try {
    const payment = new Payment({
      booking: req.body.bookingId,
      user: req.user.id,
      amount: req.body.amount,
      paymentMethod: req.body.paymentMethod,
      transactionId: req.body.transactionId,
      paymentStatus: 'completed',
    });

    await payment.save();

    //  Cập nhật trạng thái đã cọc
    await Booking.findByIdAndUpdate(req.body.bookingId, { isDepositPaid: true });

    res.redirect('/bookings/my_bookings');

  } catch (error) {
    console.error('Lỗi khi xử lý POST /payments:', error);
    res.status(500).send('Lỗi khi xử lý thanh toán.');
  }
  },

  update: async (req, res) => {
    const updated = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(updated);
  },

  delete: async (req, res) => {
    await Payment.findByIdAndDelete(req.params.id);
    res.status(204).send();
  },
};
