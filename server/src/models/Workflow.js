const mongoose = require('mongoose');

/**
 * Workflow Schema
 * Stores visual canvas data (nodes and edges) along with workflow metadata.
 */
const workflowSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a workflow name'],
      trim: true,
      maxlength: [100, 'Workflow name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'inactive'],
      default: 'draft',
      index: true,
    },
    // Visual node components stored with their canvas coordinates and custom parameters
    nodes: {
      type: [
        {
          id: { type: String, required: true },
          type: {
            type: String,
            required: true,
            enum: ['trigger', 'action', 'condition', 'delay', 'webhook'],
          },
          position: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
          },
          data: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
          },
        },
      ],
      default: [],
    },
    // Connections between nodes
    edges: {
      type: [
        {
          id: { type: String, required: true },
          source: { type: String, required: true },
          target: { type: String, required: true },
          sourceHandle: { type: String, default: null },
          targetHandle: { type: String, default: null },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Composite index for fast listing of workflows by user sorted by creation date
workflowSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Workflow', workflowSchema);
