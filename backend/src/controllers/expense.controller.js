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


