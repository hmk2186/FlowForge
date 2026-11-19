/**
 * Trigger Node Execution Handler
 * Receives initial workflow execution payload and standardizes the starting context.
 *
 * @param {Object} node - React Flow node definition
 * @param {Object} executionContext - Current workflow execution variables
 * @returns {Promise<{ status: string, output: Object, log: string }>}
 */
const executeTriggerNode = async (node, executionContext) => {
  const nodeData = node.data || {};
  const label = nodeData.label || 'Manual Trigger';

  // Extract initial input payload provided at workflow trigger
  let payload = executionContext.initialPayload || {};

  // If node has preconfigured static sample payload and no runtime payload provided
  if (Object.keys(payload).length === 0 && nodeData.payload) {
    try {
      payload = typeof nodeData.payload === 'string' ? JSON.parse(nodeData.payload) : nodeData.payload;
    } catch (e) {
      payload = { raw: nodeData.payload };
    }
  }

  const output = {
    triggerType: nodeData.triggerType || 'manual',
    timestamp: new Date().toISOString(),
    data: payload,
  };

  return {
    status: 'success',
    output,
    log: `Trigger node "${label}" activated with payload: ${JSON.stringify(payload).substring(0, 100)}`,
  };
};

module.exports = { executeTriggerNode };
