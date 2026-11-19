const Execution = require('../../models/Execution');
const Workflow = require('../../models/Workflow');
const { validateWorkflow } = require('../validators/workflowValidator');
const { executeTriggerNode } = require('../nodes/triggerHandler');
const { executeActionNode } = require('../nodes/actionHandler');
const { executeConditionNode } = require('../nodes/conditionHandler');
const { executeDelayNode } = require('../nodes/delayHandler');
const { executeWebhookNode } = require('../nodes/webhookHandler');

/**
 * Main Workflow Execution Engine
 *
 * Executes a workflow graph step-by-step using straightforward asynchronous JavaScript:
 * 1. Prepares graph dictionaries (node map and edge adjacency list).
 * 2. Starts from the validated single Trigger node.
 * 3. Maintains an ExecutionContext holding variables, initial payload, and output from prior steps.
 * 4. Dispatches each node to its dedicated handler.
 * 5. Determines next node to visit:
 *    - For Condition nodes: takes the edge matching the condition's output branch ('true' or 'false').
 *    - For other nodes: takes outgoing edges.
 * 6. Records nodeExecutionResults and logs into the MongoDB Execution document in real time.
 * 7. Supports user cancellation and guards against infinite execution with step limits.
 *
 * @param {string} workflowId - MongoDB ID of the workflow
 * @param {string} userId - ID of authenticated user executing the workflow
 * @param {Object} [initialPayload={}] - Optional trigger data passed by user
 * @param {string} [existingExecutionId=null] - Pre-created execution record if created prior
 * @returns {Promise<Object>} Completed execution document
 */
const executeWorkflow = async (workflowId, userId, initialPayload = {}, existingExecutionId = null) => {
  // 1. Fetch workflow from database
  const workflow = await Workflow.findOne({ _id: workflowId, userId });
  if (!workflow) {
    throw new Error('Workflow not found or access denied');
  }

  const { nodes = [], edges = [] } = workflow;

  // 2. Validate workflow topology
  const validation = validateWorkflow(nodes, edges);
  if (!validation.isValid) {
    const errorDetails = validation.errors.map((e) => e.message).join(' | ');
    throw new Error(`Workflow validation failed: ${errorDetails}`);
  }

  // 3. Find starting trigger node
  const triggerNode = nodes.find((n) => n.type === 'trigger');
  if (!triggerNode) {
    throw new Error('No valid Trigger node found in this workflow');
  }

  // 4. Initialize or find Execution record in MongoDB
  let execution;
  if (existingExecutionId) {
    execution = await Execution.findById(existingExecutionId);
    if (!execution) {
      throw new Error(`Execution record ${existingExecutionId} not found`);
    }
    execution.status = 'running';
    execution.startedAt = new Date();
    await execution.save();
  } else {
    execution = await Execution.create({
      userId,
      workflowId: workflow._id,
      workflowName: workflow.name,
      status: 'running',
      startedAt: new Date(),
      initialPayload,
      nodeExecutionResults: [],
      logs: [],
    });
  }

  // 5. Build lookup maps for fast edge traversal
  const nodesMap = new Map();
  nodes.forEach((n) => nodesMap.set(n.id, n));

  // Adjacency map: sourceNodeId -> Array of outgoing edges
  const outgoingEdgesMap = new Map();
  nodes.forEach((n) => outgoingEdgesMap.set(n.id, []));
  edges.forEach((edge) => {
    if (outgoingEdgesMap.has(edge.source)) {
      outgoingEdgesMap.get(edge.source).push(edge);
    }
  });

  // 6. Set up runtime Execution Context
  const executionContext = {
    workflow: { id: workflow._id.toString(), name: workflow.name },
    initialPayload: initialPayload || {},
    nodes: {}, // Stores output of each executed node indexed by nodeId: { [nodeId]: output }
    data: { ...initialPayload }, // Flat context for easy template lookups
    latestOutput: null,
  };

  const startTime = Date.now();
  const logs = [];
  const nodeResults = [];
  let isCancelled = false;
  let finalStatus = 'success';
  let executionError = null;

  // Append log helper
  const addLog = (level, message, nodeId = null) => {
    logs.push({
      timestamp: new Date(),
      level,
      message,
      nodeId,
    });
  };

  addLog('info', `Workflow "${workflow.name}" execution started.`, triggerNode.id);

  // 7. Graph Traversal Loop
  let currentNodeId = triggerNode.id;
  const visitedNodeIds = new Set();
  const MAX_STEPS = 50; // Guard against infinite loop scenarios
  let stepCount = 0;

  try {
    while (currentNodeId && stepCount < MAX_STEPS) {
      stepCount++;

      // Check if user initiated a cancellation in MongoDB
      const freshExec = await Execution.findById(execution._id).select('status');
      if (freshExec && freshExec.status === 'cancelled') {
        isCancelled = true;
        addLog('warn', 'Execution was cancelled by the user.', currentNodeId);
        break;
      }

      const currentNode = nodesMap.get(currentNodeId);
      if (!currentNode) {
        addLog('error', `Node "${currentNodeId}" could not be found in workflow graph.`);
        break;
      }

      const nodeLabel = currentNode.data?.label || currentNode.id;
      const nodeStartTime = Date.now();
      visitedNodeIds.add(currentNode.id);

      // Snapshot input for this node
      const nodeInput = { ...executionContext.data };
      let nodeOutput = null;
      let nodeStatus = 'success';
      let nodeErrorMessage = null;
      let conditionBranchTaken = null;

      addLog('info', `Executing node "${nodeLabel}" (${currentNode.type})`, currentNode.id);

      try {
        const meta = {
          userId,
          workflowId: workflow._id,
          executionId: execution._id,
        };

        // Dispatch to appropriate node handler
        switch (currentNode.type) {
          case 'trigger': {
            const result = await executeTriggerNode(currentNode, executionContext);
            nodeOutput = result.output;
            addLog('info', result.log, currentNode.id);
            break;
          }

          case 'action': {
            const result = await executeActionNode(currentNode, executionContext, meta);
            nodeOutput = result.output;
            addLog('info', result.log, currentNode.id);
            break;
          }

          case 'condition': {
            const result = await executeConditionNode(currentNode, executionContext);
            nodeOutput = result.output;
            conditionBranchTaken = result.branch; // 'true' or 'false'
            addLog('info', result.log, currentNode.id);
            break;
          }

          case 'delay': {
            const result = await executeDelayNode(currentNode, executionContext, meta);
            nodeOutput = result.output;
            addLog('info', result.log, currentNode.id);
            break;
          }

          case 'webhook': {
            const result = await executeWebhookNode(currentNode, executionContext);
            nodeOutput = result.output;
            if (result.status === 'failed') {
              nodeStatus = 'failed';
              nodeErrorMessage = result.error || 'Webhook execution failed';
            }
            addLog(nodeStatus === 'failed' ? 'error' : 'info', result.log, currentNode.id);
            break;
          }

          default:
            throw new Error(`Unsupported node type: ${currentNode.type}`);
        }
      } catch (err) {
        nodeStatus = 'failed';
        nodeErrorMessage = err.message;
        addLog('error', `Node "${nodeLabel}" failed: ${err.message}`, currentNode.id);

        if (err.isCancelled) {
          isCancelled = true;
          break;
        }

        throw err;
      }

      const nodeDurationMs = Date.now() - nodeStartTime;

      // Record step result
      nodeResults.push({
        nodeId: currentNode.id,
        nodeType: currentNode.type,
        nodeName: nodeLabel,
        status: nodeStatus,
        startedAt: new Date(nodeStartTime),
        completedAt: new Date(),
        durationMs: nodeDurationMs,
        input: nodeInput,
        output: nodeOutput,
        error: nodeErrorMessage,
      });

      // Update runtime context
      executionContext.nodes[currentNode.id] = nodeOutput;
      executionContext.latestOutput = nodeOutput;
      if (nodeOutput && typeof nodeOutput === 'object') {
        Object.assign(executionContext.data, nodeOutput);
      }

      // If this node failed, stop downstream execution
      if (nodeStatus === 'failed') {
        finalStatus = 'failed';
        executionError = {
          message: nodeErrorMessage,
          nodeId: currentNode.id,
        };
        break;
      }

      // 8. Determine next node to traverse
      const outgoingEdges = outgoingEdgesMap.get(currentNode.id) || [];

      if (outgoingEdges.length === 0) {
        // Reached end of branch
        currentNodeId = null;
      } else if (currentNode.type === 'condition') {
        // For condition nodes: find the edge with sourceHandle matching the condition branch ('true' or 'false')
        const matchingEdge = outgoingEdges.find((e) => {
          const handle = (e.sourceHandle || '').toLowerCase();
          return handle === conditionBranchTaken || handle.includes(conditionBranchTaken);
        });

        if (matchingEdge) {
          addLog('info', `Following ${conditionBranchTaken.toUpperCase()} branch -> Next node: ${nodesMap.get(matchingEdge.target)?.data?.label || matchingEdge.target}`, currentNode.id);
          currentNodeId = matchingEdge.target;
        } else {
          addLog('info', `No edge connected to ${conditionBranchTaken.toUpperCase()} branch. Workflow branch completed.`, currentNode.id);
          currentNodeId = null;
        }
      } else {
        // Standard single branch progression
        currentNodeId = outgoingEdges[0].target;
      }
    }

    if (stepCount >= MAX_STEPS) {
      addLog('warn', `Workflow reached maximum allowed step limit (${MAX_STEPS}). Execution halted.`);
    }
  } catch (loopError) {
    finalStatus = 'failed';
    executionError = {
      message: loopError.message,
      nodeId: currentNodeId,
      stack: loopError.stack,
    };
    addLog('error', `Execution terminated with error: ${loopError.message}`);
  }

  // Determine final status
  if (isCancelled) {
    finalStatus = 'cancelled';
  }

  const totalDurationMs = Date.now() - startTime;
  addLog('info', `Workflow execution finished with status: ${finalStatus.toUpperCase()} (${totalDurationMs}ms)`);

  // Update Execution record in MongoDB
  execution.status = finalStatus;
  execution.completedAt = new Date();
  execution.durationMs = totalDurationMs;
  execution.finalOutput = executionContext.latestOutput;
  execution.nodeExecutionResults = nodeResults;
  execution.logs = logs;
  if (executionError) {
    execution.errorDetails = executionError;
  }

  await execution.save();
  return execution;
};

module.exports = { executeWorkflow };
