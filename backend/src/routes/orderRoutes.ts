import { Router } from 'express';
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  adminGetAllOrders,
  adminUpdateOrderStatus,
  adminDeleteOrder,
} from '../controllers/orderController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// User routes
router.route('/')
  .post(protect, addOrderItems);

router.route('/myorders')
  .get(protect, getMyOrders);

// Admin routes (must be before /:id to avoid conflict)
router.get('/admin/all', protect, adminGetAllOrders);
router.put('/admin/:id/status', protect, adminUpdateOrderStatus);
router.delete('/admin/:id', protect, adminDeleteOrder);

// User route (by ID)
router.route('/:id')
  .get(protect, getOrderById);

export default router;
