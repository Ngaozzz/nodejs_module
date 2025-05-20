const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');
const FeedbackController = require('../app/controllers/feedbackcontroller');

router.get('/', FeedbackController.getAll);
router.get('/:id', FeedbackController.getById);
router.post('/', requireAuth, FeedbackController.create);
router.put('/:id', requireAuth, FeedbackController.update);
router.delete('/:id', requireAuth, FeedbackController.delete);

module.exports = router;
