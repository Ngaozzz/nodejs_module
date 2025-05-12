const express = require('express');
const router = express.Router();
const FeedbackController = require('../app/controllers/feedbackcontroller');

router.get('/', FeedbackController.getAll);
router.get('/:id', FeedbackController.getById);
router.post('/', FeedbackController.create);
router.put('/:id', FeedbackController.update);
router.delete('/:id', FeedbackController.delete);

module.exports = router;
