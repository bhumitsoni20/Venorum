import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import User from '../models/User';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch(error: any) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch(error:any) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

// =============================================
// ADMIN: User Management Endpoints
// =============================================

// @desc    Get all users (Admin only)
// @route   GET /api/users/admin/all
// @access  Private/Admin
export const adminGetAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      return;
    }

    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 20;
    const search = String(req.query.search || '');
    const skip = (page - 1) * limit;

    // Build search filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash -resetPasswordToken -resetPasswordExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user by ID (Admin only)
// @route   GET /api/users/admin/:id
// @access  Private/Admin
export const adminGetUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    const user = await User.findById(req.params.id)
      .select('-passwordHash -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update any user (Admin only)
// @route   PUT /api/users/admin/:id
// @access  Private/Admin
export const adminUpdateUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Prevent admin from demoting themselves
    if (user._id.toString() === req.user._id.toString() && req.body.role && req.body.role !== 'admin') {
      res.status(400).json({ message: 'You cannot demote your own admin account.' });
      return;
    }

    // Update allowed fields
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.email !== undefined) user.email = req.body.email;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.role !== undefined) user.role = req.body.role;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      createdAt: (updatedUser as any).createdAt,
      updatedAt: (updatedUser as any).updatedAt,
    });
  } catch (error: any) {
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ message: `A user with that ${field} already exists.` });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/users/admin/:id
// @access  Private/Admin
export const adminDeleteUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400).json({ message: 'You cannot delete your own admin account.' });
      return;
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User removed successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
