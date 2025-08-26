import prisma from '../prismaClient.js';

//  Récupérer toutes les dépenses d’un utilisateur
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

//  Récupérer une dépense par ID
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


