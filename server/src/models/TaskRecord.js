const mongoose = require('mongoose');

/**
 * TaskRecord Schema
 * Stores actual database records created by the "Create Task / Record" Action Node.
 */
const taskRecordSchema = new mongoose.Schema(
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
    executionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Execution',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task record title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['created', 'pending', 'completed'],
      default: 'created',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

taskRecordSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('TaskRecord', taskRecordSchema);
