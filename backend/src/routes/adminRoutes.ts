import { Router } from 'express';
import { getDashboardStats } from '../controllers/adminController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.get('/dashboard', protect, getDashboardStats);

export default router;
