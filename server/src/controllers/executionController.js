const Execution = require('../models/Execution');
const Workflow = require('../models/Workflow');
const { executeWorkflow } = require('../engine/executor/workflowExecutor');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Execute a workflow
 * @route   POST /api/workflows/:id/execute
 * @access  Private
 */
const executeWorkflowEndpoint = async (req, res) => {
  try {
    const workflowId = req.params.id;
    const userId = req.user._id;
    const { initialPayload = {} } = req.body;

    const workflow = await Workflow.findOne({ _id: workflowId, userId });
    if (!workflow) {
      return errorResponse(res, 'Workflow not found or unauthorized', 404);
    }

    // Create initial Execution record in database immediately
    const execution = await Execution.create({
      userId,
      workflowId: workflow._id,
      workflowName: workflow.name,
      status: 'pending',
      startedAt: new Date(),
      initialPayload,
      nodeExecutionResults: [],
      logs: [{
        timestamp: new Date(),
        level: 'info',
        message: `Execution queued for workflow "${workflow.name}".`,
      }],
    });

    // Run execution asynchronously so client receives executionId for polling immediately
    // If execution completes very fast, it updates the record automatically
    executeWorkflow(workflowId, userId, initialPayload, execution._id).catch((err) => {
      console.error(`[Background Execution Error] Workflow ${workflowId}:`, err.message);
    });

    return successResponse(
      res,
      {
        executionId: execution._id,
        status: execution.status,
        workflowId: workflow._id,
        startedAt: execution.startedAt,
      },
      'Workflow execution initiated',
      202
    );
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to start execution', 500);
  }
};

/**
 * @desc    Get execution history listing with search and filters
 * @route   GET /api/executions
 * @access  Private
 */
const getExecutions = async (req, res) => {
  try {
    const { workflowId, status, page = 1, limit = 20, search } = req.query;

    const query = { userId: req.user._id };

    if (workflowId) {
      query.workflowId = workflowId;
    }

    if (status && ['pending', 'running', 'success', 'failed', 'cancelled'].includes(status.toLowerCase())) {
      query.status = status.toLowerCase();
    }

    if (search && search.trim()) {
      query.workflowName = { $regex: search.trim(), $options: 'i' };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [executions, total] = await Promise.all([
      Execution.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-nodeExecutionResults.input -nodeExecutionResults.output'), // Omit heavy blobs in listing for speed
      Execution.countDocuments(query),
    ]);

    return successResponse(
      res,
      {
        executions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
      'Executions retrieved'
    );
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch executions', 500);
  }
};

/**
 * @desc    Get detailed execution record with node results & logs
 * @route   GET /api/executions/:id
 * @access  Private
 */
const getExecutionById = async (req, res) => {
  try {
    const execution = await Execution.findOne({ _id: req.params.id, userId: req.user._id });
    if (!execution) {
      return errorResponse(res, 'Execution record not found or unauthorized', 404);
    }

    return successResponse(res, { execution }, 'Execution details retrieved');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch execution details', 500);
  }
};

/**
 * @desc    Cancel an active workflow execution
 * @route   POST /api/executions/:id/cancel
 * @access  Private
 */
const cancelExecution = async (req, res) => {
  try {
    const execution = await Execution.findOne({ _id: req.params.id, userId: req.user._id });
    if (!execution) {
      return errorResponse(res, 'Execution record not found or unauthorized', 404);
    }

    if (['success', 'failed', 'cancelled'].includes(execution.status)) {
      return errorResponse(res, `Cannot cancel execution with final status "${execution.status}"`, 400);
    }

    execution.status = 'cancelled';
    execution.completedAt = new Date();
    execution.logs.push({
      timestamp: new Date(),
      level: 'warn',
      message: 'Cancellation requested by user.',
    });

    await execution.save();

    return successResponse(res, { execution }, 'Execution cancelled successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to cancel execution', 500);
  }
};

module.exports = {
  executeWorkflowEndpoint,
  getExecutions,
  getExecutionById,
  cancelExecution,
};
