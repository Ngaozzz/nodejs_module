// FeedbackController.js
const Feedback = require('../models/Feedback');

module.exports = {
    getAll: async (req, res) => {
          const list = await Feedback.find().populate('user', 'name');
  res.json(list);
    },
    getById: async (req, res) => {
        const item = await Feedback.findById(req.params.id);
        res.json(item);
    },
    create: async (req, res) => {
      try {
    if (!req.user) return res.status(401).json({ message: "Bạn cần đăng nhập để gửi đánh giá." });

    const item = new Feedback({
      user: req.user.id, //  gắn đúng người dùng
      rating: req.body.rating,
      comment: req.body.comment,
    });

    await item.save();
    res.status(201).json({ message: "Đánh giá đã được lưu." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
    },
    update: async (req, res) => {
        const updated = await Feedback.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true },
        );
        res.json(updated);
    },
    delete: async (req, res) => {
        await Feedback.findByIdAndDelete(req.params.id);
        res.status(204).send();
    },
};
