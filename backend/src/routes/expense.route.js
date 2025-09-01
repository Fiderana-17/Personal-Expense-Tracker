import express from 'express';
import { getAllExpenses,createExpense,getExpenseById,updateExpense,deleteExpense} from '../controllers/expense.controller.js';

const router = express.Router();

// GET /api/expenses
router.get('/', getAllExpenses);
// POST /api/expenses
router.post('/', createExpense);
// GET /api/expenses/:userId
router.get('/:id', getExpenseById);
// PUT /api/expenses/:id
router.put('/:id', updateExpense);
// DELETE /api/expenses/:id
router.delete('/:id', deleteExpense);

export default router;