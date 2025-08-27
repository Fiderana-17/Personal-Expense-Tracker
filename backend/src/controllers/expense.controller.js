import prisma from '../prismaClient.js';

//  Get a list of all expenses for the user
export const getExpensesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const expenses = await prisma.expense.findMany({
      where: { userId: parseInt(userId) },
      include: { category: true, receipt: true },
    });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error });
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


//  Create a new expense
export const createExpense = async (req, res) => {
  try {
    const { amount, description, type, date, startDate, endDate, userId, categoryId } = req.body;

    if (!amount || !userId || !categoryId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

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

    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating expense', error });
  }
};

// Update an existing expense
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, type, date, startDate, endDate, categoryId } = req.body;

    const expense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        description,
        type,
        date: date ? new Date(date) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        categoryId: categoryId !== undefined ? parseInt(categoryId) : undefined,
      },
    });

    res.status(200).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating expense', error });
  }
};


