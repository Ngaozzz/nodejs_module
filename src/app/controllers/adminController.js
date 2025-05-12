const User = require('../models/User');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const moment = require('moment');
require('moment/locale/vi');

module.exports = {
    dashboard: async (req, res) => {
        const tab = req.query.tab || 'overview';
        const monthQuery = req.query.month || moment().format('YYYY-MM');
        const selectedMonth = moment(monthQuery, 'YYYY-MM');
        const selectedDate = req.query.date ? moment(req.query.date, 'YYYY-MM-DD') : moment();
        const filter = req.query.filter; // NEW: lấy filter từ URL

        const users = await User.find();
        const rooms = await Room.find().populate('roomType');
        const roomTypes = await RoomType.find();

        // Lọc bookings theo tháng được chọn
        const bookingsInMonth = await Booking.find({
            checkIn: {
                $gte: selectedMonth.startOf('month').toDate(),
                $lte: selectedMonth.endOf('month').toDate(),
            },
        });

        const totalRevenue = bookingsInMonth.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        // Tính doanh thu hôm nay
        const today = moment();
        const bookingsToday = await Booking.find({
            checkIn: {
                $gte: today.startOf('day').toDate(),
                $lte: today.endOf('day').toDate(),
            },
        });
        const todayRevenue = bookingsToday.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        // Biểu đồ doanh thu 12 tháng gần nhất
        const monthlyRevenueData = [];
        for (let i = 11; i >= 0; i--) {
            const m = moment().subtract(i, 'months');
            const monthlyBookings = await Booking.find({
                checkIn: {
                    $gte: m.startOf('month').toDate(),
                    $lte: m.endOf('month').toDate(),
                },
            });

            const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

            monthlyRevenueData.push({
                month: m.format('MM/YYYY'),
                revenue: monthlyRevenue,
            });
        }

        // Nếu có ngày được chọn, lọc booking theo ngày đó
        let bookingQuery = {};
        if (selectedDate) {
            bookingQuery = {
                checkIn: {
                    $lte: selectedDate.endOf('day').toDate(),
                },
                checkOut: {
                    $gte: selectedDate.startOf('day').toDate(),
                },
            };
        }

        const bookings = await Booking.find(bookingQuery).populate('user').populate({
            path: 'room',
            select: 'roomNumber roomType',
            populate: { path: 'roomType' },
        });

        // Thống kê phòng đã đặt / còn trống theo ngày
        let bookedRoomIds = [];
        if (selectedDate) {
            const bookingsInDay = await Booking.find({
                checkIn: { $lte: selectedDate.endOf('day').toDate() },
                checkOut: { $gte: selectedDate.startOf('day').toDate() },
            }).populate('room');

            bookedRoomIds = bookingsInDay.map(b => b.room._id.toString());
        }

        const availableRooms = rooms.filter(r => !bookedRoomIds.includes(r._id.toString()));

        let bookedRoomsDetails = [];

            if (selectedDate) {
                const bookingsInDay = await Booking.find({
                    checkIn: { $lte: selectedDate.endOf('day').toDate() },
                    checkOut: { $gte: selectedDate.startOf('day').toDate() },
                }).populate('user').populate({
                    path: 'room',
                    populate: { path: 'roomType' }
                });

                bookedRoomIds = bookingsInDay.map(b => b.room._id.toString());

                // Lấy thông tin chi tiết phòng đã đặt
                bookedRoomsDetails = bookingsInDay.map(b => ({
                    userName: b.user.name,
                    userEmail: b.user.email,
                    roomNumber: b.room.roomNumber,
                    roomType: b.room.roomType.name,
                    userPhone: b.user.phone,
                    checkIn: moment(b.checkIn).format('DD/MM/YYYY'),
                    checkOut: moment(b.checkOut).format('DD/MM/YYYY'),
                    totalPrice: b.totalPrice
                }));
            }


        // NEW: Lọc danh sách phòng tương ứng theo filter
        let filteredRooms = [];
        if (filter === 'booked') {
            filteredRooms = rooms.filter(r => bookedRoomIds.includes(r._id.toString()));
        } else if (filter === 'available') {
            filteredRooms = availableRooms;
        }

        // Render dashboard
        res.render('admin/dashboard', {
            users: users.map(u => u.toObject()),
            rooms: rooms.map(r => r.toObject()),
            roomTypes: roomTypes.map(rt => rt.toObject()),
            bookings: bookings.map(b => ({
                ...b.toObject(),
                checkInFormatted: moment(b.checkIn).locale('vi').format('dddd, DD/MM/YYYY'),
                checkOutFormatted: moment(b.checkOut).locale('vi').format('dddd, DD/MM/YYYY'),
            })),
            totalRevenue,
            todayRevenue,
            selectedMonth: selectedMonth.format('YYYY-MM'),
            selectedDate: selectedDate ? selectedDate.format('YYYY-MM-DD') : '',
            selectedTab: tab,
            monthlyRevenueString: JSON.stringify(monthlyRevenueData),
            bookedCount: bookedRoomIds.length,
            availableCount: availableRooms.length,
            filteredRooms: filteredRooms.map(r => r.toObject()), // NEW
            selectedFilter: filter || '', 
            bookedRoomsDetails,
        });
    },

    manageUsers: async (req, res) => {
        const users = await User.find();
        res.render('admin/dashboard', {
            users: users.map((u) => u.toObject()),
        });
    },

    manageBookings: async (req, res) => {
        const bookings = await Booking.find().populate('user room');
        res.redirect('/admin/dashboard?tab=bookings', {
            bookings: bookings.map((b) => b.toObject()),
        });
    },

    manageRooms: async (req, res) => {
        const rooms = await Room.find().populate('roomType');
        res.render('admin/dashboard', {
            rooms: rooms.map((r) => r.toObject()),
        });
    },

    manageRoomTypes: async (req, res) => {
        const types = await RoomType.find();
        res.render('admin/dashboard', {
            types: types.map((t) => t.toObject()),
        });
    },
};
