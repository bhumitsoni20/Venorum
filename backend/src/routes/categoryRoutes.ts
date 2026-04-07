import { Router } from 'express';
import { createCategory, getCategories, deleteCategory } from '../controllers/categoryController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.route('/').post(protect, createCategory).get(getCategories);
router.route('/:id').delete(protect, deleteCategory);

export default router;
