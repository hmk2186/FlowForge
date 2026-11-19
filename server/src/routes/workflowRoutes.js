const express = require('express');
const router = express.Router();
const {
  getWorkflows,
  createWorkflow,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
  duplicateWorkflow,
  updateWorkflowStatus,
  validateWorkflowEndpoint,
} = require('../controllers/workflowController');
const { executeWorkflowEndpoint } = require('../controllers/executionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All workflow routes require authentication

router.route('/')
  .get(getWorkflows)
  .post(createWorkflow);

router.route('/:id')
  .get(getWorkflowById)
  .put(updateWorkflow)
  .delete(deleteWorkflow);

router.post('/:id/duplicate', duplicateWorkflow);
router.patch('/:id/status', updateWorkflowStatus);
router.post('/:id/validate', validateWorkflowEndpoint);
router.post('/:id/execute', executeWorkflowEndpoint);

module.exports = router;
