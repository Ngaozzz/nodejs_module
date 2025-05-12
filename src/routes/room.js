const express = require('express');
const router = express.Router();
const controller = require('../app/controllers/roomcontroller');


router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

router.get('/available', controller.getAvailableRooms);

module.exports = router;
