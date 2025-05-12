const Feedback = require('../models/Feedback');

module.exports = {
    getAll: async (req, res) => {
        const list = await Feedback.find();
        res.json(list);
    },
    getById: async (req, res) => {
        const item = await Feedback.findById(req.params.id);
        res.json(item);
    },
    create: async (req, res) => {
        const item = new Feedback(req.body);
        await item.save();
        res.status(201).json(item);
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
