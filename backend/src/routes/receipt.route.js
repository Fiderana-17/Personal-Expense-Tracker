import express from 'express';
import {
  uploadReceipt,
  downloadReceipt,
  viewReceipt,
  deleteReceiptController,
} from '../controllers/receipt.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/upload', authenticateToken, uploadReceipt);
router.get('/:id/view', authenticateToken, viewReceipt);
router.get('/:id/download', authenticateToken, downloadReceipt);
router.delete('/:id', authenticateToken, deleteReceiptController);

export default router;
