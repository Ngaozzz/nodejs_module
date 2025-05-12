const RoomType = require('../models/RoomType');

module.exports = {
    getAll: async (req, res) => {
        const types = await RoomType.find();
        res.json(types);
    },

    renderView: async (req, res) => {
        const roomTypes = await RoomType.find();
        res.render('admin/dashboard', {
            roomTypes: roomTypes.map((rt) => rt.toObject()),
        });
    },

    create: async (req, res) => {
        try {
            const { name, price, description, image, amenities } = req.body;
            const roomType = new RoomType({
                name,
                price,
                description,
                image,
                amenities: amenities
                    ? amenities.split(',').map((a) => a.trim())
                    : [],
            });

            await roomType.save();
            res.redirect('/admin/dashboard');
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi khi thêm loại phòng', error: error.message });
        }
    },

    update: async (req, res) => {
        const { name, price, description, image, amenities } = req.body;
        try {
            const roomType = await RoomType.findById(req.params.id);

            roomType.name = name;
            roomType.price = price;
            roomType.description = description;
            roomType.image = image;
            roomType.amenities = amenities
                ? amenities.split(',').map((a) => a.trim())
                : [];

            await roomType.save();
            res.redirect('/admin/dashboard');
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi khi cập nhật loại phòng', error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await RoomType.findByIdAndDelete(req.params.id);
            res.redirect('/admin/dashboard');
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi khi xóa loại phòng', error: error.message });
        }
    },
};
