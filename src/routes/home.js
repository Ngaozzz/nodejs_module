const express = require('express');
const router = express.Router();

const HomeController = require('../app/controllers/HomeController');

// URL: /Home
router.get('/', HomeController.index);

module.exports = router;
