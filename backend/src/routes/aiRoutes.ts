import { Router } from 'express';
import { styleSuggest } from '../controllers/aiController';

const router = Router();

router.post('/style-suggest', styleSuggest);

export default router;
