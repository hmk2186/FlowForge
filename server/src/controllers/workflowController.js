const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const TaskRecord = require('../models/TaskRecord');
const { validateWorkflow } = require('../engine/validators/workflowValidator');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get all workflows for authenticated user
 * @route   GET /api/workflows
 * @access  Private
 */
const getWorkflows = async (req, res) => {
  try {
    const { search, status, sort = 'newest' } = req.query;

    const query = { userId: req.user._id };

    // Search by workflow name or description
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Filter by status
    if (status && ['draft', 'active', 'inactive'].includes(status.toLowerCase())) {
      query.status = status.toLowerCase();
    }

    // Sort order
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'name_asc') sortOption = { name: 1 };
    if (sort === 'name_desc') sortOption = { name: -1 };
    if (sort === 'updated') sortOption = { updatedAt: -1 };

    const workflows = await Workflow.find(query).sort(sortOption);

    return successResponse(res, { workflows, total: workflows.length }, 'Workflows retrieved');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to retrieve workflows', 500);
  }
};

/**
 * @desc    Create a new workflow
 * @route   POST /api/workflows
 * @access  Private
 */
const createWorkflow = async (req, res) => {
  try {
    const { name, description, nodes, edges, status } = req.body;

    if (!name || !name.trim()) {
      return errorResponse(res, 'Workflow name is required', 400);
    }

    // Default starter canvas with 1 trigger node if none provided
    const defaultNodes = nodes && nodes.length > 0 ? nodes : [
      {
        id: 'node_trigger_1',
        type: 'trigger',
        position: { x: 250, y: 100 },
        data: {
          label: 'Manual Trigger',
          triggerType: 'manual',
          payload: JSON.stringify({ event: 'manual_start', sampleData: 'Hello FlowForge' }, null, 2),
        },
      },
    ];

    const workflow = await Workflow.create({
      userId: req.user._id,
      name: name.trim(),
      description: description ? description.trim() : '',
      status: status || 'draft',
      nodes: defaultNodes,
      edges: edges || [],
    });

    return successResponse(res, { workflow }, 'Workflow created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to create workflow', 500);
  }
};

/**
 * @desc    Get a single workflow by ID
 * @route   GET /api/workflows/:id
 * @access  Private
 */
const getWorkflowById = async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ _id: req.params.id, userId: req.user._id });
    if (!workflow) {
      return errorResponse(res, 'Workflow not found or unauthorized', 404);
    }

    return successResponse(res, { workflow }, 'Workflow details retrieved');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch workflow', 500);
  }
};

/**
 * @desc    Update a workflow (canvas nodes, edges, metadata)
 * @route   PUT /api/workflows/:id
 * @access  Private
 */
const updateWorkflow = async (req, res) => {
  try {
    const { name, description, status, nodes, edges } = req.body;

    const workflow = await Workflow.findOne({ _id: req.params.id, userId: req.user._id });
    if (!workflow) {
      return errorResponse(res, 'Workflow not found or unauthorized', 404);
    }

    if (name) workflow.name = name.trim();
    if (description !== undefined) workflow.description = description.trim();
    if (status && ['draft', 'active', 'inactive'].includes(status)) workflow.status = status;
    if (nodes !== undefined) workflow.nodes = nodes;
    if (edges !== undefined) workflow.edges = edges;

    await workflow.save();

    return successResponse(res, { workflow }, 'Workflow saved successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to update workflow', 500);
  }
};

/**
 * @desc    Delete a workflow and its associated executions
 * @route   DELETE /api/workflows/:id
 * @access  Private
 */
const deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!workflow) {
      return errorResponse(res, 'Workflow not found or unauthorized', 404);
    }

    // Clean up associated executions and task records
    await Execution.deleteMany({ workflowId: req.params.id });
    await TaskRecord.deleteMany({ workflowId: req.params.id });

    return successResponse(res, null, 'Workflow and associated execution logs deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to delete workflow', 500);
  }
};

/**
 * @desc    Duplicate an existing workflow
 * @route   POST /api/workflows/:id/duplicate
 * @access  Private
 */
const duplicateWorkflow = async (req, res) => {
  try {
    const original = await Workflow.findOne({ _id: req.params.id, userId: req.user._id });
    if (!original) {
      return errorResponse(res, 'Original workflow not found or unauthorized', 404);
    }

    const duplicated = await Workflow.create({
      userId: req.user._id,
      name: `${original.name} (Copy)`,
      description: original.description,
      status: 'draft', // Clones reset to draft
      nodes: original.nodes,
      edges: original.edges,
    });

    return successResponse(res, { workflow: duplicated }, 'Workflow duplicated successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to duplicate workflow', 500);
  }
};

/**
 * @desc    Toggle or update workflow status
 * @route   PATCH /api/workflows/:id/status
 * @access  Private
 */
const updateWorkflowStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['draft', 'active', 'inactive'].includes(status)) {
      return errorResponse(res, 'Valid status is required (draft, active, inactive)', 400);
    }

    const workflow = await Workflow.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    );

    if (!workflow) {
      return errorResponse(res, 'Workflow not found or unauthorized', 404);
    }

    return successResponse(res, { workflow }, `Workflow status changed to ${status}`);
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to update workflow status', 500);
  }
};

/**
 * @desc    Validate a workflow graph
 * @route   POST /api/workflows/:id/validate
 * @access  Private
 */
const validateWorkflowEndpoint = async (req, res) => {
  try {
    // Can validate either payload from request body or saved workflow
    let { nodes, edges } = req.body;

    if (!nodes) {
      const workflow = await Workflow.findOne({ _id: req.params.id, userId: req.user._id });
      if (!workflow) {
        return errorResponse(res, 'Workflow not found', 404);
      }
      nodes = workflow.nodes;
      edges = workflow.edges;
    }

    const validationResult = validateWorkflow(nodes, edges);
    return successResponse(res, validationResult, 'Validation completed');
  } catch (error) {
    return errorResponse(res, error.message || 'Validation failed', 500);
  }
};

module.exports = {
  getWorkflows,
  createWorkflow,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
  duplicateWorkflow,
  updateWorkflowStatus,
  validateWorkflowEndpoint,
};
