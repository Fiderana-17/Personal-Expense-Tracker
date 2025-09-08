import express from 'express';
import { getAllExpenses,createExpense,getExpenseById,updateExpense,deleteExpense , getExpensesByRange , getMonthlyTrends} from '../controllers/expense.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.get('/', getAllExpenses);
router.post('/', authenticateToken,createExpense);
router.get('/:id',authenticateToken, getExpenseById);
router.put('/:id',authenticateToken, updateExpense);
router.delete('/:id', deleteExpense);
router.get('/:userId', authenticateToken, getAllExpenses);
router.get("/stats/monthly-trends", getMonthlyTrends);
router.get("/stats/range", getExpensesByRange);




export default router;