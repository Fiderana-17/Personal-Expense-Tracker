import express from 'express';
import {createExpense,getExpensesByUser,getExpenseById,updateExpense,deleteExpense} from '../controllers/expense.controller.js';

const router = express.Router();

// POST /api/expenses
router.post('/', createExpense);

// GET /api/expenses/user/:userId
router.get('/user/:userId', getExpensesByUser);

// GET /api/expenses/:id
router.get('/:id', getExpenseById);

// PUT /api/expenses/:id
router.put('/:id', updateExpense);

// DELETE /api/expenses/:id
router.delete('/:id', deleteExpense);

export default router;