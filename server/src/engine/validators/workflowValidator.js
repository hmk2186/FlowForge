/**
 * Workflow Validator Engine
 * Performs comprehensive topology and node configuration checks.
 *
 * Rules:
 * 1. Exactly one trigger node must exist.
 * 2. Every edge must connect existing nodes.
 * 3. No unsupported node types.
 * 4. Condition nodes must have valid connections for True/False handles where applicable.
 * 5. Cycle detection: DFS to prevent infinite loops.
 * 6. Reachability check: all functional nodes must be reachable from the trigger.
 * 7. Configuration validation for each specific node type.
 */

const { validateSafeUrl } = require('../../utils/urlValidator');

const ALLOWED_NODE_TYPES = ['trigger', 'action', 'condition', 'delay', 'webhook'];

/**
 * Validates a workflow definition.
 * @param {Array} nodes - Array of workflow nodes
 * @param {Array} edges - Array of workflow edges
 * @returns {{ isValid: boolean, errors: Array<{ nodeId?: string, message: string }>, warnings: Array<{ nodeId?: string, message: string }> }}
 */
const validateWorkflow = (nodes = [], edges = []) => {
  const errors = [];
  const warnings = [];

  // Check empty workflow
  if (!Array.isArray(nodes) || nodes.length === 0) {
    errors.push({ message: 'The workflow has no nodes. Add at least one Trigger node to begin.' });
    return { isValid: false, errors, warnings };
  }

  const nodesMap = new Map();
  nodes.forEach((n) => nodesMap.set(n.id, n));

  // 1. Verify Node Types and ID Uniqueness
  const triggers = [];
  nodes.forEach((node) => {
    if (!node.id) {
      errors.push({ message: 'A node is missing an ID.' });
      return;
    }

    if (!ALLOWED_NODE_TYPES.includes(node.type)) {
      errors.push({
        nodeId: node.id,
        message: `Node "${node.data?.label || node.id}" has unsupported type: "${node.type}".`,
      });
    }

    if (node.type === 'trigger') {
      triggers.push(node);
    }
  });

  // 2. Exactly One Trigger Rule
  if (triggers.length === 0) {
    errors.push({ message: 'Workflow must have exactly one starting Trigger node.' });
  } else if (triggers.length > 1) {
    errors.push({
      message: `Workflow has ${triggers.length} Trigger nodes. Exactly one starting Trigger node is allowed.`,
    });
  }

  // 3. Validate Connections / Edges
  const validEdges = [];
  const outgoingMap = new Map(); // nodeId -> [edge]
  const incomingMap = new Map(); // nodeId -> [edge]

  nodes.forEach((n) => {
    outgoingMap.set(n.id, []);
    incomingMap.set(n.id, []);
  });

  edges.forEach((edge) => {
    if (!nodesMap.has(edge.source)) {
      errors.push({
        message: `Connection references non-existent source node "${edge.source}".`,
      });
      return;
    }
    if (!nodesMap.has(edge.target)) {
      errors.push({
        message: `Connection references non-existent target node "${edge.target}".`,
      });
      return;
    }

    // Trigger node cannot have incoming edges
    const targetNode = nodesMap.get(edge.target);
    if (targetNode && targetNode.type === 'trigger') {
      errors.push({
        nodeId: edge.target,
        message: 'A Trigger node cannot have incoming connections.',
      });
    }

    validEdges.push(edge);
    outgoingMap.get(edge.source).push(edge);
    incomingMap.get(edge.target).push(edge);
  });

  // 4. Configuration Check by Node Type
  nodes.forEach((node) => {
    const data = node.data || {};
    const label = data.label || node.id;

    switch (node.type) {
      case 'trigger': {
        // Trigger can optionally provide sample JSON payload
        if (data.payload && typeof data.payload === 'string') {
          try {
            JSON.parse(data.payload);
          } catch (e) {
            errors.push({
              nodeId: node.id,
              message: `Trigger node "${label}" contains invalid initial JSON payload: ${e.message}`,
            });
          }
        }
        break;
      }

      case 'action': {
        const actionType = data.actionType || 'log';
        if (actionType === 'http_request') {
          if (!data.url) {
            errors.push({
              nodeId: node.id,
              message: `Action node "${label}" requires a destination URL.`,
            });
          } else {
            const urlCheck = validateSafeUrl(data.url);
            if (!urlCheck.isValid) {
              errors.push({
                nodeId: node.id,
                message: `Action node "${label}" URL error: ${urlCheck.error}`,
              });
            }
          }
        } else if (actionType === 'create_task') {
          if (!data.taskTitle || !data.taskTitle.trim()) {
            errors.push({
              nodeId: node.id,
              message: `Action node "${label}" requires a Task Title.`,
            });
          }
        }
        break;
      }

      case 'condition': {
        if (!data.variable || !data.variable.trim()) {
          errors.push({
            nodeId: node.id,
            message: `Condition node "${label}" requires a variable expression to evaluate.`,
          });
        }
        if (!data.operator) {
          errors.push({
            nodeId: node.id,
            message: `Condition node "${label}" requires a comparison operator (e.g. equals, greater_than).`,
          });
        }
        // Check condition output branches
        const outEdges = outgoingMap.get(node.id) || [];
        if (outEdges.length === 0) {
          warnings.push({
            nodeId: node.id,
            message: `Condition node "${label}" has no outgoing branches connected.`,
          });
        }
        break;
      }

      case 'delay': {
        const duration = Number(data.duration);
        if (isNaN(duration) || duration < 0) {
          errors.push({
            nodeId: node.id,
            message: `Delay node "${label}" must have a non-negative duration number.`,
          });
        }
        break;
      }

      case 'webhook': {
        if (!data.url) {
          errors.push({
            nodeId: node.id,
            message: `Webhook node "${label}" requires a destination URL.`,
          });
        } else {
          const urlCheck = validateSafeUrl(data.url);
          if (!urlCheck.isValid) {
            errors.push({
              nodeId: node.id,
              message: `Webhook node "${label}" URL validation error: ${urlCheck.error}`,
            });
          }
        }
        break;
      }

      default:
        break;
    }
  });

  // 5. Cycle Detection using DFS
  if (triggers.length === 1) {
    const trigger = triggers[0];
    const visited = new Set();
    const recStack = new Set();
    let hasCycle = false;

    const detectCycle = (currId) => {
      visited.add(currId);
      recStack.add(currId);

      const outEdges = outgoingMap.get(currId) || [];
      for (const edge of outEdges) {
        const nextId = edge.target;
        if (!visited.has(nextId)) {
          if (detectCycle(nextId)) return true;
        } else if (recStack.has(nextId)) {
          errors.push({
            nodeId: nextId,
            message: `Cycle detected: workflow contains an unsupported loop back to node "${nodesMap.get(nextId)?.data?.label || nextId}".`,
          });
          return true;
        }
      }

      recStack.delete(currId);
      return false;
    };

    detectCycle(trigger.id);

    // 6. Reachability Check: Every node should be reachable from the Trigger
    const reachableNodes = new Set();
    const traverseReachable = (currId) => {
      reachableNodes.add(currId);
      const outEdges = outgoingMap.get(currId) || [];
      for (const edge of outEdges) {
        if (!reachableNodes.has(edge.target)) {
          traverseReachable(edge.target);
        }
      }
    };

    traverseReachable(trigger.id);

    nodes.forEach((node) => {
      if (!reachableNodes.has(node.id)) {
        warnings.push({
          nodeId: node.id,
          message: `Node "${node.data?.label || node.id}" is orphaned (not reachable from the starting Trigger).`,
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

module.exports = { validateWorkflow };
