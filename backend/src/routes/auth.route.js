import express from 'express';
import { changePassword, getMe, login, signup, uploadProfilePic } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/profile-pictures/',
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}_${Date.now()}_${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post('/uploadProfilePic', authenticateToken, upload.single('profilePic'), uploadProfilePic);
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/changePassword', authenticateToken, changePassword);

export default router;
