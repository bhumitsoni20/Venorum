import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// All cart routes are protected
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:productId')
  .put(updateCartItem)
  .delete(removeFromCart);

export default router;
