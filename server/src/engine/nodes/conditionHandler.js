const { resolveValue } = require('./actionHandler');

/**
 * Condition Node Execution Handler
 * Evaluates a conditional rule against the workflow execution context.
 *
 * Operators:
 * - equals (==)
 * - not_equals (!=)
 * - greater_than (>)
 * - less_than (<)
 * - contains (string or array contains)
 *
 * @param {Object} node - Node definition
 * @param {Object} executionContext - Current execution variables
 * @returns {Promise<{ status: string, output: Object, branch: string, log: string }>}
 */
const executeConditionNode = async (node, executionContext) => {
  const data = node.data || {};
  const variablePath = data.variable || '';
  const operator = (data.operator || 'equals').toLowerCase();
  let compareValue = data.value !== undefined ? data.value : '';

  // Extract actual value from context using dot notation
  const actualValue = resolveValue(variablePath, executionContext);

  // Cast numeric comparison if both sides look numeric
  let evaluatedValue = actualValue;
  let targetValue = compareValue;

  if (!isNaN(evaluatedValue) && evaluatedValue !== '' && evaluatedValue !== null && !isNaN(targetValue) && targetValue !== '') {
    evaluatedValue = Number(evaluatedValue);
    targetValue = Number(targetValue);
  }

  // Handle boolean strings e.g. "true" or "false"
  if (typeof actualValue === 'boolean' && typeof targetValue === 'string') {
    targetValue = targetValue.toLowerCase() === 'true';
  }

  let result = false;

  switch (operator) {
    case 'equals':
    case '==':
    case '===':
      result = evaluatedValue == targetValue;
      break;

    case 'not_equals':
    case '!=':
    case '!==':
      result = evaluatedValue != targetValue;
      break;

    case 'greater_than':
    case '>':
      result = Number(evaluatedValue) > Number(targetValue);
      break;

    case 'less_than':
    case '<':
      result = Number(evaluatedValue) < Number(targetValue);
      break;

    case 'contains':
      if (typeof actualValue === 'string') {
        result = actualValue.toLowerCase().includes(String(compareValue).toLowerCase());
      } else if (Array.isArray(actualValue)) {
        result = actualValue.includes(compareValue);
      } else {
        result = false;
      }
      break;

    default:
      result = Boolean(evaluatedValue);
      break;
  }

  const branch = result ? 'true' : 'false';
  const label = data.label || 'Condition';

  return {
    status: 'success',
    output: {
      result,
      branch,
      evaluatedVariable: variablePath,
      actualValue,
      operator,
      comparisonValue: compareValue,
    },
    branch, // Dictates whether downstream edge from 'true' or 'false' handle is followed
    log: `Condition "${label}" evaluated (${variablePath}: "${actualValue}" ${operator} "${compareValue}") -> Result: ${result ? 'TRUE' : 'FALSE'}`,
  };
};

module.exports = { executeConditionNode };
