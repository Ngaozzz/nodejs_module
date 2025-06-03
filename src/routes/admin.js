// File: src/routes/admin.js
const express = require('express');
const router = express.Router();
const AdminController = require('../app/controllers/adminController');
const { requireAuth, requireAdmin } = require('../middlewares/auth');
const roomTypeController = require('../app/controllers/roomTypeController');
const RoomController = require('../app/controllers/roomcontroller');
const userController = require('../app/controllers/usercontroller');


router.get('/dashboard', requireAuth, requireAdmin, AdminController.dashboard);
router.get('/users', requireAuth, requireAdmin, AdminController.manageUsers);
router.get(
    '/bookings',
    requireAuth,
    requireAdmin,
    AdminController.manageBookings,
);
router.get('/admin/feedbacks', requireAuth, requireAdmin, AdminController.manageFeedbacks);
router.get('/rooms', requireAuth, requireAdmin, AdminController.manageRooms);
router.get(
    '/room-types',
    requireAuth,
    requireAdmin,
    AdminController.manageRoomTypes,
);

router.post('/room-type', requireAuth, requireAdmin, roomTypeController.create);
router.post('/room', requireAuth, requireAdmin, RoomController.create);
router.post(
    '/dashboard/:id/edit1',
    requireAuth,
    requireAdmin,
    userController.updateUser,
);
router.post(
    '/dashboard/:id/delete1',
    requireAuth,
    requireAdmin,
    userController.deleteUser,
);
router.post(
    '/dashboard/:id/edit',
    requireAuth,
    requireAdmin,
    roomTypeController.update,
);
router.post(
    '/dashboard/:id/delete',
    requireAuth,
    requireAdmin,
    roomTypeController.delete,
);
router.post(
    '/dashboard/:id/edit2',
    requireAuth,
    requireAdmin,
    RoomController.update,
);
router.post(
    '/dashboard/:id/delete2',
    requireAuth,
    requireAdmin,
    RoomController.delete,
);
module.exports = router;
