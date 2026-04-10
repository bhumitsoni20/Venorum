import { Router } from 'express';
import { getBikanerRates } from '../controllers/rateController';

const router = Router();

// Specific endpoint for Bikaner
router.get('/bikaner', getBikanerRates);

// Generic endpoint for future cities
router.get('/:city', getBikanerRates);

export default router;
