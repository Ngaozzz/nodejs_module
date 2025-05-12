// File: src/routes/user.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const UserController = require('../app/controllers/usercontroller');
const { requireAuth } = require('../middlewares/auth');


router.get('/profile',upload.single('avatar'), UserController.renderUserProfile);
router.post('/update-profile',upload.single('avatar'),requireAuth, UserController.updateUserProfile);
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/register',upload.single('avatar'), UserController.register);
router.post('/login', UserController.login);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);


module.exports = router;
