import { Router } from 'express';
import { getGems, seedGems } from '../controllers/gemController';

const router = Router();

router.get('/', getGems);
router.post('/seed', seedGems);

export default router;
