const axios = require('axios');
const TaskRecord = require('../../models/TaskRecord');
const { validateSafeUrl } = require('../../utils/urlValidator');

/**
 * Resolves dot-notated paths and simple template tags (e.g. {{data.name}}).
 */
const resolveValue = (path, context) => {
  if (!path || typeof path !== 'string') return path;

  // If path is a pure variable lookup e.g. "data.user.name" or "trigger.email"
  const cleanPath = path.trim().replace(/^\{\{|\}\}$/g, '').trim();
  const parts = cleanPath.split('.');
  let current = context;

  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
};

/**
 * Replaces {{variable.path}} occurrences in a string template
 */
const interpolateString = (template, context) => {
  if (!template || typeof template !== 'string') return template;

  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match, path) => {
    const val = resolveValue(path, context);
    if (val !== undefined && val !== null) {
      return typeof val === 'object' ? JSON.stringify(val) : String(val);
    }
    return match;
  });
};

/**
 * Action Node Execution Handler
 * Supports:
 * - log: records formatted messages in logs
 * - create_task: SAVES a persistent TaskRecord in MongoDB
 * - http_request: performs an HTTP call
 * - data_transform: extracts, maps or calculates fields
 */
const executeActionNode = async (node, executionContext, meta = {}) => {
  const data = node.data || {};
  const actionType = data.actionType || 'log';
  const label = data.label || 'Action Node';

  switch (actionType) {
    case 'log': {
      const template = data.logMessage || data.message || 'Log action executed';
      const formattedMessage = interpolateString(template, executionContext);

      return {
        status: 'success',
        output: {
          action: 'log',
          message: formattedMessage,
          timestamp: new Date().toISOString(),
        },
        log: `[Log Action]: ${formattedMessage}`,
      };
    }

    case 'create_task': {
      // User requirement: Save actual records in MongoDB
      const rawTitle = data.taskTitle || data.title || 'Workflow Generated Task';
      const rawDesc = data.taskDescription || data.description || '';

      const interpolatedTitle = interpolateString(rawTitle, executionContext);
      const interpolatedDesc = interpolateString(rawDesc, executionContext);

      let recordPayload = {};
      if (data.taskPayload) {
        try {
          recordPayload = typeof data.taskPayload === 'string'
            ? JSON.parse(interpolateString(data.taskPayload, executionContext))
            : data.taskPayload;
        } catch (e) {
          recordPayload = { raw: data.taskPayload };
        }
      } else {
        // Default to current execution variables if no specific payload specified
        recordPayload = { ...executionContext.data, ...executionContext.latestOutput };
      }

      // Persist to MongoDB TaskRecord collection
      const taskRecord = await TaskRecord.create({
        userId: meta.userId,
        workflowId: meta.workflowId,
        executionId: meta.executionId,
        title: interpolatedTitle,
        description: interpolatedDesc,
        data: recordPayload,
        status: 'created',
      });

      return {
        status: 'success',
        output: {
          action: 'create_task',
          taskRecordId: taskRecord._id,
          title: taskRecord.title,
          description: taskRecord.description,
          status: taskRecord.status,
          createdAt: taskRecord.createdAt,
        },
        log: `Created persistent MongoDB TaskRecord: "${taskRecord.title}" (ID: ${taskRecord._id})`,
      };
    }

    case 'http_request': {
      const rawUrl = data.url;
      const targetUrl = interpolateString(rawUrl, executionContext);

      // Validate SSRF safe URL
      const urlCheck = validateSafeUrl(targetUrl);
      if (!urlCheck.isValid) {
        throw new Error(`SSRF Security check failed: ${urlCheck.error}`);
      }

      const method = (data.method || 'GET').toUpperCase();
      let headers = {};
      if (data.headers) {
        try {
          headers = typeof data.headers === 'string' ? JSON.parse(data.headers) : data.headers;
        } catch (e) {
          headers = {};
        }
      }

      let requestBody = null;
      if (['POST', 'PUT', 'PATCH'].includes(method) && data.body) {
        try {
          requestBody = typeof data.body === 'string'
            ? JSON.parse(interpolateString(data.body, executionContext))
            : data.body;
        } catch (e) {
          requestBody = data.body;
        }
      }

      const response = await axios({
        method,
        url: targetUrl,
        headers,
        data: requestBody,
        timeout: 10000, // 10 second timeout
      });

      return {
        status: 'success',
        output: {
          action: 'http_request',
          statusCode: response.status,
          data: response.data,
        },
        log: `HTTP ${method} to "${targetUrl}" responded with status ${response.status}`,
      };
    }

    case 'data_transform': {
      const sourceField = data.sourceField || 'data';
      const targetField = data.targetField || 'transformed';
      const transformType = data.transformType || 'uppercase';

      const sourceVal = resolveValue(sourceField, executionContext);
      let transformedVal = sourceVal;

      if (typeof sourceVal === 'string') {
        if (transformType === 'uppercase') transformedVal = sourceVal.toUpperCase();
        if (transformType === 'lowercase') transformedVal = sourceVal.toLowerCase();
        if (transformType === 'trim') transformedVal = sourceVal.trim();
      } else if (typeof sourceVal === 'number') {
        if (transformType === 'round') transformedVal = Math.round(sourceVal);
        if (transformType === 'multiply_by_two') transformedVal = sourceVal * 2;
      } else if (Array.isArray(sourceVal)) {
        if (transformType === 'count') transformedVal = sourceVal.length;
      }

      return {
        status: 'success',
        output: {
          action: 'data_transform',
          [targetField]: transformedVal,
          original: sourceVal,
        },
        log: `Transformed "${sourceField}" (${transformType}) -> Result: ${JSON.stringify(transformedVal)}`,
      };
    }

    default:
      return {
        status: 'success',
        output: { executed: true },
        log: `Action "${label}" processed`,
      };
  }
};

module.exports = { executeActionNode, resolveValue, interpolateString };
