import express from 'express';
import {
  signup,
  login,
  sendVerificationCode,
  verifyVerificationCode,
  forgotPassword,
  changePassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/send-verification-code', sendVerificationCode);
router.post('/verify-verification-code', verifyVerificationCode);
router.post('/forgot-password', forgotPassword);
router.post('/change-password', changePassword);


export default router;