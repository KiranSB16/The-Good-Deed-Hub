import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// @desc    Toggle user access (restrict/permit)
// @route   PATCH /api/users/:id/access
// @access  Admin
export const toggleUserAccess = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent restricting admin users
  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Cannot restrict admin users');
  }

  user.isRestricted = !user.isRestricted;
  await user.save();

  res.json({
    success: true,
    message: `User ${user.isRestricted ? 'restricted' : 'permitted'} successfully`,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isRestricted: user.isRestricted,
      createdAt: user.createdAt
    }
  });
}); 