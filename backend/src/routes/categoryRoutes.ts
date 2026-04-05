import { Router } from 'express';
import { createCategory, getCategories } from '../controllers/categoryController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.route('/').post(protect, createCategory).get(getCategories);

export default router;
