import { Router } from 'express';
import { calculatePrice, saveCustomization, getMyCustomizations } from '../controllers/customizeController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.post('/price', calculatePrice);
router.post('/save', protect, saveCustomization);
router.get('/my', protect, getMyCustomizations);

export default router;
