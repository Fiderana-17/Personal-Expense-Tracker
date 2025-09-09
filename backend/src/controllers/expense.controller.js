import prisma from '../prismaClient.js';
import fs from 'fs';
import { upload } from '../controllers/receipt.controller.js'

// Get all expenses

export const getAllExpenses = async (req, res) => {
  try {
    const { userId } = req.query;

    const expenses = await prisma.expense.findMany({
      where: userId ? { userId: Number(userId) } : undefined,
      include: { category: true, receipt: true, user: true },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des dépenses',
      error: error.message,
    });
  }
};


//  Get a single expense by ID
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(id) },
      include: { category: true, receipt: true },
    });

    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expense', error });
  }
};


// Create a new expense
export const createExpense = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.status(400).json({ message: err.message });

    try {
      const { amount, description, type, date, startDate, endDate, userId, categoryId } = req.body;

      if (!amount || !userId || !categoryId) {
        return res.status(400).json({ message: 'Fields amount, userId and categoryId are required' });
      }

      // 1. Création de l’expense
      const expense = await prisma.expense.create({
        data: {
          amount: parseFloat(amount),
          description,
          type: type || 'ONE_TIME',
          date: date ? new Date(date) : null,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          userId: parseInt(userId),
          categoryId: parseInt(categoryId),
        },
      });

      // 2. Si un fichier est envoyé → on crée aussi le receipt
      if (req.file) {
        await prisma.receipt.create({
          data: {
            filePath: req.file.path,
            expenseId: expense.id,
          },
        });
      }

      // 3. Retour avec le receipt inclus
      const expenseWithReceipt = await prisma.expense.findUnique({
        where: { id: expense.id },
        include: { category: true, receipt: true },
      });

      res.status(201).json({
        message: "Expense created successfully",
        data: expenseWithReceipt,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating expense', error });
    }
  });
};

// Update an existing expense
export const updateExpense = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.status(400).json({ message: err.message });

    try {
      const { id } = req.params;
      const { amount, description, type, date, startDate, endDate, categoryId } = req.body;

      // Vérifier que l'expense existe
      const existingExpense = await prisma.expense.findUnique({
        where: { id: parseInt(id) },
        include: { receipt: true },
      });

      if (!existingExpense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      // 1. Mise à jour de l'expense
      const expense = await prisma.expense.update({
        where: { id: parseInt(id) },
        data: {
          amount: amount !== undefined ? parseFloat(amount) : existingExpense.amount,
          description: description ?? existingExpense.description,
          type: type ?? existingExpense.type,
          date: date ? new Date(date) : existingExpense.date,
          startDate: startDate ? new Date(startDate) : existingExpense.startDate,
          endDate: endDate ? new Date(endDate) : existingExpense.endDate,
          categoryId: categoryId !== undefined ? parseInt(categoryId) : existingExpense.categoryId,
        },
      });

      // 2. Si un fichier est envoyé → on met à jour le receipt
      if (req.file) {
        if (existingExpense.receipt) {
          // Supprimer l'ancien fichier
          try {
            fs.unlinkSync(existingExpense.receipt.filePath);
          } catch (err) {
            console.warn("Could not delete old receipt:", err.message);
          }

          // Mettre à jour en BD
          await prisma.receipt.update({
            where: { id: existingExpense.receipt.id },
            data: { filePath: req.file.path },
          });
        } else {
          // Sinon, créer un nouveau receipt
          await prisma.receipt.create({
            data: {
              filePath: req.file.path,
              expenseId: expense.id,
            },
          });
        }
      }

      // 3. Retour avec le receipt inclus
      const expenseWithReceipt = await prisma.expense.findUnique({
        where: { id: expense.id },
        include: { category: true, receipt: true },
      });

      res.status(200).json({
        message: "Expense updated successfully",
        data: expenseWithReceipt,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating expense", error });
    }
  });
};

// Delete an expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.expense.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error });
  }
};




