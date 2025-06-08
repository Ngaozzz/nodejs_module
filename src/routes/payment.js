const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');
const PaymentController = require('../app/controllers/paymentcontroller');

router.get('/', PaymentController.getAll);
router.get('/:id', PaymentController.getById);
router.post('/', requireAuth, PaymentController.create);
router.put('/:id', PaymentController.update);
router.delete('/:id', PaymentController.delete);

module.exports = router;
