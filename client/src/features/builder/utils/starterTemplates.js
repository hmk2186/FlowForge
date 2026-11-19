/**
 * Verified starter workflow templates for FlowForge.
 * Matches the 5 seeded workflows and uses only supported node types and properties.
 */

export const STARTER_TEMPLATES = [
  {
    id: 'welcome-email',
    name: 'Welcome Email Automation',
    category: 'Onboarding',
    description: 'Validates if new user is verified, then dispatches an onboarding welcome email.',
    status: 'active',
    nodes: [
      {
        id: 'node_wf1_trigger',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'New User Registered',
          triggerType: 'manual',
          payload: JSON.stringify(
            {
              userId: 'usr_8921',
              userName: 'Alex Morgan',
              email: 'alex@example.com',
              isVerified: true,
              plan: 'Pro Trial',
            },
            null,
            2
          ),
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
          logMessage:
            'Dispatching welcome onboarding email to {{data.userName}} at {{data.email}} for plan {{data.plan}}.',
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
  },
  {
    id: 'task-management',
    name: 'Task Management Workflow',
    category: 'Operations',
    description: 'Simulates creating a task record, pauses for a delay, and logs task completion.',
    status: 'active',
    nodes: [
      {
        id: 'node_wf2_trigger',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'Incoming Job Request',
          triggerType: 'manual',
          payload: JSON.stringify(
            {
              ticketId: 'TCK-4091',
              title: 'Review System Metrics',
              priority: 'High',
              category: 'Infrastructure',
            },
            null,
            2
          ),
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
          label: 'Wait 3 Seconds',
          duration: 3,
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
  },
  {
    id: 'api-data-processing',
    name: 'API Data Processing',
    category: 'Integrations',
    description: 'Fetches external data, extracts target fields, and logs formatted uppercase output.',
    status: 'active',
    nodes: [
      {
        id: 'node_wf3_trigger',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'Data Sync Trigger',
          triggerType: 'manual',
          payload: JSON.stringify(
            {
              service: 'GitHub Status',
              metric: 'operational_check',
            },
            null,
            2
          ),
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
  },
  {
    id: 'conditional-approval',
    name: 'Conditional Approval Workflow',
    category: 'Finance',
    description: 'Routes claims: above 1000 escalates to VP, below 1000 auto-approves.',
    status: 'draft',
    nodes: [
      {
        id: 'node_wf4_trigger',
        type: 'trigger',
        position: { x: 300, y: 50 },
        data: {
          label: 'Expense Claim Submitted',
          triggerType: 'manual',
          payload: JSON.stringify(
            {
              claimId: 'EXP-902',
              amount: 1450,
              currency: 'USD',
              submitter: 'Sarah Connor',
              department: 'Engineering',
            },
            null,
            2
          ),
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
          logMessage:
            'High-value claim {{data.claimId}} (${{data.amount}}) escalated to VP of Engineering for review.',
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
  },
  {
    id: 'webhook-integration',
    name: 'Webhook Integration',
    category: 'Webhooks',
    description: 'Trigger → Webhook → Condition → Action pipeline for external HTTP round-trips.',
    status: 'inactive',
    nodes: [
      {
        id: 'node_wf5_trigger',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'Webhook Dispatcher Trigger',
          triggerType: 'manual',
          payload: JSON.stringify(
            {
              targetService: 'Payment Gateway Ping',
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
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
  },
];
