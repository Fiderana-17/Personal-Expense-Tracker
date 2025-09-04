import express from 'express';
import { getAllExpenses,createExpense,getExpenseById,updateExpense,deleteExpense} from '../controllers/expense.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllExpenses);
router.post('/', authenticateToken,createExpense);
router.get('/:id',authenticateToken, getExpenseById);
router.put('/:id',authenticateToken, updateExpense);
router.delete('/:id', deleteExpense);
router.get('/:userId', authenticateToken, getAllExpenses);

export default router;