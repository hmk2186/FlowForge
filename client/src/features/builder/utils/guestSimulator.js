/**
 * Safe Guest Demo Workflow Simulator
 *
 * Client-side execution simulation for unauthenticated visitors.
 * Features:
 * - Traverses nodes step-by-step following topological connections.
 * - Accurately evaluates condition expressions (True vs False branches).
 * - Simulates Action and Delay nodes with realistic visual latencies.
 * - SAFE: Performs NO real external HTTP requests and NO MongoDB database writes.
 * - Clearly marked with demo logs and simulation disclaimers.
 */

// Helper to resolve nested object paths e.g. "data.isVerified"
const resolvePath = (path, context) => {
  if (!path || typeof path !== 'string') return path;
  const clean = path.replace(/^\{\{|\}\}$/g, '').trim();
  const parts = clean.split('.');
  let current = context;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
};

// Helper for template string interpolation e.g. "Hello {{data.name}}"
const interpolate = (template, context) => {
  if (!template || typeof template !== 'string') return template;
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match, path) => {
    const val = resolvePath(path, context);
    if (val !== undefined && val !== null) {
      return typeof val === 'object' ? JSON.stringify(val) : String(val);
    }
    return match;
  });
};

export const simulateGuestWorkflow = async (
  nodes = [],
  edges = [],
  initialPayload = {},
  onStepProgress = () => {},
  isCancelledRef = { current: false }
) => {
  // Validate trigger
  const triggerNode = nodes.find((n) => n.type === 'trigger');
  if (!triggerNode) {
    throw new Error('Simulation failed: No valid Trigger node found.');
  }

  const nodesMap = new Map();
  nodes.forEach((n) => nodesMap.set(n.id, n));

  const outgoingEdgesMap = new Map();
  nodes.forEach((n) => outgoingEdgesMap.set(n.id, []));
  edges.forEach((edge) => {
    if (outgoingEdgesMap.has(edge.source)) {
      outgoingEdgesMap.get(edge.source).push(edge);
    }
  });

  const executionContext = {
    initialPayload,
    data: { ...initialPayload },
    nodes: {},
  };

  const logs = [
    {
      timestamp: new Date(),
      level: 'info',
      message: '[Demo Simulation] Starting client-side workflow simulation...',
    },
  ];

  const nodeResults = [];
  let currentNodeId = triggerNode.id;
  const startTime = Date.now();
  let stepCount = 0;
  const MAX_STEPS = 25;

  while (currentNodeId && stepCount < MAX_STEPS) {
    if (isCancelledRef.current) {
      logs.push({
        timestamp: new Date(),
        level: 'warn',
        message: '[Demo Simulation] Simulation cancelled by user.',
      });
      break;
    }

    stepCount++;
    const node = nodesMap.get(currentNodeId);
    if (!node) break;

    const data = node.data || {};
    const label = data.label || node.id;
    const stepStart = Date.now();

    // Small simulated delay for visual progression (400ms - 800ms)
    await new Promise((r) => setTimeout(r, 500));

    let output = null;
    let branch = null;
    let stepLog = '';

    switch (node.type) {
      case 'trigger': {
        output = { triggerType: 'manual', data: executionContext.data };
        stepLog = `[Demo] Trigger "${label}" initiated with sample payload`;
        break;
      }

      case 'action': {
        const actionType = data.actionType || 'log';
        if (actionType === 'create_task') {
          output = {
            simulatedRecordId: `sim_task_${Date.now()}`,
            title: interpolate(data.taskTitle || 'Simulated Task', executionContext),
            note: 'Demo Simulation: Record created in browser memory only.',
          };
          stepLog = `[Demo Action] Simulated Task created: "${output.title}" (Browser Memory)`;
        } else if (actionType === 'data_transform') {
          const sourceVal = resolvePath(data.sourceField || 'data', executionContext);
          let transformed = sourceVal;
          if (typeof sourceVal === 'string' && data.transformType === 'uppercase') {
            transformed = sourceVal.toUpperCase();
          }
          output = { [data.targetField || 'transformed']: transformed, original: sourceVal };
          stepLog = `[Demo Action] Transformed data to: ${JSON.stringify(transformed)}`;
        } else if (actionType === 'http_request') {
          output = {
            statusCode: 200,
            statusText: 'OK (Simulated Demo)',
            data: { message: 'Simulated HTTP 200 response for guest demo mode' },
          };
          stepLog = `[Demo Action] Simulated HTTP request to ${data.url || 'endpoint'} -> Status 200`;
        } else {
          const msg = interpolate(data.logMessage || 'Processing...', executionContext);
          output = { message: msg };
          stepLog = `[Demo Action]: ${msg}`;
        }
        break;
      }

      case 'condition': {
        const actualVal = resolvePath(data.variable, executionContext);
        const op = data.operator || 'equals';
        const targetVal = data.value;

        let evalResult = false;
        if (op === 'equals' || op === '==') {
          evalResult = String(actualVal) === String(targetVal);
        } else if (op === 'greater_than' || op === '>') {
          evalResult = Number(actualVal) > Number(targetVal);
        } else if (op === 'less_than' || op === '<') {
          evalResult = Number(actualVal) < Number(targetVal);
        } else if (op === 'contains') {
          evalResult = String(actualVal).toLowerCase().includes(String(targetVal).toLowerCase());
        }

        branch = evalResult ? 'true' : 'false';
        output = { result: evalResult, branch };
        stepLog = `[Demo Condition] "${label}" (${data.variable}: ${actualVal} ${op} ${targetVal}) -> Result: ${evalResult ? 'TRUE' : 'FALSE'}`;
        break;
      }

      case 'delay': {
        const waitSec = Math.min(Number(data.duration) || 2, 3); // Max 3s in demo
        stepLog = `[Demo Delay] Waiting ${waitSec}s...`;
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        output = { waitedSeconds: waitSec };
        break;
      }

      case 'webhook': {
        // Safe simulated webhook - NO network calls made
        output = {
          statusCode: 200,
          statusText: 'OK (Simulated Webhook)',
          note: 'Demo mode: Real HTTP calls require an authenticated account',
          data: { success: true, timestamp: new Date().toISOString() },
        };
        stepLog = `[Demo Webhook] Safely simulated HTTP ${data.method || 'GET'} to ${data.url || 'API'} -> Status 200`;
        break;
      }

      default:
        output = { executed: true };
        stepLog = `Node "${label}" evaluated`;
        break;
    }

    const durationMs = Date.now() - stepStart;
    const stepResult = {
      nodeId: node.id,
      nodeType: node.type,
      nodeName: label,
      status: 'success',
      durationMs,
      input: { ...executionContext.data },
      output,
    };

    nodeResults.push(stepResult);
    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: stepLog,
      nodeId: node.id,
    });

    // Update execution context
    executionContext.nodes[node.id] = output;
    if (output && typeof output === 'object') {
      Object.assign(executionContext.data, output);
    }

    onStepProgress({
      status: 'running',
      nodeExecutionResults: [...nodeResults],
      logs: [...logs],
    });

    // Route next node
    const outEdges = outgoingEdgesMap.get(node.id) || [];
    if (outEdges.length === 0) {
      currentNodeId = null;
    } else if (node.type === 'condition') {
      const match = outEdges.find((e) => {
        const h = (e.sourceHandle || '').toLowerCase();
        return h === branch || h.includes(branch);
      });
      currentNodeId = match ? match.target : null;
    } else {
      currentNodeId = outEdges[0].target;
    }
  }

  const totalDuration = Date.now() - startTime;
  logs.push({
    timestamp: new Date(),
    level: 'info',
    message: `[Demo Simulation Completed] Total time: ${totalDuration}ms`,
  });

  return {
    _id: `guest_sim_${Date.now()}`,
    status: isCancelledRef.current ? 'cancelled' : 'success',
    durationMs: totalDuration,
    startedAt: new Date(startTime),
    completedAt: new Date(),
    isGuestSimulation: true,
    nodeExecutionResults: nodeResults,
    logs,
  };
};
