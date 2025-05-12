const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // hoặc chỉnh lại tùy theo schema của bạn

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(400).send('Email không tồn tại');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Mật khẩu sai');

        const token = jwt.sign(
            { id: user._id, name: user.name, role: user.role },
            'secret', // dùng process.env.JWT_SECRET nếu có
            { expiresIn: '1d' },
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'lax', // nếu dùng HTTPS thì dùng 'none'
            secure: false, // true nếu chạy HTTPS
        });

        res.status(200).json({
            message: 'Login thành công',
            user: {
                name: user.name,
                role: user.role,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi server');
    }
};
