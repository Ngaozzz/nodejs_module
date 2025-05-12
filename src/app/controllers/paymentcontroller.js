const Payment = require('../models/Payment');

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
        const payment = new Payment(req.body);
        await payment.save();
        res.status(201).json(payment);
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
