import { Router } from 'express';
import { getShapes, seedShapes } from '../controllers/shapeController';

const router = Router();

router.get('/', getShapes);
router.post('/seed', seedShapes);

export default router;
