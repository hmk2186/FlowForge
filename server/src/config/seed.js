const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const connectDB = require('./db');
const User = require('../models/User');
const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const TaskRecord = require('../models/TaskRecord');

/**
 * Seed Script for FlowForge Demo Account & Realistic Demo Data
 * Creates:
 * 1. Demo User (demo@flowforge.com / Demo@123)
 * 2. 5 Fully Configured, Valid Demo Workflows
 * 3. 16 Realistic Execution Records with node-level details
 * 4. Sample TaskRecord persistent documents
 */
const seedDatabase = async () => {
  try {
    console.log('[Seeder] Connecting to MongoDB...');
    await connectDB();

    const demoEmail = 'demo@flowforge.com';

    // 1. Check or Create Demo User
    let demoUser = await User.findOne({ email: demoEmail });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Demo@123', salt);

    if (demoUser) {
      console.log(`[Seeder] Existing demo user found (${demoEmail}). Refreshing demo data...`);
      // Update password hash just in case
      demoUser.password = hashedPassword;
      demoUser.name = 'FlowForge Demo';
      await demoUser.save();

      // Clean old demo data linked to this user
      await Workflow.deleteMany({ userId: demoUser._id });
      await Execution.deleteMany({ userId: demoUser._id });
      await TaskRecord.deleteMany({ userId: demoUser._id });
    } else {
      console.log(`[Seeder] Creating new demo user (${demoEmail})...`);
      demoUser = await User.create({
        name: 'FlowForge Demo',
        email: demoEmail,
        password: hashedPassword,
        role: 'user',
      });
    }

    const userId = demoUser._id;

    // 2. Define 5 Realistic Workflows
    console.log('[Seeder] Creating 5 realistic demo workflows...');

    // Workflow 1: Welcome Email Automation (Active)
    // Topology: Trigger -> Condition -> Action
    const wf1 = await Workflow.create({
      userId,
      name: 'Welcome Email Automation',
      description: 'Checks if new user is verified, then dispatches an onboarding welcome email.',
      status: 'active',
      nodes: [
        {
          id: 'node_wf1_trigger',
          type: 'trigger',
          position: { x: 250, y: 50 },
          data: {
            label: 'New User Registered',
            triggerType: 'manual',
            payload: JSON.stringify({
              userId: 'usr_8921',
              userName: 'Alex Morgan',
              email: 'alex@example.com',
              isVerified: true,
              plan: 'Pro Trial',
            }, null, 2),
          },
        },
        {
          id: 'node_wf1_cond',
          type: 'condition',
          position: { x: 250, y: 220 },
          data: {
            label: 'Is User Verified?',
            variable: 'data.isVerified',
            operator: 'equals',
            value: true,
          },
        },
        {
          id: 'node_wf1_action',
          type: 'action',
          position: { x: 250, y: 390 },
          data: {
            label: 'Send Welcome Email',
            actionType: 'log',
            logMessage: 'Dispatching welcome onboarding email to {{data.userName}} at {{data.email}} for plan {{data.plan}}.',
          },
        },
      ],
      edges: [
        {
          id: 'edge_wf1_1_2',
          source: 'node_wf1_trigger',
          target: 'node_wf1_cond',
        },
        {
          id: 'edge_wf1_2_3',
          source: 'node_wf1_cond',
          target: 'node_wf1_action',
          sourceHandle: 'true',
        },
      ],
    });

    // Workflow 2: Task Management Workflow (Active)
    // Topology: Trigger -> Action (Create TaskRecord) -> Delay -> Action (Log)
    const wf2 = await Workflow.create({
      userId,
      name: 'Task Management Workflow',
      description: 'Creates a persistent database record, waits 5 seconds, and logs status update.',
      status: 'active',
      nodes: [
        {
          id: 'node_wf2_trigger',
          type: 'trigger',
          position: { x: 250, y: 50 },
          data: {
            label: 'Incoming Job Request',
            triggerType: 'manual',
            payload: JSON.stringify({
              ticketId: 'TCK-4091',
              title: 'Review System Metrics',
              priority: 'High',
              category: 'Infrastructure',
            }, null, 2),
          },
        },
        {
          id: 'node_wf2_create_task',
          type: 'action',
          position: { x: 250, y: 200 },
          data: {
            label: 'Create Task Record',
            actionType: 'create_task',
            taskTitle: 'Audit Task: {{data.ticketId}} - {{data.title}}',
            taskDescription: 'Priority: {{data.priority}}, Category: {{data.category}}',
          },
        },
        {
          id: 'node_wf2_delay',
          type: 'delay',
          position: { x: 250, y: 350 },
          data: {
            label: 'Wait 5 Seconds',
            duration: 5,
            unit: 'seconds',
          },
        },
        {
          id: 'node_wf2_log',
          type: 'action',
          position: { x: 250, y: 500 },
          data: {
            label: 'Log Task Finalized',
            actionType: 'log',
            logMessage: 'Task record for ticket {{data.ticketId}} processed after delay.',
          },
        },
      ],
      edges: [
        {
          id: 'edge_wf2_1_2',
          source: 'node_wf2_trigger',
          target: 'node_wf2_create_task',
        },
        {
          id: 'edge_wf2_2_3',
          source: 'node_wf2_create_task',
          target: 'node_wf2_delay',
        },
        {
          id: 'edge_wf2_3_4',
          source: 'node_wf2_delay',
          target: 'node_wf2_log',
        },
      ],
    });

    // Workflow 3: API Data Processing (Active)
    // Topology: Trigger -> Webhook (HTTP GET) -> Action (Data Transform) -> Action (Log)
    const wf3 = await Workflow.create({
      userId,
      name: 'API Data Processing',
      description: 'Fetches external API data, extracts values, and logs formatted output.',
      status: 'active',
      nodes: [
        {
          id: 'node_wf3_trigger',
          type: 'trigger',
          position: { x: 250, y: 50 },
          data: {
            label: 'Data Sync Trigger',
            triggerType: 'manual',
            payload: JSON.stringify({
              service: 'GitHub Status',
              metric: 'operational_check',
            }, null, 2),
          },
        },
        {
          id: 'node_wf3_http',
          type: 'webhook',
          position: { x: 250, y: 200 },
          data: {
            label: 'Fetch Public Endpoint',
            method: 'GET',
            url: 'https://httpbin.org/get',
            timeout: 8000,
          },
        },
        {
          id: 'node_wf3_transform',
          type: 'action',
          position: { x: 250, y: 350 },
          data: {
            label: 'Transform Payload',
            actionType: 'data_transform',
            sourceField: 'data.service',
            targetField: 'processedService',
            transformType: 'uppercase',
          },
        },
        {
          id: 'node_wf3_log',
          type: 'action',
          position: { x: 250, y: 500 },
          data: {
            label: 'Log Processed Data',
            actionType: 'log',
            logMessage: 'Service {{processedService}} successfully verified via endpoint.',
          },
        },
      ],
      edges: [
        {
          id: 'edge_wf3_1_2',
          source: 'node_wf3_trigger',
          target: 'node_wf3_http',
        },
        {
          id: 'edge_wf3_2_3',
          source: 'node_wf3_http',
          target: 'node_wf3_transform',
        },
        {
          id: 'edge_wf3_3_4',
          source: 'node_wf3_transform',
          target: 'node_wf3_log',
        },
      ],
    });

    // Workflow 4: Conditional Approval Workflow (Draft)
    // Topology: Trigger -> Condition -> True Branch Action / False Branch Action
    const wf4 = await Workflow.create({
      userId,
      name: 'Conditional Approval Workflow',
      description: 'Routes expense requests based on threshold: above 1000 requires VP sign-off, below auto-approves.',
      status: 'draft',
      nodes: [
        {
          id: 'node_wf4_trigger',
          type: 'trigger',
          position: { x: 300, y: 50 },
          data: {
            label: 'Expense Claim Submitted',
            triggerType: 'manual',
            payload: JSON.stringify({
              claimId: 'EXP-902',
              amount: 1450,
              currency: 'USD',
              submitter: 'Sarah Connor',
              department: 'Engineering',
            }, null, 2),
          },
        },
        {
          id: 'node_wf4_condition',
          type: 'condition',
          position: { x: 300, y: 220 },
          data: {
            label: 'Amount > 1000 ?',
            variable: 'data.amount',
            operator: 'greater_than',
            value: 1000,
          },
        },
        {
          id: 'node_wf4_action_true',
          type: 'action',
          position: { x: 100, y: 400 },
          data: {
            label: 'Route to VP Approval',
            actionType: 'log',
            logMessage: 'High-value claim {{data.claimId}} (${{data.amount}}) escalated to VP of Engineering for review.',
          },
        },
        {
          id: 'node_wf4_action_false',
          type: 'action',
          position: { x: 480, y: 400 },
          data: {
            label: 'Auto-Approve Claim',
            actionType: 'log',
            logMessage: 'Standard expense claim {{data.claimId}} (${{data.amount}}) auto-approved.',
          },
        },
      ],
      edges: [
        {
          id: 'edge_wf4_1_2',
          source: 'node_wf4_trigger',
          target: 'node_wf4_condition',
        },
        {
          id: 'edge_wf4_2_3_true',
          source: 'node_wf4_condition',
          target: 'node_wf4_action_true',
          sourceHandle: 'true',
        },
        {
          id: 'edge_wf4_2_4_false',
          source: 'node_wf4_condition',
          target: 'node_wf4_action_false',
          sourceHandle: 'false',
        },
      ],
    });

    // Workflow 5: Webhook Integration (Inactive)
    // Topology: Trigger -> Webhook -> Condition -> Action
    const wf5 = await Workflow.create({
      userId,
      name: 'Webhook Integration',
      description: 'Executes an external webhook integration, verifies response status, and creates an audit record.',
      status: 'inactive',
      nodes: [
        {
          id: 'node_wf5_trigger',
          type: 'trigger',
          position: { x: 250, y: 50 },
          data: {
            label: 'Webhook Dispatcher Trigger',
            triggerType: 'manual',
            payload: JSON.stringify({
              targetService: 'Payment Gateway Ping',
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        },
        {
          id: 'node_wf5_webhook',
          type: 'webhook',
          position: { x: 250, y: 200 },
          data: {
            label: 'Post To Endpoint',
            method: 'POST',
            url: 'https://httpbin.org/post',
            body: JSON.stringify({ ping: 'flowforge_healthcheck' }),
            timeout: 5000,
          },
        },
        {
          id: 'node_wf5_condition',
          type: 'condition',
          position: { x: 250, y: 350 },
          data: {
            label: 'Status Code is 200?',
            variable: 'statusCode',
            operator: 'equals',
            value: 200,
          },
        },
        {
          id: 'node_wf5_action',
          type: 'action',
          position: { x: 250, y: 500 },
          data: {
            label: 'Save Audit Record',
            actionType: 'create_task',
            taskTitle: 'Audit: Webhook Ping Succeeded',
            taskDescription: 'Remote API responded with HTTP 200.',
          },
        },
      ],
      edges: [
        {
          id: 'edge_wf5_1_2',
          source: 'node_wf5_trigger',
          target: 'node_wf5_webhook',
        },
        {
          id: 'edge_wf5_2_3',
          source: 'node_wf5_webhook',
          target: 'node_wf5_condition',
        },
        {
          id: 'edge_wf5_3_4',
          source: 'node_wf5_condition',
          target: 'node_wf5_action',
          sourceHandle: 'true',
        },
      ],
    });

    console.log('[Seeder] 5 Workflows created.');

    // 3. Create Sample Persistent TaskRecords
    console.log('[Seeder] Creating realistic TaskRecords...');
    await TaskRecord.create([
      {
        userId,
        workflowId: wf2._id,
        executionId: new mongoose.Types.ObjectId(),
        title: 'Audit Task: TCK-4091 - Review System Metrics',
        description: 'Priority: High, Category: Infrastructure',
        data: { ticketId: 'TCK-4091', priority: 'High', status: 'In Review' },
        status: 'completed',
      },
      {
        userId,
        workflowId: wf5._id,
        executionId: new mongoose.Types.ObjectId(),
        title: 'Audit: Webhook Ping Succeeded',
        description: 'Remote API responded with HTTP 200.',
        data: { statusCode: 200, latencyMs: 240 },
        status: 'created',
      },
    ]);

    // 4. Create 16 Realistic Execution Records
    console.log('[Seeder] Creating 16 realistic execution history records...');

    const workflowsList = [wf1, wf2, wf3, wf4, wf5];
    const executionsData = [];

    // Helper to generate past dates
    const daysAgo = (d, hoursOffset = 0) => {
      const date = new Date();
      date.setDate(date.getDate() - d);
      date.setHours(date.getHours() - hoursOffset);
      return date;
    };

    // Execution 1: Welcome Email (Success)
    executionsData.push({
      userId,
      workflowId: wf1._id,
      workflowName: wf1.name,
      status: 'success',
      startedAt: daysAgo(0, 1),
      completedAt: daysAgo(0, 0.98),
      durationMs: 340,
      initialPayload: { userName: 'Elena Rostova', email: 'elena@startup.io', isVerified: true },
      finalOutput: { action: 'log', message: 'Dispatching welcome onboarding email to Elena Rostova' },
      nodeExecutionResults: [
        {
          nodeId: 'node_wf1_trigger',
          nodeType: 'trigger',
          nodeName: 'New User Registered',
          status: 'success',
          durationMs: 12,
          input: { userName: 'Elena Rostova', isVerified: true },
          output: { triggerType: 'manual', data: { userName: 'Elena Rostova', isVerified: true } },
        },
        {
          nodeId: 'node_wf1_cond',
          nodeType: 'condition',
          nodeName: 'Is User Verified?',
          status: 'success',
          durationMs: 8,
          input: { isVerified: true },
          output: { result: true, branch: 'true' },
        },
        {
          nodeId: 'node_wf1_action',
          nodeType: 'action',
          nodeName: 'Send Welcome Email',
          status: 'success',
          durationMs: 320,
          input: { email: 'elena@startup.io' },
          output: { action: 'log', message: 'Sent welcome email' },
        },
      ],
      logs: [
        { timestamp: daysAgo(0, 1), level: 'info', message: 'Execution started for Welcome Email Automation' },
        { timestamp: daysAgo(0, 1), level: 'info', message: 'Evaluated isVerified -> TRUE' },
        { timestamp: daysAgo(0, 0.98), level: 'info', message: 'Welcome email sent successfully' },
      ],
    });

    // Execution 2: Task Management (Success with delay)
    executionsData.push({
      userId,
      workflowId: wf2._id,
      workflowName: wf2.name,
      status: 'success',
      startedAt: daysAgo(0, 4),
      completedAt: daysAgo(0, 3.9),
      durationMs: 5240,
      initialPayload: { ticketId: 'TCK-8812', title: 'Database Optimization' },
      finalOutput: { action: 'log', message: 'Task record finalized' },
      nodeExecutionResults: [
        {
          nodeId: 'node_wf2_trigger',
          nodeType: 'trigger',
          nodeName: 'Incoming Job Request',
          status: 'success',
          durationMs: 10,
        },
        {
          nodeId: 'node_wf2_create_task',
          nodeType: 'action',
          nodeName: 'Create Task Record',
          status: 'success',
          durationMs: 45,
          output: { taskRecordId: 'tsk_0918', title: 'Audit Task: TCK-8812' },
        },
        {
          nodeId: 'node_wf2_delay',
          nodeType: 'delay',
          nodeName: 'Wait 5 Seconds',
          status: 'success',
          durationMs: 5005,
          output: { delayedMs: 5000 },
        },
        {
          nodeId: 'node_wf2_log',
          nodeType: 'action',
          nodeName: 'Log Task Finalized',
          status: 'success',
          durationMs: 18,
          output: { message: 'Task finalized' },
        },
      ],
      logs: [
        { timestamp: daysAgo(0, 4), level: 'info', message: 'Workflow execution started' },
        { timestamp: daysAgo(0, 4), level: 'info', message: 'Created persistent TaskRecord in MongoDB' },
        { timestamp: daysAgo(0, 3.9), level: 'info', message: 'Delay completed (5000ms)' },
        { timestamp: daysAgo(0, 3.9), level: 'info', message: 'Execution finished successfully' },
      ],
    });

    // Execution 3: API Data Processing (Success)
    executionsData.push({
      userId,
      workflowId: wf3._id,
      workflowName: wf3.name,
      status: 'success',
      startedAt: daysAgo(1, 2),
      completedAt: daysAgo(1, 1.95),
      durationMs: 820,
      initialPayload: { service: 'stripe-payments' },
      finalOutput: { action: 'log', message: 'Service STRIPE-PAYMENTS verified' },
      nodeExecutionResults: [
        { nodeId: 'node_wf3_trigger', nodeType: 'trigger', nodeName: 'Data Sync Trigger', status: 'success', durationMs: 15 },
        { nodeId: 'node_wf3_http', nodeType: 'webhook', nodeName: 'Fetch Public Endpoint', status: 'success', durationMs: 650, output: { statusCode: 200 } },
        { nodeId: 'node_wf3_transform', nodeType: 'action', nodeName: 'Transform Payload', status: 'success', durationMs: 10, output: { processedService: 'STRIPE-PAYMENTS' } },
        { nodeId: 'node_wf3_log', nodeType: 'action', nodeName: 'Log Processed Data', status: 'success', durationMs: 145 },
      ],
      logs: [
        { timestamp: daysAgo(1, 2), level: 'info', message: 'HTTP GET https://httpbin.org/get completed with status 200' },
        { timestamp: daysAgo(1, 1.95), level: 'info', message: 'Transformed data to uppercase' },
      ],
    });

    // Execution 4: Conditional Approval (Success - High Value Branch)
    executionsData.push({
      userId,
      workflowId: wf4._id,
      workflowName: wf4.name,
      status: 'success',
      startedAt: daysAgo(1, 6),
      completedAt: daysAgo(1, 5.98),
      durationMs: 280,
      initialPayload: { claimId: 'EXP-1092', amount: 3500 },
      finalOutput: { action: 'log', message: 'High-value claim routed to VP' },
      nodeExecutionResults: [
        { nodeId: 'node_wf4_trigger', nodeType: 'trigger', nodeName: 'Expense Claim Submitted', status: 'success', durationMs: 12 },
        { nodeId: 'node_wf4_condition', nodeType: 'condition', nodeName: 'Amount > 1000 ?', status: 'success', durationMs: 8, output: { result: true, branch: 'true' } },
        { nodeId: 'node_wf4_action_true', nodeType: 'action', nodeName: 'Route to VP Approval', status: 'success', durationMs: 260 },
      ],
      logs: [
        { timestamp: daysAgo(1, 6), level: 'info', message: 'Condition Amount > 1000 evaluated to TRUE' },
        { timestamp: daysAgo(1, 5.98), level: 'info', message: 'Routed claim EXP-1092 to VP' },
      ],
    });

    // Execution 5: Webhook Integration (Failed due to remote 500)
    executionsData.push({
      userId,
      workflowId: wf5._id,
      workflowName: wf5.name,
      status: 'failed',
      startedAt: daysAgo(2, 3),
      completedAt: daysAgo(2, 2.98),
      durationMs: 640,
      initialPayload: { targetService: 'External Microservice' },
      finalOutput: null,
      nodeExecutionResults: [
        { nodeId: 'node_wf5_trigger', nodeType: 'trigger', nodeName: 'Webhook Dispatcher Trigger', status: 'success', durationMs: 14 },
        { nodeId: 'node_wf5_webhook', nodeType: 'webhook', nodeName: 'Post To Endpoint', status: 'failed', durationMs: 620, error: 'HTTP Error: 503 Service Unavailable' },
      ],
      logs: [
        { timestamp: daysAgo(2, 3), level: 'info', message: 'Dispatching webhook POST request' },
        { timestamp: daysAgo(2, 2.98), level: 'error', message: 'Remote service responded with status 503' },
      ],
      errorDetails: {
        message: 'HTTP Error: 503 Service Unavailable',
        nodeId: 'node_wf5_webhook',
      },
    });

    // Execution 6: Welcome Email (Success - Verified user)
    executionsData.push({
      userId,
      workflowId: wf1._id,
      workflowName: wf1.name,
      status: 'success',
      startedAt: daysAgo(2, 8),
      completedAt: daysAgo(2, 7.98),
      durationMs: 310,
      initialPayload: { userName: 'Marcus Brody', isVerified: true },
      finalOutput: { action: 'log', message: 'Email sent' },
      nodeExecutionResults: [
        { nodeId: 'node_wf1_trigger', nodeType: 'trigger', nodeName: 'New User Registered', status: 'success', durationMs: 10 },
        { nodeId: 'node_wf1_cond', nodeType: 'condition', nodeName: 'Is User Verified?', status: 'success', durationMs: 5, output: { result: true } },
        { nodeId: 'node_wf1_action', nodeType: 'action', nodeName: 'Send Welcome Email', status: 'success', durationMs: 295 },
      ],
      logs: [{ timestamp: daysAgo(2, 8), level: 'info', message: 'Welcome email sent' }],
    });

    // Execution 7: Task Management (Cancelled during delay)
    executionsData.push({
      userId,
      workflowId: wf2._id,
      workflowName: wf2.name,
      status: 'cancelled',
      startedAt: daysAgo(3, 1),
      completedAt: daysAgo(3, 0.95),
      durationMs: 2100,
      initialPayload: { ticketId: 'TCK-9901' },
      finalOutput: null,
      nodeExecutionResults: [
        { nodeId: 'node_wf2_trigger', nodeType: 'trigger', nodeName: 'Incoming Job Request', status: 'success', durationMs: 12 },
        { nodeId: 'node_wf2_create_task', nodeType: 'action', nodeName: 'Create Task Record', status: 'success', durationMs: 38 },
        { nodeId: 'node_wf2_delay', nodeType: 'delay', nodeName: 'Wait 5 Seconds', status: 'failed', durationMs: 2050, error: 'Cancelled by user' },
      ],
      logs: [
        { timestamp: daysAgo(3, 1), level: 'info', message: 'Execution initiated' },
        { timestamp: daysAgo(3, 0.95), level: 'warn', message: 'Execution was cancelled by the user during delay' },
      ],
    });

    // Execution 8: API Data Processing (Success)
    executionsData.push({
      userId,
      workflowId: wf3._id,
      workflowName: wf3.name,
      status: 'success',
      startedAt: daysAgo(3, 7),
      completedAt: daysAgo(3, 6.95),
      durationMs: 760,
      initialPayload: { service: 'Cloudflare Worker' },
      finalOutput: { processedService: 'CLOUDFLARE WORKER' },
      nodeExecutionResults: [
        { nodeId: 'node_wf3_trigger', nodeType: 'trigger', nodeName: 'Data Sync Trigger', status: 'success', durationMs: 10 },
        { nodeId: 'node_wf3_http', nodeType: 'webhook', nodeName: 'Fetch Public Endpoint', status: 'success', durationMs: 620 },
        { nodeId: 'node_wf3_transform', nodeType: 'action', nodeName: 'Transform Payload', status: 'success', durationMs: 15 },
        { nodeId: 'node_wf3_log', nodeType: 'action', nodeName: 'Log Processed Data', status: 'success', durationMs: 115 },
      ],
      logs: [{ timestamp: daysAgo(3, 7), level: 'info', message: 'API request completed cleanly' }],
    });

    // Execution 9: Conditional Approval (Success - Low Value Auto-Approve)
    executionsData.push({
      userId,
      workflowId: wf4._id,
      workflowName: wf4.name,
      status: 'success',
      startedAt: daysAgo(4, 2),
      completedAt: daysAgo(4, 1.98),
      durationMs: 190,
      initialPayload: { claimId: 'EXP-401', amount: 350 },
      finalOutput: { action: 'log', message: 'Auto-approved claim EXP-401' },
      nodeExecutionResults: [
        { nodeId: 'node_wf4_trigger', nodeType: 'trigger', nodeName: 'Expense Claim Submitted', status: 'success', durationMs: 11 },
        { nodeId: 'node_wf4_condition', nodeType: 'condition', nodeName: 'Amount > 1000 ?', status: 'success', durationMs: 9, output: { result: false, branch: 'false' } },
        { nodeId: 'node_wf4_action_false', nodeType: 'action', nodeName: 'Auto-Approve Claim', status: 'success', durationMs: 170 },
      ],
      logs: [{ timestamp: daysAgo(4, 2), level: 'info', message: 'Amount 350 <= 1000 -> Auto-approved' }],
    });

    // Execution 10: Welcome Email (Failed - Unverified User)
    executionsData.push({
      userId,
      workflowId: wf1._id,
      workflowName: wf1.name,
      status: 'success',
      startedAt: daysAgo(4, 9),
      completedAt: daysAgo(4, 8.98),
      durationMs: 130,
      initialPayload: { userName: 'Bot Account', isVerified: false },
      finalOutput: null,
      nodeExecutionResults: [
        { nodeId: 'node_wf1_trigger', nodeType: 'trigger', nodeName: 'New User Registered', status: 'success', durationMs: 15 },
        { nodeId: 'node_wf1_cond', nodeType: 'condition', nodeName: 'Is User Verified?', status: 'success', durationMs: 10, output: { result: false, branch: 'false' } },
      ],
      logs: [{ timestamp: daysAgo(4, 9), level: 'info', message: 'User unverified, welcome email omitted.' }],
    });

    // Execution 11: Task Management (Success)
    executionsData.push({
      userId,
      workflowId: wf2._id,
      workflowName: wf2.name,
      status: 'success',
      startedAt: daysAgo(5, 3),
      completedAt: daysAgo(5, 2.9),
      durationMs: 5190,
      initialPayload: { ticketId: 'TCK-2201', priority: 'Medium' },
      finalOutput: { message: 'Task complete' },
      nodeExecutionResults: [
        { nodeId: 'node_wf2_trigger', nodeType: 'trigger', nodeName: 'Incoming Job Request', status: 'success', durationMs: 14 },
        { nodeId: 'node_wf2_create_task', nodeType: 'action', nodeName: 'Create Task Record', status: 'success', durationMs: 40 },
        { nodeId: 'node_wf2_delay', nodeType: 'delay', nodeName: 'Wait 5 Seconds', status: 'success', durationMs: 5005 },
        { nodeId: 'node_wf2_log', nodeType: 'action', nodeName: 'Log Task Finalized', status: 'success', durationMs: 131 },
      ],
      logs: [{ timestamp: daysAgo(5, 3), level: 'info', message: 'Task created and delay completed' }],
    });

    // Execution 12: API Data Processing (Failed - Connection Timeout)
    executionsData.push({
      userId,
      workflowId: wf3._id,
      workflowName: wf3.name,
      status: 'failed',
      startedAt: daysAgo(5, 11),
      completedAt: daysAgo(5, 10.95),
      durationMs: 4200,
      initialPayload: { service: 'Timeout API' },
      finalOutput: null,
      nodeExecutionResults: [
        { nodeId: 'node_wf3_trigger', nodeType: 'trigger', nodeName: 'Data Sync Trigger', status: 'success', durationMs: 12 },
        { nodeId: 'node_wf3_http', nodeType: 'webhook', nodeName: 'Fetch Public Endpoint', status: 'failed', durationMs: 4180, error: 'Connection timeout of 4000ms exceeded' },
      ],
      logs: [
        { timestamp: daysAgo(5, 11), level: 'error', message: 'Destination endpoint failed to respond before timeout' },
      ],
      errorDetails: { message: 'Connection timeout exceeded', nodeId: 'node_wf3_http' },
    });

    // Execution 13: Webhook Integration (Success)
    executionsData.push({
      userId,
      workflowId: wf5._id,
      workflowName: wf5.name,
      status: 'success',
      startedAt: daysAgo(6, 1),
      completedAt: daysAgo(6, 0.95),
      durationMs: 910,
      initialPayload: { targetService: 'Webhook Check' },
      finalOutput: { taskRecordId: 'tsk_audit_981' },
      nodeExecutionResults: [
        { nodeId: 'node_wf5_trigger', nodeType: 'trigger', nodeName: 'Webhook Dispatcher Trigger', status: 'success', durationMs: 10 },
        { nodeId: 'node_wf5_webhook', nodeType: 'webhook', nodeName: 'Post To Endpoint', status: 'success', durationMs: 680, output: { statusCode: 200 } },
        { nodeId: 'node_wf5_condition', nodeType: 'condition', nodeName: 'Status Code is 200?', status: 'success', durationMs: 10, output: { result: true } },
        { nodeId: 'node_wf5_action', nodeType: 'action', nodeName: 'Save Audit Record', status: 'success', durationMs: 210 },
      ],
      logs: [{ timestamp: daysAgo(6, 1), level: 'info', message: 'Audit record persisted successfully' }],
    });

    // Execution 14: Welcome Email (Success)
    executionsData.push({
      userId,
      workflowId: wf1._id,
      workflowName: wf1.name,
      status: 'success',
      startedAt: daysAgo(6, 6),
      completedAt: daysAgo(6, 5.98),
      durationMs: 290,
      initialPayload: { userName: 'Liam Vance', isVerified: true },
      finalOutput: { action: 'log', message: 'Welcome email sent' },
      nodeExecutionResults: [
        { nodeId: 'node_wf1_trigger', nodeType: 'trigger', nodeName: 'New User Registered', status: 'success', durationMs: 10 },
        { nodeId: 'node_wf1_cond', nodeType: 'condition', nodeName: 'Is User Verified?', status: 'success', durationMs: 8, output: { result: true } },
        { nodeId: 'node_wf1_action', nodeType: 'action', nodeName: 'Send Welcome Email', status: 'success', durationMs: 272 },
      ],
      logs: [{ timestamp: daysAgo(6, 6), level: 'info', message: 'Welcome email dispatched' }],
    });

    // Execution 15: Task Management (Cancelled)
    executionsData.push({
      userId,
      workflowId: wf2._id,
      workflowName: wf2.name,
      status: 'cancelled',
      startedAt: daysAgo(6, 12),
      completedAt: daysAgo(6, 11.95),
      durationMs: 1800,
      initialPayload: { ticketId: 'TCK-CANCEL-1' },
      finalOutput: null,
      nodeExecutionResults: [
        { nodeId: 'node_wf2_trigger', nodeType: 'trigger', nodeName: 'Incoming Job Request', status: 'success', durationMs: 15 },
        { nodeId: 'node_wf2_create_task', nodeType: 'action', nodeName: 'Create Task Record', status: 'success', durationMs: 45 },
        { nodeId: 'node_wf2_delay', nodeType: 'delay', nodeName: 'Wait 5 Seconds', status: 'failed', durationMs: 1740, error: 'Cancelled by operator' },
      ],
      logs: [{ timestamp: daysAgo(6, 12), level: 'warn', message: 'Job cancelled by user' }],
    });

    // Execution 16: Conditional Approval (Success)
    executionsData.push({
      userId,
      workflowId: wf4._id,
      workflowName: wf4.name,
      status: 'success',
      startedAt: daysAgo(6, 18),
      completedAt: daysAgo(6, 17.98),
      durationMs: 240,
      initialPayload: { claimId: 'EXP-889', amount: 2200 },
      finalOutput: { message: 'High value claim escalated' },
      nodeExecutionResults: [
        { nodeId: 'node_wf4_trigger', nodeType: 'trigger', nodeName: 'Expense Claim Submitted', status: 'success', durationMs: 12 },
        { nodeId: 'node_wf4_condition', nodeType: 'condition', nodeName: 'Amount > 1000 ?', status: 'success', durationMs: 8, output: { result: true } },
        { nodeId: 'node_wf4_action_true', nodeType: 'action', nodeName: 'Route to VP Approval', status: 'success', durationMs: 220 },
      ],
      logs: [{ timestamp: daysAgo(6, 18), level: 'info', message: 'Escalation complete' }],
    });

    // Insert all executions
    await Execution.insertMany(executionsData);
    console.log(`[Seeder] ${executionsData.length} Executions created successfully.`);

    console.log('====================================================');
    console.log(' FlowForge Database Seeding Complete!');
    console.log(' Demo Account Credentials:');
    console.log('   Email:    demo@flowforge.com');
    console.log('   Password: Demo@123');
    console.log(' Seeded Data Summary:');
    console.log('   - 5 Workflows (Active, Draft, Inactive)');
    console.log('   - 16 Execution History Records');
    console.log('   - Persistent TaskRecords in MongoDB');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

// Execute seeder if run directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
