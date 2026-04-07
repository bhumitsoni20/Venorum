import { Router } from 'express';
import { firebaseLogin } from '../controllers/authController';

const router = Router();

router.post('/login', firebaseLogin);

export default router;
