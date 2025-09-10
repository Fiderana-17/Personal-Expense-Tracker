import express from 'express';
import { getAllExpenses,createExpense,getExpenseById,updateExpense,deleteExpense , getExpensesByRange , getMonthlyTrends, uploadReceipt} from '../controllers/expense.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: 'uploads/receipts/',
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}_${Date.now()}_${file.originalname}`);
  }
});
const upload = multer({ storage });

const router = express.Router();

router.post('/:id/receipt', authenticateToken, upload.single('receipt'), uploadReceipt);
router.get('/', getAllExpenses);
router.post('/', authenticateToken,createExpense);
router.get('/:id',authenticateToken, getExpenseById);
router.put('/:id',authenticateToken, updateExpense);
router.delete('/:id', deleteExpense);
router.get('/:userId', authenticateToken, getAllExpenses);
router.get("/stats/monthly-trends", getMonthlyTrends);
router.get("/stats/range", getExpensesByRange);




export default router;