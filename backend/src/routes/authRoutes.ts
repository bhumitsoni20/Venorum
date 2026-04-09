import { Router } from 'express';
import { firebaseLogin, adminLogin, forgotPassword, resetPassword, registerUser, verifyEmail } from '../controllers/authController';

const router = Router();

router.post('/login', firebaseLogin);
router.post('/admin/login', adminLogin);
router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
