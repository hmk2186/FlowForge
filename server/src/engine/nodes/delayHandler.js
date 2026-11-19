const Execution = require('../../models/Execution');

/**
 * Delay Node Execution Handler
 * Pauses execution for a specified duration while checking for cancellation.
 *
 * @param {Object} node - Node definition
 * @param {Object} executionContext - Execution variables
 * @param {Object} meta - Metadata including executionId
 * @returns {Promise<{ status: string, output: Object, log: string }>}
 */
const executeDelayNode = async (node, executionContext, meta = {}) => {
  const data = node.data || {};
  const label = data.label || 'Delay Node';
  const unit = (data.unit || 'seconds').toLowerCase();
  let duration = parseFloat(data.duration) || 1;

  // Convert to milliseconds
  let ms = duration * 1000;
  if (unit === 'minutes') {
    ms = duration * 60 * 1000;
  }

  // Cap live execution delay to safe ceiling (e.g. max 60 seconds) so requests do not hang indefinitely
  const maxAllowedMs = 60 * 1000;
  const actualMs = Math.min(ms, maxAllowedMs);

  const startTime = Date.now();

  // Sleep in chunks of 500ms to allow responsive cancellation
  const chunkSize = 500;
  let elapsed = 0;

  while (elapsed < actualMs) {
    // Check if execution was cancelled by user
    if (meta.executionId) {
      const currentExec = await Execution.findById(meta.executionId).select('status');
      if (currentExec && currentExec.status === 'cancelled') {
        const error = new Error('Execution cancelled by user during delay.');
        error.isCancelled = true;
        throw error;
      }
    }

    const waitTime = Math.min(chunkSize, actualMs - elapsed);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    elapsed += waitTime;
  }

  return {
    status: 'success',
    output: {
      delayedMs: actualMs,
      requestedDuration: duration,
      unit,
      completedAt: new Date().toISOString(),
    },
    log: `Delay node "${label}" waited for ${actualMs / 1000}s (Requested: ${duration} ${unit})`,
  };
};

module.exports = { executeDelayNode };
