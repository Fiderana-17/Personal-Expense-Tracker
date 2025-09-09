import prisma from "../prismaClient.js";
import dayjs from "dayjs";

// 📊 GET /api/summary/monthly
export const getMonthlySummary = async (req, res) => {
  try {
    const { month } = req.query;
    const userId = req.user.id;

    const start = month
      ? dayjs(month + "-01").startOf("month")
      : dayjs().startOf("month");
    const end = start.endOf("month");

    const income = await prisma.income.aggregate({
      where: { userId, date: { gte: start.toDate(), lte: end.toDate() } },
      _sum: { amount: true },
    });

    const spending = await prisma.expense.aggregate({
      where: { userId, date: { gte: start.toDate(), lte: end.toDate() } },
      _sum: { amount: true },
    });

    res.json({
      income: income._sum.amount || 0,
      expense: spending._sum.amount || 0,
      balance: (income._sum.amount || 0) - (spending._sum.amount || 0),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching monthly summary", error });
  }
};

// 📊 GET /api/summary?start=YYYY-MM-DD&end=YYYY-MM-DD
export const getSummaryBetweenDates = async (req, res) => {
  try {
    const { start, end } = req.query;
    const userId = req.user.id;

    if (!start || !end) {
      return res.status(400).json({ message: "start and end dates are required" });
    }

    const income = await prisma.income.aggregate({
      where: { userId, date: { gte: new Date(start), lte: new Date(end) } },
      _sum: { amount: true },
    });

    const spending = await prisma.expense.aggregate({
      where: { userId, date: { gte: new Date(start), lte: new Date(end) } },
      _sum: { amount: true },
    });

    res.json({
      start,
      end,
      income: income._sum.amount || 0,
      expense: spending._sum.amount || 0,
      balance: (income._sum.amount || 0) - (spending._sum.amount || 0),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching summary", error });
  }
};

// 🚨 GET /api/summary/alerts
export const getAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const start = dayjs().startOf("month");
    const end = dayjs().endOf("month");

    const income = await prisma.income.aggregate({
      where: { userId, date: { gte: start.toDate(), lte: end.toDate() } },
      _sum: { amount: true },
    });

    const spending = await prisma.expense.aggregate({
      where: { userId, date: { gte: start.toDate(), lte: end.toDate() } },
      _sum: { amount: true },
    });

    const totalIncome = income._sum.amount || 0;
    const totalSpending = spending._sum.amount || 0;

    if (totalSpending > totalIncome) {
      return res.json({
        alert: true,
        message: `⚠️ You've exceeded your monthly budget by $${(totalSpending - totalIncome).toFixed(2)}`,
      });
    }

    res.json({ alert: false, message: "✅ You're within your budget" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching alerts", error });
  }
};

// 📊 GET /api/summary/recent
export const getRecentTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer les 5 dernières dépenses
    const expenses = await prisma.expense.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 5,
    });

    // Récupérer les 5 derniers revenus
    const incomes = await prisma.income.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
    });

    // Combiner et formater les transactions
    const transactions = [
      ...expenses.map((exp) => ({
        id: exp.id,
        amount: exp.amount,
        description: exp.description,
        date: exp.date.toISOString(),
        type: "expense",
        category: exp.category ? { name: exp.category.name } : undefined,
      })),
      ...incomes.map((inc) => ({
        id: inc.id,
        amount: inc.amount,
        description: inc.description || inc.source,
        date: inc.date.toISOString(),
        type: "income",
        category: undefined,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching recent transactions", error });
  }
};

// 📊 GET /api/summary/chart
export const getMonthlyExpensesSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const monthsBack = 6; // Par exemple, les 6 derniers mois
    const summaries = [];

    for (let i = 0; i < monthsBack; i++) {
      const start = dayjs().subtract(i, "month").startOf("month");
      const end = start.endOf("month");

      const income = await prisma.income.aggregate({
        where: { userId, date: { gte: start.toDate(), lte: end.toDate() } },
        _sum: { amount: true },
      });

      const spending = await prisma.expense.aggregate({
        where: { userId, date: { gte: start.toDate(), lte: end.toDate() } },
        _sum: { amount: true },
      });

      summaries.push({
        month: start.format("YYYY-MM"),
        income: income._sum.amount || 0,
        expenses: spending._sum.amount || 0,
      });
    }

    res.json(summaries.reverse()); // Inverser pour avoir les mois dans l'ordre chronologique
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching chart data", error });
  }
};