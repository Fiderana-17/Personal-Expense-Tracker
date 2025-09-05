import prisma from '../prismaClient.js';

// GET /api/reports
export const getReports = async (req, res) => {
  try {
    const userId = req.user.id; // récupéré via JWT

    // Récupérer toutes les dépenses et revenus de l'utilisateur
    const expenses = await prisma.expense.findMany({
      where: { userId: Number(userId) },
      include: { category: true }
    });

    const incomes = await prisma.income.findMany({
      where: { userId: Number(userId) },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    const expenseBreakdown = expenses.map((e) => ({
      category: e.category?.name ?? 'Unknown',
      amount: e.amount,
      percentage: totalExpenses ? Math.round((e.amount / totalExpenses) * 100) : 0,
    }));

    res.json({ totalExpenses, totalIncome, netBalance, expenseBreakdown });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération du report', error: error.message });
  }
};
