const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const moment = require('moment');
require('moment/locale/vi');
const secretKey = process.env.JWT_SECRET || 'secret';

// Lấy tất cả người dùng
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Lấy người dùng theo ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user)
            return res
                .status(404)
                .json({ message: 'Không tìm thấy người dùng' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Đăng ký tài khoản
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword, gender, dob } =
            req.body;
        if (password !== confirmPassword)
            return res.status(400).send('Mật khẩu không khớp');
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: 'Email đã được đăng ký' });

        const hashedPassword = await bcrypt.hash(password, 10);

        let avatarPath = '/uploads/avatars/default.png';
        if (req.file) {
            avatarPath = `/uploads/avatars/${req.file.filename}`;
        }

        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            dob,
            gender,
            avatar: avatarPath,
        });

        await newUser.save();
        return res.redirect('/');
    } catch (err) {
        console.error(err);
        return res.redirect('/register?error=Lỗi%20khi%20đăng%20ký');
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('Email không tồn tại');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Mật khẩu sai');

        const token = jwt.sign(
            { id: user._id, name: user.name, role: user.role },
            secretKey,
            { expiresIn: '1d' },
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            secure: false,
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

// Cập nhật người dùng (admin)
exports.updateUser = async (req, res) => {
    try {
        const { password, ...otherFields } = req.body;
        let updateData = { ...otherFields };

        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            updateData.password = hashed;
        }

        if (req.file) {
            updateData.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        const updated = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true },
        ).select('-password');

        res.redirect('/admin/dashboard');
    } catch (err) {
        res.status(500).json({
            message: 'Lỗi khi cập nhật',
            error: err.message,
        });
    }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi xóa', error: err.message });
    }
};

// ✅ Lưu avatar URL vào session (dùng form nhập URL)
exports.saveAvatarUrlToSession = (req, res) => {
    const { avatarUrl } = req.body;
    if (!avatarUrl || !avatarUrl.startsWith('http')) {
        return res.status(400).send('URL không hợp lệ');
    }
    req.session.avatarUrl = avatarUrl;
    res.redirect('/users/profile');
};

// ✅ Trang cập nhật thông tin người dùng (hiển thị thông tin cá nhân)
exports.renderUserProfile = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.redirect('/login');

        const decoded = jwt.verify(token, secretKey);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(404).send('Không tìm thấy người dùng');

        const avatarUrl = req.session.avatarUrl ?? user.avatar;

        // Format ngày sinh bằng moment (định dạng cho giao diện tiếng Việt)
        const dobFormattedVi = user.dob
            ? moment(user.dob).locale('vi').format('dddd, DD/MM/YYYY')
            : '';

        // Format ngày sinh cho input type="date" (chuẩn ISO)
        const dobFormattedInput = user.dob
            ? moment(user.dob).format('YYYY-MM-DD')
            : '';

        res.render('update_users', {
            User: {
                ...user.toObject(),
                dobFormatted: dobFormattedInput,
            },
            avatarUrl,
            dobFormattedVi,
        });
    } catch (err) {
        console.error('Lỗi khi hiển thị trang cá nhân:', err.message);
        res.status(500).send('Lỗi server');
    }
};

// Hiển thị form cập nhật thông tin cá nhân
exports.renderUpdateForm = async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.redirect('/login');

        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).send('Không tìm thấy người dùng');

        const dobFormatted = user.dob?.toISOString().split('T')[0];
        const dobFormattedVi = user.dob
            ? moment(user.dob).locale('vi').format('dddd, DD/MM/YYYY')
            : '';

        res.render('update_users', {
            User: {
                ...user.toObject(),
                dobFormatted,
            },
            dobFormattedVi, // ✅ THÊM DÒNG NÀY
        });
    } catch (err) {
        console.error('Lỗi renderUpdateForm:', err.message);
        res.status(500).send('Lỗi server khi hiển thị form cập nhật');
    }
};

// Đăng xuất người dùng
exports.logout = (req, res) => {
    res.clearCookie('token'); // Xóa cookie chứa JWT

    // Nếu có sử dụng session
    if (req.session) {
        req.session.destroy(() => {
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
};

// ✅ Cập nhật thông tin người dùng (từ trang của tôi)
exports.updateUserProfile = async (req, res) => {
    try {
        const { name, phone, dob, gender } = req.body;
        const updateFields = {};
        if (name) updateFields.name = name;
        if (phone) updateFields.phone = phone;
        if (dob) updateFields.dob = dob;
        if (gender) updateFields.gender = gender;

        if (req.file) {
            updateFields.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        // Nếu có avatar từ session
        if (req.session.avatarUrl) {
            updateFields.avatar = req.session.avatarUrl;
            delete req.session.avatarUrl;
        }

        await User.findByIdAndUpdate(req.user.id, { $set: updateFields });
        res.redirect('/users/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi cập nhật thông tin người dùng');
    }
};
