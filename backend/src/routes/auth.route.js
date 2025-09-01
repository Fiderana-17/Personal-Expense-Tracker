import express from 'express';
import { changePassword, getMe, login, signup } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();


router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/changePassword', authenticateToken, changePassword);

export default router;
