   // src/middlewares/auth.js
   const jwt = require('jsonwebtoken');

    exports.requireAuth = (req, res, next) => {
        const token = req.cookies.token;
        if (!token) {
            console.log('Không có token trong cookie');
            return res.status(401).send('Bạn chưa đăng nhập');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret'); // dùng process.env.JWT_SECRET nếu có
            console.log('Token hợp lệ:', decoded); // ✅ Kiểm tra xem có role không
            req.user = decoded;
            next();
        } catch (err) {
            console.error('Lỗi verify token:', err.message);
            res.status(403).send('Token không hợp lệ');
        }
    };

    exports.requireAdmin = (req, res, next) => {
        if (req.user?.role !== 'admin')
            return res.status(403).send('Không đủ quyền');
        next();
    };
