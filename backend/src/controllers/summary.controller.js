import prisma from "../prismaClient.js";
import dayjs from "dayjs";

// 📊 GET /api/summary/monthly
export const getMonthlySummary = async (req, res) => {
  try {
    const { month } = req.query;
    const userId = req.user.id;

    // Si pas de "month" fourni → mois courant
    const start = month
      ? dayjs(month + "-01").startOf("month")
      : dayjs().startOf("month");
    const end = start.endOf("month");

    const income = await prisma.expense.aggregate({
      where: { userId, type: "income", date: { gte: start.toDate(), lte: end.toDate() } },
      _sum: { amount: true },
    });

    const spending = await prisma.expense.aggregate({
      where: { userId, type: "expense", date: { gte: start.toDate(), lte: end.toDate() } },
      _sum: { amount: true },
    });

    res.json({
      month: start.format("YYYY-MM"),
      totalIncome: income._sum.amount || 0,
      totalSpending: spending._sum.amount || 0,
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

    const income = await prisma.expense.aggregate({
      where: { userId, type: "income", date: { gte: new Date(start), lte: new Date(end) } },
      _sum: { amount: true },
    });

    const spending = await prisma.expense.aggregate({
      where: { userId, type: "expense", date: { gte: new Date(start), lte: new Date(end) } },
      _sum: { amount: true },
    });

    res.json({
      start,
      end,
      totalIncome: income._sum.amount || 0,
      totalSpending: spending._sum.amount || 0,
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

    const income = await prisma.expense.aggregate({
      where: { userId, type: "income", date: { gte: start.toDate(), lte: end.toDate() } },
      _sum: { amount: true },
    });

    const spending = await prisma.expense.aggregate({
      where: { userId, type: "expense", date: { gte: start.toDate(), lte: end.toDate() } },
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
