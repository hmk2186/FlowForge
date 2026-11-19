const express = require('express');
const router = express.Router();
const {
  getExecutions,
  getExecutionById,
  cancelExecution,
} = require('../controllers/executionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All execution routes require authentication

router.get('/', getExecutions);
router.get('/:id', getExecutionById);
router.post('/:id/cancel', cancelExecution);

module.exports = router;
