/**
 * Automated Unit & Integration Tests for FlowForge Execution Engine & Validator
 * Run via: npm test
 */

const assert = require('assert');
const { validateWorkflow } = require('../src/engine/validators/workflowValidator');
const { executeTriggerNode } = require('../src/engine/nodes/triggerHandler');
const { executeActionNode, resolveValue, interpolateString } = require('../src/engine/nodes/actionHandler');
const { executeConditionNode } = require('../src/engine/nodes/conditionHandler');
const { executeDelayNode } = require('../src/engine/nodes/delayHandler');
const { validateSafeUrl } = require('../src/utils/urlValidator');

async function runTests() {
  console.log('🧪 Starting FlowForge Backend & Engine Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  };

  // 1. Validator Tests
  console.log('--- 1. Workflow Validator Tests ---');

  await test('Rejects workflow with zero nodes', () => {
    const res = validateWorkflow([], []);
    assert.strictEqual(res.isValid, false);
    assert.strictEqual(res.errors.length, 1);
  });

  await test('Rejects workflow with no Trigger node', () => {
    const nodes = [
      { id: 'n1', type: 'action', data: { label: 'Action 1' } },
    ];
    const res = validateWorkflow(nodes, []);
    assert.strictEqual(res.isValid, false);
    assert(res.errors.some(e => e.message.includes('starting Trigger')));
  });

  await test('Rejects workflow with multiple Trigger nodes', () => {
    const nodes = [
      { id: 't1', type: 'trigger', data: { label: 'Trigger 1' } },
      { id: 't2', type: 'trigger', data: { label: 'Trigger 2' } },
    ];
    const res = validateWorkflow(nodes, []);
    assert.strictEqual(res.isValid, false);
    assert(res.errors.some(e => e.message.includes('2 Trigger nodes')));
  });

  await test('Detects cyclical loop back to ancestor node', () => {
    const nodes = [
      { id: 't1', type: 'trigger', data: { label: 'Trigger' } },
      { id: 'a1', type: 'action', data: { label: 'Action 1' } },
      { id: 'a2', type: 'action', data: { label: 'Action 2' } },
    ];
    const edges = [
      { id: 'e1', source: 't1', target: 'a1' },
      { id: 'e2', source: 'a1', target: 'a2' },
      { id: 'e3', source: 'a2', target: 'a1' }, // Cycle back to a1
    ];
    const res = validateWorkflow(nodes, edges);
    assert.strictEqual(res.isValid, false);
    assert(res.errors.some(e => e.message.includes('Cycle detected')));
  });

  await test('Accepts valid sequential workflow', () => {
    const nodes = [
      { id: 't1', type: 'trigger', data: { label: 'Trigger' } },
      { id: 'a1', type: 'action', data: { label: 'Action 1', actionType: 'log' } },
    ];
    const edges = [
      { id: 'e1', source: 't1', target: 'a1' },
    ];
    const res = validateWorkflow(nodes, edges);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.errors.length, 0);
  });

  // 2. SSRF Security URL Validator Tests
  console.log('\n--- 2. SSRF Security URL Validator Tests ---');

  await test('Rejects localhost, 127.0.0.1, and private IPs', () => {
    assert.strictEqual(validateSafeUrl('http://localhost:5000').isValid, false);
    assert.strictEqual(validateSafeUrl('http://127.0.0.1/api').isValid, false);
    assert.strictEqual(validateSafeUrl('http://192.168.1.1/admin').isValid, false);
    assert.strictEqual(validateSafeUrl('http://10.0.0.1/internal').isValid, false);
    assert.strictEqual(validateSafeUrl('http://169.254.169.254/latest/meta-data/').isValid, false);
  });

  await test('Accepts valid public HTTPS URLs', () => {
    assert.strictEqual(validateSafeUrl('https://httpbin.org/get').isValid, true);
    assert.strictEqual(validateSafeUrl('https://api.github.com/zen').isValid, true);
  });

  // 3. Node Handlers Tests
  console.log('\n--- 3. Node Execution Handler Tests ---');

  await test('Trigger Node parses and structures payload', async () => {
    const node = { id: 't1', type: 'trigger', data: { label: 'Start', triggerType: 'manual' } };
    const context = { initialPayload: { user: 'Test User', score: 95 } };
    const res = await executeTriggerNode(node, context);
    assert.strictEqual(res.status, 'success');
    assert.strictEqual(res.output.data.user, 'Test User');
    assert.strictEqual(res.output.data.score, 95);
  });

  await test('Action Node resolves string interpolation and log message', async () => {
    const node = {
      id: 'a1',
      type: 'action',
      data: {
        label: 'Log User',
        actionType: 'log',
        logMessage: 'Hello {{user.name}}! Score is {{user.score}}.',
      },
    };
    const context = { user: { name: 'Sarah', score: 100 } };
    const res = await executeActionNode(node, context);
    assert.strictEqual(res.status, 'success');
    assert.strictEqual(res.output.message, 'Hello Sarah! Score is 100.');
  });

  await test('Action Node transforms data correctly (uppercase and count)', async () => {
    const node1 = {
      id: 'a2',
      type: 'action',
      data: {
        actionType: 'data_transform',
        sourceField: 'item.name',
        targetField: 'upperName',
        transformType: 'uppercase',
      },
    };
    const context1 = { item: { name: 'flowforge' } };
    const res1 = await executeActionNode(node1, context1);
    assert.strictEqual(res1.output.upperName, 'FLOWFORGE');

    const node2 = {
      id: 'a3',
      type: 'action',
      data: {
        actionType: 'data_transform',
        sourceField: 'tags',
        targetField: 'tagCount',
        transformType: 'count',
      },
    };
    const context2 = { tags: ['dev', 'workflow', 'automation'] };
    const res2 = await executeActionNode(node2, context2);
    assert.strictEqual(res2.output.tagCount, 3);
  });

  await test('Condition Node evaluates greater_than operator', async () => {
    const node = {
      id: 'c1',
      type: 'condition',
      data: {
        variable: 'order.amount',
        operator: 'greater_than',
        value: 500,
      },
    };

    // Case 1: True
    const contextTrue = { order: { amount: 750 } };
    const resTrue = await executeConditionNode(node, contextTrue);
    assert.strictEqual(resTrue.branch, 'true');
    assert.strictEqual(resTrue.output.result, true);

    // Case 2: False
    const contextFalse = { order: { amount: 200 } };
    const resFalse = await executeConditionNode(node, contextFalse);
    assert.strictEqual(resFalse.branch, 'false');
    assert.strictEqual(resFalse.output.result, false);
  });

  await test('Condition Node evaluates contains and equals operator', async () => {
    const nodeEquals = {
      id: 'c2',
      type: 'condition',
      data: {
        variable: 'status',
        operator: 'equals',
        value: 'active',
      },
    };
    const resEq = await executeConditionNode(nodeEquals, { status: 'active' });
    assert.strictEqual(resEq.branch, 'true');

    const nodeContains = {
      id: 'c3',
      type: 'condition',
      data: {
        variable: 'description',
        operator: 'contains',
        value: 'urgent',
      },
    };
    const resCont = await executeConditionNode(nodeContains, { description: 'This is an URGENT task' });
    assert.strictEqual(resCont.branch, 'true');
  });

  await test('Delay Node executes and respects small durations', async () => {
    const node = {
      id: 'd1',
      type: 'delay',
      data: {
        duration: 0.1, // 100ms
        unit: 'seconds',
      },
    };
    const start = Date.now();
    const res = await executeDelayNode(node, {});
    const elapsed = Date.now() - start;
    assert.strictEqual(res.status, 'success');
    assert(elapsed >= 90);
  });

  console.log('\n=======================================');
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('=======================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
