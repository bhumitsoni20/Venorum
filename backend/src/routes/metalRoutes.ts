import { Router } from 'express';
import { getMetals, seedMetals } from '../controllers/metalController';

const router = Router();

router.get('/', getMetals);
router.post('/seed', seedMetals);

export default router;
