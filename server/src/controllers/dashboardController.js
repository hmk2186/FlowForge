const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get aggregated dashboard stats for authenticated user
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate workflows by status
    const [
      totalWorkflows,
      activeWorkflows,
      draftWorkflows,
      inactiveWorkflows,
    ] = await Promise.all([
      Workflow.countDocuments({ userId }),
      Workflow.countDocuments({ userId, status: 'active' }),
      Workflow.countDocuments({ userId, status: 'draft' }),
      Workflow.countDocuments({ userId, status: 'inactive' }),
    ]);

    // Aggregate executions by status
    const [
      totalExecutions,
      successExecutions,
      failedExecutions,
      cancelledExecutions,
      runningExecutions,
    ] = await Promise.all([
      Execution.countDocuments({ userId }),
      Execution.countDocuments({ userId, status: 'success' }),
      Execution.countDocuments({ userId, status: 'failed' }),
      Execution.countDocuments({ userId, status: 'cancelled' }),
      Execution.countDocuments({ userId, status: { $in: ['pending', 'running'] } }),
    ]);

    // Calculate success rate percentage
    const completedExecutions = successExecutions + failedExecutions;
    const successRate = completedExecutions > 0
      ? Math.round((successExecutions / completedExecutions) * 100)
      : 0;

    return successResponse(
      res,
      {
        workflows: {
          total: totalWorkflows,
          active: activeWorkflows,
          draft: draftWorkflows,
          inactive: inactiveWorkflows,
        },
        executions: {
          total: totalExecutions,
          success: successExecutions,
          failed: failedExecutions,
          cancelled: cancelledExecutions,
          running: runningExecutions,
          successRate,
        },
      },
      'Dashboard stats retrieved'
    );
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch dashboard stats', 500);
  }
};

/**
 * @desc    Get recent workflow & execution activity
 * @route   GET /api/dashboard/activity
 * @access  Private
 */
const getDashboardActivity = async (req, res) => {
  try {
    const userId = req.user._id;

    const [recentWorkflows, recentExecutions] = await Promise.all([
      Workflow.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('name description status updatedAt nodes'),
      Execution.find({ userId })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('workflowName status startedAt durationMs errorDetails'),
    ]);

    return successResponse(
      res,
      {
        recentWorkflows: recentWorkflows.map((w) => ({
          id: w._id,
          name: w.name,
          description: w.description,
          status: w.status,
          nodeCount: w.nodes ? w.nodes.length : 0,
          updatedAt: w.updatedAt,
        })),
        recentExecutions: recentExecutions.map((e) => ({
          id: e._id,
          workflowName: e.workflowName,
          status: e.status,
          startedAt: e.startedAt,
          durationMs: e.durationMs,
          error: e.errorDetails?.message,
        })),
      },
      'Recent activity retrieved'
    );
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch recent activity', 500);
  }
};

/**
 * @desc    Get time-series charts data for executions
 * @route   GET /api/dashboard/charts
 * @access  Private
 */
const getDashboardCharts = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const executions = await Execution.find({
      userId,
      createdAt: { $gte: sevenDaysAgo },
    }).select('status createdAt');

    // Group executions by date string (YYYY-MM-DD)
    const trendMap = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      trendMap[dateKey] = {
        date: dateKey,
        label: dayLabel,
        total: 0,
        success: 0,
        failed: 0,
      };
    }

    executions.forEach((e) => {
      const dateKey = new Date(e.createdAt).toISOString().split('T')[0];
      if (trendMap[dateKey]) {
        trendMap[dateKey].total += 1;
        if (e.status === 'success') trendMap[dateKey].success += 1;
        if (e.status === 'failed') trendMap[dateKey].failed += 1;
      }
    });

    const executionTrends = Object.values(trendMap);

    // Success vs Failure distribution counts
    const statusCounts = await Execution.aggregate([
      { $match: { userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusMap = { success: 0, failed: 0, cancelled: 0, running: 0 };
    statusCounts.forEach((s) => {
      if (statusMap[s._id] !== undefined) {
        statusMap[s._id] = s.count;
      }
    });

    const successVsFailure = [
      { name: 'Success', value: statusMap.success, color: '#10b981' },
      { name: 'Failed', value: statusMap.failed, color: '#ef4444' },
      { name: 'Cancelled', value: statusMap.cancelled, color: '#6b7280' },
    ];

    return successResponse(
      res,
      {
        executionTrends,
        successVsFailure,
      },
      'Dashboard chart data retrieved'
    );
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch chart data', 500);
  }
};

module.exports = {
  getDashboardStats,
  getDashboardActivity,
  getDashboardCharts,
};
