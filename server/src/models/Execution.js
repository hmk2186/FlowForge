const mongoose = require('mongoose');

/**
 * Execution Schema
 * Tracks the complete lifecycle, node-by-node audit records, logs, and outputs of a workflow execution.
 */
const executionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
      index: true,
    },
    workflowName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'success', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    initialPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    finalOutput: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Detailed step-by-step results for each node visited during traversal
    nodeExecutionResults: [
      {
        nodeId: { type: String, required: true },
        nodeType: { type: String, required: true },
        nodeName: { type: String, default: '' },
        status: {
          type: String,
          enum: ['pending', 'running', 'success', 'failed', 'skipped'],
          default: 'pending',
        },
        startedAt: { type: Date, default: null },
        completedAt: { type: Date, default: null },
        durationMs: { type: Number, default: 0 },
        input: { type: mongoose.Schema.Types.Mixed, default: null },
        output: { type: mongoose.Schema.Types.Mixed, default: null },
        error: { type: String, default: null },
      },
    ],
    // Time-ordered execution log messages
    logs: [
      {
        timestamp: { type: Date, default: Date.now },
        level: {
          type: String,
          enum: ['info', 'warn', 'error'],
          default: 'info',
        },
        message: { type: String, required: true },
        nodeId: { type: String, default: null },
      },
    ],
    errorDetails: {
      message: { type: String, default: null },
      nodeId: { type: String, default: null },
      stack: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// Fast lookups by user and recency
executionSchema.index({ userId: 1, createdAt: -1 });
executionSchema.index({ workflowId: 1, createdAt: -1 });

module.exports = mongoose.model('Execution', executionSchema);
