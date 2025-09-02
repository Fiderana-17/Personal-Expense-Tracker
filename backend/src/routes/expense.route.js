import express from 'express';
import { getAllExpenses,createExpense,getExpenseById,updateExpense,deleteExpense} from '../controllers/expense.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/expenses
router.get('/', getAllExpenses);
// POST /api/expenses
router.post('/', authenticateToken,createExpense);
// GET /api/expenses/:userId
router.get('/:id',authenticateToken, getExpenseById);
// PUT /api/expenses/:id
router.put('/:id',authenticateToken, updateExpense);

// DELETE /api/expenses/:id
router.delete('/:id', deleteExpense);
router.get('/:userId', authenticateToken, getAllExpenses);

export default router;