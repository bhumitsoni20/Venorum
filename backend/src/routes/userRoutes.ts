import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  adminGetAllUsers,
  adminGetUser,
  adminUpdateUser,
  adminDeleteUser,
} from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// User's own profile
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin user management
router.get('/admin/all', protect, adminGetAllUsers);
router
  .route('/admin/:id')
  .get(protect, adminGetUser)
  .put(protect, adminUpdateUser)
  .delete(protect, adminDeleteUser);

export default router;
