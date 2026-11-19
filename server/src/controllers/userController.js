const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get user profile and activity stats
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Fetch user counts
    const totalWorkflows = await Workflow.countDocuments({ userId: req.user._id });
    const totalExecutions = await Execution.countDocuments({ userId: req.user._id });

    return successResponse(
      res,
      {
        user,
        stats: {
          totalWorkflows,
          totalExecutions,
        },
      },
      'User profile fetched'
    );
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to fetch profile', 500);
  }
};

/**
 * @desc    Update user profile name & basic info
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return errorResponse(res, 'Name cannot be empty', 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    ).select('-password');

    return successResponse(res, { user: updatedUser }, 'Profile updated successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to update profile', 500);
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Please provide both current and new password', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters long', 400);
    }

    // Retrieve user with password hash
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return successResponse(res, null, 'Password updated successfully');
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to change password', 500);
  }
};

module.exports = { getProfile, updateProfile, changePassword };
