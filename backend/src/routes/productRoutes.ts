import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.route('/').get(getProducts).post(protect, createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

export default router;
