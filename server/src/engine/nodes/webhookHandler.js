const axios = require('axios');
const { validateSafeUrl } = require('../../utils/urlValidator');
const { interpolateString } = require('./actionHandler');

/**
 * Webhook Node Execution Handler
 * Connects with external HTTP APIs securely.
 *
 * @param {Object} node - Webhook node definition
 * @param {Object} executionContext - Current execution variables
 * @returns {Promise<{ status: string, output: Object, log: string }>}
 */
const executeWebhookNode = async (node, executionContext) => {
  const data = node.data || {};
  const label = data.label || 'Webhook Node';
  const rawUrl = data.url || '';

  if (!rawUrl) {
    throw new Error(`Webhook node "${label}" has no URL configured`);
  }

  // Interpolate dynamic parameters in URL
  const targetUrl = interpolateString(rawUrl, executionContext);

  // Enforce SSRF validation
  const urlCheck = validateSafeUrl(targetUrl);
  if (!urlCheck.isValid) {
    throw new Error(`SSRF blocked: ${urlCheck.error}`);
  }

  const method = (data.method || 'GET').toUpperCase();

  // Parse Headers
  let headers = {};
  if (data.headers) {
    try {
      headers = typeof data.headers === 'string' ? JSON.parse(data.headers) : data.headers;
    } catch (e) {
      headers = {};
    }
  }

  // Parse Request Body
  let body = null;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && data.body) {
    try {
      const interpolatedBody = interpolateString(
        typeof data.body === 'string' ? data.body : JSON.stringify(data.body),
        executionContext
      );
      body = JSON.parse(interpolatedBody);
    } catch (e) {
      body = data.body;
    }
  }

  const timeoutMs = parseInt(data.timeout, 10) || 10000;

  try {
    const response = await axios({
      method,
      url: targetUrl,
      headers: {
        'User-Agent': 'FlowForge-Workflow-Engine/1.0',
        ...headers,
      },
      data: body,
      timeout: Math.min(timeoutMs, 15000), // Max 15s timeout
      validateStatus: () => true, // Capture all HTTP status codes without throwing immediately
    });

    const isSuccessStatus = response.status >= 200 && response.status < 300;

    const output = {
      statusCode: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      isSuccess: isSuccessStatus,
    };

    if (!isSuccessStatus) {
      return {
        status: 'failed',
        output,
        log: `Webhook "${label}" received non-2xx status code: ${response.status}`,
        error: `HTTP Error: ${response.status} ${response.statusText}`,
      };
    }

    return {
      status: 'success',
      output,
      log: `Webhook "${label}" successfully called ${method} "${targetUrl}" (Status: ${response.status})`,
    };
  } catch (error) {
    const errorMsg = error.response
      ? `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`
      : error.message;

    return {
      status: 'failed',
      output: { error: errorMsg },
      log: `Webhook "${label}" failed: ${errorMsg}`,
      error: errorMsg,
    };
  }
};

module.exports = { executeWebhookNode };
